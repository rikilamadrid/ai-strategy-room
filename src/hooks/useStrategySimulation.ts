"use client";

import { useEffect } from "react";

import {
  AdvisorError,
  ModeratorError,
  PlannerError,
  requestAdvisors,
  requestModerator,
  requestPlan,
} from "@/lib/ai/strategy-api";
import type { AdvisorPerspective } from "@/lib/ai/schemas";
import { useStrategyStore } from "@/stores/strategy-store";

/**
 * Drives the workflow after `startSession` bumps `runId`: planning → advising →
 * mapping → moderating → complete.
 *
 * As of feature 15 every stage is backed by a real network call — the workflow
 * is the full 2–3-request/session budget end to end. Call #1 (planner)
 * classifies the question and picks the four roles; call #2 (advisor batch)
 * returns all four perspectives in one structured response; call #3 (moderator)
 * synthesizes those four validated perspectives into the single decision brief.
 * Because the advisor step is a single batch call, the four advisors are
 * genuinely in flight together and settle together (no faked one-at-a-time
 * settle). The moderator call is genuinely in flight across the mapping →
 * moderating tail — the brief that stamps in on `complete` is its validated
 * output, not a fixture.
 *
 * Every state change is real store state, so the gauges and timeline animate
 * against genuine workflow status (no fake glow). A planner, advisor, or
 * moderator failure routes to the store's `error` path instead of advancing.
 */

/** In-theme, non-leaking failure copy per typed planner-error code. */
function plannerFailureMessage(error: unknown): string {
  if (error instanceof PlannerError && error.code === "not_configured") {
    return "Planner offline — AI provider not configured";
  }
  return "Planner instrument faulted — signal lost";
}

/** In-theme, non-leaking failure copy per typed advisor-error code. */
function advisorFailureMessage(error: unknown): string {
  if (error instanceof AdvisorError && error.code === "not_configured") {
    return "Advisors offline — AI provider not configured";
  }
  return "Advisor panel faulted — signal lost";
}

/** In-theme, non-leaking failure copy per typed moderator-error code. */
function moderatorFailureMessage(error: unknown): string {
  if (error instanceof ModeratorError && error.code === "not_configured") {
    return "Moderator offline — AI provider not configured";
  }
  return "Moderator instrument faulted — signal lost";
}

function formatElapsed(startedAt: number): string {
  const totalSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function useStrategySimulation(): void {
  const runId = useStrategyStore((state) => state.runId);

  useEffect(() => {
    // runId === 0 means no session has been started (idle / reset) — nothing to
    // drive. Re-running only happens when a new session bumps runId, which
    // cancels the previous run via the cleanup below.
    if (runId === 0) {
      return;
    }

    const store = useStrategyStore.getState;
    const startedAt = Date.now();
    // A new session (or reset) bumps runId and cancels this run: async resolutions
    // check `cancelled` before touching the store and in-flight fetches are aborted.
    let cancelled = false;
    const controller = new AbortController();

    const log = (message: string) => {
      store().logTimelineEvent(message, formatElapsed(startedAt));
    };

    // Bind each real perspective back to its seat by the id the planner chose,
    // falling back to position if the model didn't echo an id cleanly. The batch
    // schema guarantees exactly four perspectives, so every seat resolves.
    const applyPerspectives = (perspectives: AdvisorPerspective[]) => {
      const byId = new Map(perspectives.map((p) => [p.id, p]));
      const advisors = store().advisors;

      advisors.forEach((advisor, index) => {
        const perspective = byId.get(advisor.id) ?? perspectives[index];
        if (!perspective) {
          return;
        }
        store().setAdvisorResult(advisor.id, {
          argument: perspective.argument,
          confidence: perspective.confidence,
          risks: perspective.risks,
          status: "complete",
        });
      });

      log("Advisors filed their arguments");
    };

    void (async () => {
      // planning — the real planner call. On success it replaces the seeded roster
      // with the chosen roles and stamps the constraints row.
      let plan;
      try {
        const result = await requestPlan(store().question, controller.signal);
        if (cancelled) {
          return;
        }
        plan = result.plan;
        store().applyPlannerResult(plan, formatElapsed(startedAt));
      } catch (error) {
        if (cancelled) {
          return;
        }
        store().failWorkflow(plannerFailureMessage(error), formatElapsed(startedAt));
        return;
      }

      // advising — the real advisor batch. Every seat begins deliberating while
      // the single request is genuinely in flight, then all settle when it lands.
      store().advanceStage("advising");
      store().advisors.forEach((advisor) => store().setAdvisorStatus(advisor.id, "thinking"));
      log("Advisors deliberating in parallel");

      let perspectives: AdvisorPerspective[];
      try {
        const result = await requestAdvisors(store().question, plan, controller.signal);
        if (cancelled) {
          return;
        }
        perspectives = result.advisors;
        applyPerspectives(perspectives);
      } catch (error) {
        if (cancelled) {
          return;
        }
        store().failWorkflow(advisorFailureMessage(error), formatElapsed(startedAt));
        return;
      }

      // mapping → moderating — the real moderator call (#3) is genuinely in flight
      // across this tail. mapping is the hand-off beat; the call's latency is spent
      // in `moderating`, where the moderator actually synthesizes the brief.
      store().advanceStage("mapping");
      log("Mapping agreements and conflicts");
      store().advanceStage("moderating");
      log("Moderator synthesizing the brief");

      try {
        const { brief } = await requestModerator(
          store().question,
          plan,
          perspectives,
          controller.signal,
        );
        if (cancelled) {
          return;
        }
        // complete — the validated decision brief stamps in (wax-seal reveal).
        store().advanceStage("complete");
        store().setBrief(brief);
        log("Decision brief sealed");
        store().sealTimeline();
      } catch (error) {
        if (cancelled) {
          return;
        }
        store().failWorkflow(moderatorFailureMessage(error), formatElapsed(startedAt));
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [runId]);
}
