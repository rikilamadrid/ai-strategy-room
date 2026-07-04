import type { TokenUsage } from "./client";
import type {
  AdvisorPerspective,
  DecisionBriefOutput,
  PlannerOutput,
} from "./schemas";

/**
 * The client ↔ `/api/strategy` contract. Kept in one place so the route handler
 * (server) and the workflow hook (client) share exactly the same shapes — the
 * route never leaks provider specifics or raw model text across this seam, only
 * the schema-validated `PlannerOutput`.
 */

/** Request body for the planner action — call #1, the first of the 2–3/session budget. */
export interface PlanRequestBody {
  action: "plan";
  question: string;
}

/**
 * Request body for the advisor action (feature 14). The client sends back the
 * validated plan from step #1 — this app is stateless, so the roster + constraints
 * the advisors reason from ride along with the request rather than living server-side.
 */
export interface AdviseRequestBody {
  action: "advise";
  question: string;
  plan: PlannerOutput;
}

/**
 * Request body for the moderator action (feature 15) — call #3, the final of the
 * 2–3/session budget. The stateless client sends back both the validated plan
 * (for advisor display names) and the four validated perspectives; the moderator
 * synthesizes them into the single decision brief rather than re-deriving them.
 */
export interface ModerateRequestBody {
  action: "moderate";
  question: string;
  plan: PlannerOutput;
  advisors: AdvisorPerspective[];
}

/**
 * Request body for the single-advisor regenerate action (feature 10, made real
 * by feature 16). Re-prompts exactly one role from the already-validated plan —
 * never cached, since the point is a fresh take each time.
 */
export interface RegenerateRequestBody {
  action: "regenerate";
  question: string;
  plan: PlannerOutput;
  roleId: string;
}

/** Cost/observability fields every strategy-action success payload carries. */
interface CostFields {
  usage: TokenUsage;
  model: string;
  /** True when the result came from the in-memory cache — no live model call. */
  cacheHit: boolean;
  /** Wall-clock time spent in the request, in milliseconds (0 on a cache hit). */
  latencyMs: number;
}

/** Successful planner payload: the validated plan plus cost/observability fields. */
export interface PlanSuccess extends CostFields {
  plan: PlannerOutput;
}

/** Successful advisor payload: the four validated perspectives plus cost fields. */
export interface AdviseSuccess extends CostFields {
  advisors: AdvisorPerspective[];
}

/** Successful moderator payload: the validated decision brief plus cost fields. */
export interface ModerateSuccess extends CostFields {
  brief: DecisionBriefOutput;
}

/** Successful regenerate payload: the one validated perspective plus cost fields. */
export interface RegenerateSuccess extends CostFields {
  perspective: AdvisorPerspective;
}

/** Typed error codes the route can return — the client maps these to in-theme messages. */
export type PlanErrorCode =
  | "invalid_request"
  | "not_configured"
  | "planner_failed";

/** Advisor-action error codes (mirror the planner's, with the advisor failure). */
export type AdvisorErrorCode =
  | "invalid_request"
  | "not_configured"
  | "advisor_failed";

/** Moderator-action error codes (mirror the others, with the moderator failure). */
export type ModeratorErrorCode =
  | "invalid_request"
  | "not_configured"
  | "moderator_failed";

/** Regenerate-action error codes — the single-advisor call shares the advisor's. */
export type RegenerateErrorCode = AdvisorErrorCode;

export interface PlanErrorBody {
  code: PlanErrorCode;
  message: string;
}

export interface AdvisorErrorBody {
  code: AdvisorErrorCode;
  message: string;
}

export interface ModeratorErrorBody {
  code: ModeratorErrorCode;
  message: string;
}

export interface RegenerateErrorBody {
  code: RegenerateErrorCode;
  message: string;
}

/** Discriminated response envelope — `ok` narrows success vs. typed error. */
export type PlanApiResponse =
  | ({ ok: true } & PlanSuccess)
  | { ok: false; error: PlanErrorBody };

export type AdviseApiResponse =
  | ({ ok: true } & AdviseSuccess)
  | { ok: false; error: AdvisorErrorBody };

export type ModerateApiResponse =
  | ({ ok: true } & ModerateSuccess)
  | { ok: false; error: ModeratorErrorBody };

export type RegenerateApiResponse =
  | ({ ok: true } & RegenerateSuccess)
  | { ok: false; error: RegenerateErrorBody };

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

  return {
    plan: data.plan,
    usage: data.usage,
    model: data.model,
    cacheHit: data.cacheHit,
    latencyMs: data.latencyMs,
  };
}

/**
 * Thrown by `requestAdvisors` when the advisor batch fails for any reason — the
 * typed `code` lets the caller surface a specific, non-leaking error state rather
 * than passing malformed perspectives downstream (feature 14 goal).
 */
export class AdvisorError extends Error {
  readonly code: AdvisorErrorCode;

  constructor(code: AdvisorErrorCode, message: string) {
    super(message);
    this.name = "AdvisorError";
    this.code = code;
  }
}

/**
 * POST the question + validated plan to the advisor action and return the four
 * schema-validated perspectives. Rejects with an `AdvisorError` on a network
 * failure, a non-2xx response, or a typed error body — the caller surfaces a
 * visible error state rather than a silent fallback (CLAUDE.md → "A failed
 * validation is a visible error state").
 */
export async function requestAdvisors(
  question: string,
  plan: PlannerOutput,
  signal?: AbortSignal,
): Promise<AdviseSuccess> {
  let response: Response;
  try {
    response = await fetch("/api/strategy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "advise",
        question,
        plan,
      } satisfies AdviseRequestBody),
      signal,
    });
  } catch {
    throw new AdvisorError("advisor_failed", "The advisors could not be reached.");
  }

  let data: AdviseApiResponse;
  try {
    data = (await response.json()) as AdviseApiResponse;
  } catch {
    throw new AdvisorError("advisor_failed", "The advisors returned an unreadable response.");
  }

  if (!response.ok || !data.ok) {
    const error = !data.ok
      ? data.error
      : { code: "advisor_failed" as const, message: "The advisor call failed." };
    throw new AdvisorError(error.code, error.message);
  }

  return {
    advisors: data.advisors,
    usage: data.usage,
    model: data.model,
    cacheHit: data.cacheHit,
    latencyMs: data.latencyMs,
  };
}

/**
 * Thrown by `requestModerator` when the moderator call fails for any reason — the
 * typed `code` lets the caller surface a specific, non-leaking error state rather
 * than passing a malformed brief downstream (feature 15 goal).
 */
export class ModeratorError extends Error {
  readonly code: ModeratorErrorCode;

  constructor(code: ModeratorErrorCode, message: string) {
    super(message);
    this.name = "ModeratorError";
    this.code = code;
  }
}

/**
 * POST the question + validated plan + validated perspectives to the moderator
 * action and return the schema-validated decision brief. Rejects with a
 * `ModeratorError` on a network failure, a non-2xx response, or a typed error
 * body — the caller surfaces a visible error state rather than a silent fallback
 * (CLAUDE.md → "A failed validation is a visible error state").
 */
export async function requestModerator(
  question: string,
  plan: PlannerOutput,
  advisors: AdvisorPerspective[],
  signal?: AbortSignal,
): Promise<ModerateSuccess> {
  let response: Response;
  try {
    response = await fetch("/api/strategy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "moderate",
        question,
        plan,
        advisors,
      } satisfies ModerateRequestBody),
      signal,
    });
  } catch {
    throw new ModeratorError("moderator_failed", "The moderator could not be reached.");
  }

  let data: ModerateApiResponse;
  try {
    data = (await response.json()) as ModerateApiResponse;
  } catch {
    throw new ModeratorError("moderator_failed", "The moderator returned an unreadable response.");
  }

  if (!response.ok || !data.ok) {
    const error = !data.ok
      ? data.error
      : { code: "moderator_failed" as const, message: "The moderator call failed." };
    throw new ModeratorError(error.code, error.message);
  }

  return {
    brief: data.brief,
    usage: data.usage,
    model: data.model,
    cacheHit: data.cacheHit,
    latencyMs: data.latencyMs,
  };
}

/**
 * Thrown by `requestRegenerateAdvisor` when the single-advisor call fails for
 * any reason — the typed `code` lets the caller surface a specific,
 * non-leaking error state rather than passing a malformed perspective downstream.
 */
export class RegenerateError extends Error {
  readonly code: RegenerateErrorCode;

  constructor(code: RegenerateErrorCode, message: string) {
    super(message);
    this.name = "RegenerateError";
    this.code = code;
  }
}

/**
 * POST the question + validated plan + target role id to the regenerate action
 * and return the one schema-validated perspective. Rejects with a
 * `RegenerateError` on a network failure, a non-2xx response, or a typed error
 * body — "Try another angle" (feature 10) surfaces a visible error state rather
 * than a silent fallback, same as the other workflow calls. This call is never
 * cached: the point of another angle is a fresh take (CLAUDE.md → "Don't let
 * 'Try another angle' rerun the full workflow").
 */
export async function requestRegenerateAdvisor(
  question: string,
  plan: PlannerOutput,
  roleId: string,
  signal?: AbortSignal,
): Promise<RegenerateSuccess> {
  let response: Response;
  try {
    response = await fetch("/api/strategy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "regenerate",
        question,
        plan,
        roleId,
      } satisfies RegenerateRequestBody),
      signal,
    });
  } catch {
    throw new RegenerateError("advisor_failed", "The advisor could not be reached.");
  }

  let data: RegenerateApiResponse;
  try {
    data = (await response.json()) as RegenerateApiResponse;
  } catch {
    throw new RegenerateError("advisor_failed", "The advisor returned an unreadable response.");
  }

  if (!response.ok || !data.ok) {
    const error = !data.ok
      ? data.error
      : { code: "advisor_failed" as const, message: "The advisor call failed." };
    throw new RegenerateError(error.code, error.message);
  }

  return {
    perspective: data.perspective,
    usage: data.usage,
    model: data.model,
    cacheHit: data.cacheHit,
    latencyMs: data.latencyMs,
  };
}
