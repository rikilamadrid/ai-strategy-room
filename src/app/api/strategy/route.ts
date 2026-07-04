import { NextResponse } from "next/server";

import { createAnthropicClient } from "@/lib/ai/client";
import { plannerSystemPrompt, plannerUserPrompt } from "@/lib/ai/prompts";
import { plannerSchema } from "@/lib/ai/schemas";
import type {
  PlanApiResponse,
  PlanErrorBody,
  PlanErrorCode,
} from "@/lib/ai/strategy-api";

/**
 * The strategy workflow's server seam. Feature 13 wires only the **planner
 * action** — call #1 of the 2–3-request/session budget (overview → "Recommended
 * Call Pattern"). The advisor batch (feature 14) and moderator (feature 15) add
 * their own actions here later.
 *
 * The route validates every model output against `plannerSchema` before it
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

function errorResponse(
  status: number,
  code: PlanErrorCode,
  message: string,
): NextResponse<PlanApiResponse> {
  const error: PlanErrorBody = { code, message };
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: Request): Promise<NextResponse<PlanApiResponse>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "invalid_request", "The request body was not valid JSON.");
  }

  const action = (body as { action?: unknown })?.action;
  if (action !== "plan") {
    return errorResponse(400, "invalid_request", "Unsupported strategy action.");
  }

  const rawQuestion = (body as { question?: unknown })?.question;
  const question = typeof rawQuestion === "string" ? rawQuestion.trim() : "";
  if (!question) {
    return errorResponse(400, "invalid_request", "A question is required.");
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return errorResponse(400, "invalid_request", "The question is too long.");
  }

  // A blank/absent key is "not configured", not a provider error — surface it as
  // a distinct state so the first real call fails clearly (feature 12 carry-forward).
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    return errorResponse(503, "not_configured", "The AI provider is not configured.");
  }

  const client = createAnthropicClient({ apiKey });

  try {
    const { object, usage } = await client.generateStructured({
      schema: plannerSchema,
      schemaName: "StrategyPlan",
      system: plannerSystemPrompt,
      prompt: plannerUserPrompt(question),
      maxOutputTokens: PLANNER_MAX_OUTPUT_TOKENS,
    });

    return NextResponse.json({
      ok: true,
      plan: object,
      usage,
      model: client.model,
    });
  } catch {
    // Covers both provider/transport failures and schema-validation rejections
    // from `generateStructured` — either way the plan is unusable downstream.
    return errorResponse(502, "planner_failed", "The planner could not produce a valid plan.");
  }
}
