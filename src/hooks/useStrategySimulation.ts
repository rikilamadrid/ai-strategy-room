"use client";

import { useEffect } from "react";

import { demoStrategySession } from "@/lib/fixtures";
import { AdvisorError, PlannerError, requestAdvisors, requestPlan } from "@/lib/ai/strategy-api";
import type { AdvisorPerspective } from "@/lib/ai/schemas";
import { useStrategyStore } from "@/stores/strategy-store";

/**
 * Drives the workflow after `startSession` bumps `runId`: planning → advising →
 * mapping → moderating → complete.
 *
 * As of feature 14 the **planning** and **advising** stages are both real
 * network calls — call #1 (planner) classifies the question and picks the four
 * roles; call #2 (advisor batch) returns all four perspectives in one structured
 * response (the cost-target path — overview → "Recommended Call Pattern" step 2,
 * keeping the session at 2–3 requests). Because it's a single batch call, the
 * four advisors are genuinely in flight together and settle together: they all
 * flip to `thinking` when the request fires and to `complete` when it resolves —
 * no faked one-at-a-time settle (that would need four separate calls). The
 * mapping → moderating tail is still a fixture-backed *simulation* on a timer
 * (moderator synthesis is feature 15) — those steps make no network calls.
 *
 * Every state change is real store state, so the gauges and timeline animate
 * against genuine workflow status (no fake glow). A planner or advisor failure
 * routes to the store's `error` path instead of advancing.
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

// Mechanical cadence (ms) for the still-simulated mapping → moderating tail.
// Neither stage is on a real call yet; the planning and advising durations are
// the real calls' latency, not a timer.
const POST_ADVISORS_GAP_MS = 700;
const MAPPING_MS = 1100;
const MODERATING_MS = 1300;

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
    const timers: ReturnType<typeof setTimeout>[] = [];
    // A new session (or reset) bumps runId and cancels this run: async resolutions
    // check `cancelled` before touching the store, in-flight fetches are aborted,
    // and any pending simulation timers are cleared in cleanup.
    let cancelled = false;
    const controller = new AbortController();

    const at = (delay: number, run: () => void) => {
      timers.push(setTimeout(run, delay));
    };

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

    // mapping → complete: still fixture-backed (feature 15 replaces the moderator
    // with a real call). Scheduled only once the real advisor batch has settled.
    const runSimulatedTail = () => {
      // mapping — agreements and conflicts get plotted.
      at(POST_ADVISORS_GAP_MS, () => {
        store().advanceStage("mapping");
        log("Mapping agreements and conflicts");
      });

      // moderating — the moderator synthesizes the brief.
      const moderatingAt = POST_ADVISORS_GAP_MS + MAPPING_MS;
      at(moderatingAt, () => {
        store().advanceStage("moderating");
        log("Moderator synthesizing the brief");
      });

      // complete — the decision brief stamps in.
      at(moderatingAt + MODERATING_MS, () => {
        store().advanceStage("complete");
        store().setBrief(demoStrategySession.decisionBrief);
        log("Decision brief sealed");
        store().sealTimeline();
      });
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

      try {
        const { advisors: perspectives } = await requestAdvisors(
          store().question,
          plan,
          controller.signal,
        );
        if (cancelled) {
          return;
        }
        applyPerspectives(perspectives);
      } catch (error) {
        if (cancelled) {
          return;
        }
        store().failWorkflow(advisorFailureMessage(error), formatElapsed(startedAt));
        return;
      }

      runSimulatedTail();
    })();

    return () => {
      cancelled = true;
      controller.abort();
      timers.forEach(clearTimeout);
    };
  }, [runId]);
}
