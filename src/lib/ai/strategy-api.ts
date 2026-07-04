import type { TokenUsage } from "./client";
import type { PlannerOutput } from "./schemas";

/**
 * The client ↔ `/api/strategy` contract. Kept in one place so the route handler
 * (server) and the workflow hook (client) share exactly the same shapes — the
 * route never leaks provider specifics or raw model text across this seam, only
 * the schema-validated `PlannerOutput`.
 */

/** Request body for the planner action. More actions (advisor, moderator) land in features 14–15. */
export interface PlanRequestBody {
  action: "plan";
  question: string;
}

/** Successful planner payload: the validated plan plus cost/observability fields. */
export interface PlanSuccess {
  plan: PlannerOutput;
  usage: TokenUsage;
  model: string;
}

/** Typed error codes the route can return — the client maps these to in-theme messages. */
export type PlanErrorCode =
  | "invalid_request"
  | "not_configured"
  | "planner_failed";

export interface PlanErrorBody {
  code: PlanErrorCode;
  message: string;
}

/** Discriminated response envelope — `ok` narrows success vs. typed error. */
export type PlanApiResponse =
  | ({ ok: true } & PlanSuccess)
  | { ok: false; error: PlanErrorBody };

/**
 * Thrown by `requestPlan` when the planner call fails for any reason — a typed
 * error carrying the route's `code` so the caller can craft a specific message
 * rather than passing malformed data downstream (feature 13 goal).
 */
export class PlannerError extends Error {
  readonly code: PlanErrorCode;

  constructor(code: PlanErrorCode, message: string) {
    super(message);
    this.name = "PlannerError";
    this.code = code;
  }
}

/**
 * POST the question to the planner action and return the validated plan. Rejects
 * with a `PlannerError` on a network failure, a non-2xx response, or a typed
 * error body — the caller surfaces a visible error state rather than a silent
 * fallback (CLAUDE.md → "A failed validation is a visible error state").
 */
export async function requestPlan(
  question: string,
  signal?: AbortSignal,
): Promise<PlanSuccess> {
  let response: Response;
  try {
    response = await fetch("/api/strategy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "plan", question } satisfies PlanRequestBody),
      signal,
    });
  } catch {
    throw new PlannerError("planner_failed", "The planner could not be reached.");
  }

  let data: PlanApiResponse;
  try {
    data = (await response.json()) as PlanApiResponse;
  } catch {
    throw new PlannerError("planner_failed", "The planner returned an unreadable response.");
  }

  if (!response.ok || !data.ok) {
    const error = !data.ok
      ? data.error
      : { code: "planner_failed" as const, message: "The planner call failed." };
    throw new PlannerError(error.code, error.message);
  }

  return { plan: data.plan, usage: data.usage, model: data.model };
}
