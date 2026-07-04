"use client";

import { AdvisorSeat } from "@/components/advisors/AdvisorSeat";
import { DecisionBrief } from "@/components/brief/DecisionBrief";
import { CostBadge } from "@/components/observability/CostBadge";
import { QuestionPlate } from "@/components/table/QuestionPlate";
import { WorkflowTimeline } from "@/components/workflow/WorkflowTimeline";
import { useStrategySimulation } from "@/hooks/useStrategySimulation";
import { useStrategyStore } from "@/stores/strategy-store";

export function StrategyTable() {
  const status = useStrategyStore((state) => state.status);
  const sessionCost = useStrategyStore((state) => state.sessionCost);
  const advisors = useStrategyStore((state) => state.advisors);
  const timeline = useStrategyStore((state) => state.timeline);
  const replayLog = useStrategyStore((state) => state.replayLog);
  const replayRunId = useStrategyStore((state) => state.replayRunId);
  const isReplaying = useStrategyStore((state) => state.isReplaying);
  const briefAnimationKey = useStrategyStore((state) => state.briefAnimationKey);
  const decisionBrief = useStrategyStore((state) => state.decisionBrief);
  const startReplay = useStrategyStore((state) => state.startReplay);
  const finishReplay = useStrategyStore((state) => state.finishReplay);

  // Drives the timed workflow progression once a session starts.
  useStrategySimulation();

  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[900px] flex-col px-5 py-7 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-5 rounded-md border-2 border-brass-dark bg-[linear-gradient(180deg,var(--color-bg2),var(--color-bg))] px-5 py-5 shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-brass)_15%,transparent),0_0_24px_color-mix(in_srgb,var(--color-pink)_8%,transparent)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <h1 className="m-0 font-display text-[clamp(2rem,5vw,3.25rem)] font-black leading-none text-brass-light [text-shadow:0_0_10px_var(--color-pink),0_0_2px_var(--color-brass-light)]">
            AI Strategy Table
          </h1>
          <p className="mt-3 font-mechanical text-[11px] uppercase tracking-[0.24em] text-cyan [text-shadow:0_0_6px_color-mix(in_srgb,var(--color-cyan)_60%,transparent)] sm:text-xs">
            a cinematic decision chamber
          </p>
        </div>
        <CostBadge status={status} cost={sessionCost} />
      </header>

      <section className="mt-7 rounded-lg border-2 border-brass-dark bg-[radial-gradient(circle_at_50%_50%,color-mix(in_srgb,var(--color-brass)_7%,transparent),transparent_60%),repeating-radial-gradient(circle_at_50%_50%,color-mix(in_srgb,var(--color-brass)_4%,transparent)_0_2px,transparent_2px_26px),var(--color-bg)] px-5 py-[34px] shadow-[inset_0_0_60px_rgb(0_0_0_/_70%)]">
        <div className="mx-auto mb-[26px] grid max-w-[560px] grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-[60px] sm:gap-y-[18px]">
          {advisors.map((advisor) => (
            <AdvisorSeat key={advisor.id} advisor={advisor} />
          ))}
        </div>
        <QuestionPlate />
      </section>

      <div className="mt-7 grid gap-7 md:grid-cols-2">
        <WorkflowTimeline
          events={timeline}
          replayLog={replayLog}
          canReplay={status === "complete" && replayLog.length > 0}
          isReplaying={isReplaying}
          replayRunId={replayRunId}
          onReplay={startReplay}
          onReplayComplete={finishReplay}
        />
        {decisionBrief ? (
          <DecisionBrief
            key={briefAnimationKey}
            brief={decisionBrief}
          />
        ) : null}
      </div>
    </main>
  );
}
