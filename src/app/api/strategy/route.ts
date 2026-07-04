import { NextResponse } from "next/server";

import { createAnthropicClient } from "@/lib/ai/client";
import {
  advisorBatchSystemPrompt,
  advisorBatchUserPrompt,
  plannerSystemPrompt,
  plannerUserPrompt,
} from "@/lib/ai/prompts";
import { advisorBatchSchema, plannerSchema } from "@/lib/ai/schemas";

/**
 * The strategy workflow's server seam. It dispatches the structured LLM calls
 * that make up the 2–3-request/session budget (overview → "Recommended Call
 * Pattern"): the **planner action** (feature 13, call #1) and the **advisor
 * action** (feature 14, call #2 — all four perspectives in one structured
 * response). The moderator (feature 15) adds its action here later.
 *
 * The route validates every model output against its Zod schema before it
 * crosses back to the client — a validation failure surfaces as a typed error,
 * never malformed data passed downstream (CLAUDE.md → "Structured outputs only").
 * Raw model text is never returned.
 */

// The Anthropic SDK needs the Node.js runtime, and a live LLM call must never be
// cached or statically evaluated.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Matches the question-field ceiling enforced in the UI (QuestionPlate). */
const MAX_QUESTION_LENGTH = 280;

/** Planner output is small — a classification, a few constraints, four roles. */
const PLANNER_MAX_OUTPUT_TOKENS = 512;

/** Four advisors, each capped to a short argument + a few risks — kept tight. */
const ADVISOR_MAX_OUTPUT_TOKENS = 1024;

function errorResponse<Code extends string>(
  status: number,
  code: Code,
  message: string,
): NextResponse {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

/**
 * Validate the caller-supplied question: a non-empty string within the length
 * ceiling. Returns the normalized question or a 400 error response. Client-input
 * checks like this run before the provider-config gate so a bad request always
 * reads as `invalid_request`, never masked by `not_configured`.
 */
function readQuestion(body: unknown):
  | { ok: true; question: string }
  | { ok: false; response: NextResponse } {
  const rawQuestion = (body as { question?: unknown })?.question;
  const question = typeof rawQuestion === "string" ? rawQuestion.trim() : "";
  if (!question) {
    return { ok: false, response: errorResponse(400, "invalid_request", "A question is required.") };
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return { ok: false, response: errorResponse(400, "invalid_request", "The question is too long.") };
  }

  return { ok: true, question };
}

/**
 * The provider-config gate. A blank/absent key is "not configured", not a
 * provider error — surface it as a distinct 503 so the call fails clearly
 * (feature 12 carry-forward). Checked only after client inputs validate.
 */
function requireApiKey():
  | { ok: true; apiKey: string }
  | { ok: false; response: NextResponse } {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      response: errorResponse(503, "not_configured", "The AI provider is not configured."),
    };
  }
  return { ok: true, apiKey };
}

async function handlePlan(body: unknown): Promise<NextResponse> {
  const gate = readQuestion(body);
  if (!gate.ok) {
    return gate.response;
  }

  const key = requireApiKey();
  if (!key.ok) {
    return key.response;
  }

  const client = createAnthropicClient({ apiKey: key.apiKey });

  try {
    const { object, usage } = await client.generateStructured({
      schema: plannerSchema,
      schemaName: "StrategyPlan",
      system: plannerSystemPrompt,
      prompt: plannerUserPrompt(gate.question),
      maxOutputTokens: PLANNER_MAX_OUTPUT_TOKENS,
    });

    return NextResponse.json({ ok: true, plan: object, usage, model: client.model });
  } catch {
    // Covers both provider/transport failures and schema-validation rejections
    // from `generateStructured` — either way the plan is unusable downstream.
    return errorResponse(502, "planner_failed", "The planner could not produce a valid plan.");
  }
}

async function handleAdvise(body: unknown): Promise<NextResponse> {
  const gate = readQuestion(body);
  if (!gate.ok) {
    return gate.response;
  }

  // The plan rides along from the client (stateless app) — re-validate it here so
  // a tampered or malformed roster can't drive the advisor prompt. A client-input
  // check, so it runs before the provider-config gate.
  const parsedPlan = plannerSchema.safeParse((body as { plan?: unknown })?.plan);
  if (!parsedPlan.success) {
    return errorResponse(400, "invalid_request", "A valid plan is required.");
  }

  const key = requireApiKey();
  if (!key.ok) {
    return key.response;
  }

  const client = createAnthropicClient({ apiKey: key.apiKey });

  try {
    const { object, usage } = await client.generateStructured({
      schema: advisorBatchSchema,
      schemaName: "AdvisorPerspectives",
      system: advisorBatchSystemPrompt,
      prompt: advisorBatchUserPrompt({
        question: gate.question,
        roles: parsedPlan.data.advisors,
        constraints: parsedPlan.data.constraints,
      }),
      maxOutputTokens: ADVISOR_MAX_OUTPUT_TOKENS,
    });

    return NextResponse.json({ ok: true, advisors: object.advisors, usage, model: client.model });
  } catch {
    // Provider/transport failure or a schema-validation rejection — either way the
    // batch is unusable, so no partial/unvalidated perspectives cross the seam.
    return errorResponse(502, "advisor_failed", "The advisors could not produce valid perspectives.");
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "invalid_request", "The request body was not valid JSON.");
  }

  const action = (body as { action?: unknown })?.action;
  switch (action) {
    case "plan":
      return handlePlan(body);
    case "advise":
      return handleAdvise(body);
    default:
      return errorResponse(400, "invalid_request", "Unsupported strategy action.");
  }
}
