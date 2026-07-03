"use client";

import { useEffect } from "react";

import { demoStrategySession, simulatedAdvisorResults } from "@/lib/fixtures";
import { useStrategyStore } from "@/stores/strategy-store";

/**
 * Drives a timed, fixture-backed progression through the workflow after
 * `startSession` bumps `runId`: planning → advising (advisors resolve in
 * parallel, staggered) → mapping → moderating → complete.
 *
 * This is a *simulation* on a timer — no network calls, no LLM requests, zero
 * cost-budget impact. Every state change is real store state, so the gauges,
 * timeline, and brief animate against genuine workflow status (no fake glow).
 */

// Mechanical cadence (ms from session start). Tuned so the whole run reads as
// a deliberate machine, not a loading spinner.
const PLANNING_MS = 900;
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

    const at = (delay: number, run: () => void) => {
      timers.push(setTimeout(run, delay));
    };

    const log = (message: string) => {
      store().logTimelineEvent(message, formatElapsed(startedAt));
    };

    // planning — the constraint parser is already running the moment we enter.
    log("Constraints parsed — budget, 3-year horizon");

    // advising — every advisor starts deliberating in parallel.
    at(PLANNING_MS, () => {
      store().advanceStage("advising");
      store()
        .advisors.map((advisor) => advisor.id)
        .forEach((id) => store().setAdvisorStatus(id, "thinking"));
      log("Advisors deliberating in parallel");
    });

    // Advisors resolve in parallel but settle one at a time so the room fills
    // with completed gauges progressively.
    simulatedAdvisorResults.forEach((result, index) => {
      at(FIRST_ADVISOR_MS + index * ADVISOR_STAGGER_MS, () => {
        store().setAdvisorResult(result.id, {
          argument: result.argument,
          confidence: result.confidence,
          risks: result.risks,
          status: "complete",
        });
        const advisor = store().advisors.find((item) => item.id === result.id);
        log(`${advisor?.name ?? "Advisor"} filed its argument`);
      });
    });

    const advisorsDoneAt =
      FIRST_ADVISOR_MS +
      (simulatedAdvisorResults.length - 1) * ADVISOR_STAGGER_MS;

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

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [runId]);
}
