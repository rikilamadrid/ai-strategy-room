"use client";

import { useEffect } from "react";

import {
  demoStrategySession,
  simulatedAdvisorResults,
  simulatedErrorAdvisorId,
} from "@/lib/fixtures";
import { PlannerError, requestPlan } from "@/lib/ai/strategy-api";
import { useStrategyStore } from "@/stores/strategy-store";

/**
 * Drives the workflow after `startSession` bumps `runId`: planning → advising
 * (advisors resolve in parallel, staggered) → mapping → moderating → complete.
 *
 * As of feature 13 the **planning** stage is a real network call — the planner
 * classifies the question, extracts constraints, and chooses the four advisor
 * roles (call #1 of the 2–3/session budget). Everything from `advising` onward
 * is still a fixture-backed *simulation* on a timer (advisor generation is
 * feature 14, moderator synthesis feature 15) — those steps make no network
 * calls and cost nothing. Because the planner now picks question-specific
 * advisor ids that no longer match the fixture ids, the simulated advisor
 * outputs are assigned to the live seats **by position**, not by id.
 *
 * Every state change is real store state, so the gauges, timeline, and brief
 * animate against genuine workflow status (no fake glow). A planner failure
 * routes to the store's `error` path instead of advancing.
 */

/** In-theme, non-leaking failure copy per typed planner-error code. */
function plannerFailureMessage(error: unknown): string {
  if (error instanceof PlannerError && error.code === "not_configured") {
    return "Planner offline — AI provider not configured";
  }
  return "Planner instrument faulted — signal lost";
}

// Mechanical cadence (ms from when advising begins). Tuned so the run reads as a
// deliberate machine, not a loading spinner. The planning stage is no longer on
// a timer — its duration is the real planner call's latency.
const FIRST_ADVISOR_MS = 1800;
const ADVISOR_STAGGER_MS = 1100;
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
    // A new session (or reset) bumps runId and cancels this run: the async
    // planner resolution checks `cancelled` before it touches the store, and any
    // pending simulation timers are cleared in cleanup.
    let cancelled = false;

    const at = (delay: number, run: () => void) => {
      timers.push(setTimeout(run, delay));
    };

    const log = (message: string) => {
      store().logTimelineEvent(message, formatElapsed(startedAt));
    };

    // advising → complete: the fixture-backed simulation (features 14–15 will
    // replace these with real advisor/moderator calls). Scheduled only once the
    // real planner has settled the roster.
    const runSimulatedRemainder = () => {
      // advising — every advisor starts deliberating in parallel.
      store().advanceStage("advising");
      const advisors = store().advisors;
      advisors.forEach((advisor) => store().setAdvisorStatus(advisor.id, "thinking"));
      log("Advisors deliberating in parallel");

      // Advisors resolve in parallel but settle one at a time so the room fills
      // with completed gauges progressively. The planner's roles no longer share
      // the fixtures' ids, so results are matched to the live seats by position.
      advisors.forEach((advisor, index) => {
        const result = simulatedAdvisorResults[index];
        if (!result) {
          return;
        }

        at(FIRST_ADVISOR_MS + index * ADVISOR_STAGGER_MS, () => {
          // Failure path: the flagged seat faults instead of filing. The rest of
          // the workflow is unaffected — mapping/moderating still proceed, and
          // "Try another angle" on the seat can recover it.
          if (result.id === simulatedErrorAdvisorId) {
            store().setAdvisorStatus(advisor.id, "error");
            store().logAdvisorError(
              `${advisor.name} instrument faulted — signal lost`,
              formatElapsed(startedAt),
            );
            return;
          }

          store().setAdvisorResult(advisor.id, {
            argument: result.argument,
            confidence: result.confidence,
            risks: result.risks,
            status: "complete",
          });
          log(`${advisor.name} filed its argument`);
        });
      });

      const advisorsDoneAt =
        FIRST_ADVISOR_MS + (advisors.length - 1) * ADVISOR_STAGGER_MS;

      // mapping — agreements and conflicts get plotted.
      const mappingAt = advisorsDoneAt + POST_ADVISORS_GAP_MS;
      at(mappingAt, () => {
        store().advanceStage("mapping");
        log("Mapping agreements and conflicts");
      });

      // moderating — the moderator synthesizes the brief.
      const moderatingAt = mappingAt + MAPPING_MS;
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

    // planning — the real planner call. On success it replaces the seeded roster
    // with the chosen roles and stamps the constraints row; on failure the
    // session routes to the store's `error` path and the run stops.
    void (async () => {
      try {
        const { plan } = await requestPlan(store().question);
        if (cancelled) {
          return;
        }
        store().applyPlannerResult(plan, formatElapsed(startedAt));
        runSimulatedRemainder();
      } catch (error) {
        if (cancelled) {
          return;
        }
        store().failWorkflow(plannerFailureMessage(error), formatElapsed(startedAt));
      }
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [runId]);
}
