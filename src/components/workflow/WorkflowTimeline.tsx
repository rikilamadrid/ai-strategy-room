"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { steppedEase } from "@/lib/motion";
import type { TimelineEvent } from "@/types/strategy";

interface WorkflowTimelineProps {
  events: TimelineEvent[];
  replayLog: TimelineEvent[];
  canReplay: boolean;
  isReplaying: boolean;
  replayRunId: number;
  onReplay: () => void;
  onReplayComplete: () => void;
}

const stateClassName: Record<TimelineEvent["state"], string> = {
  done: "text-success",
  now: "text-amber",
  pending: "text-cyan/55",
  // Muted wax-red, lifted with a neon glow so it stays legible on gunmetal.
  error:
    "text-seal [text-shadow:0_0_7px_color-mix(in_srgb,var(--color-seal)_75%,transparent)]",
};

const MS_PER_CHAR = 18;
const REPLAY_ROW_FLOOR_MS = 360;
const REPLAY_ROW_SETTLE_MS = 220;

/**
 * Reveals a line of timeline text teletype-style — one character at a time with
 * a blinking punch caret — rather than printing it all at once. Reduced motion
 * shows the finished line immediately.
 */
function Teletype({ text, active }: { text: string; active: boolean }) {
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setCount(current);
      if (current >= text.length) {
        clearInterval(interval);
      }
    }, MS_PER_CHAR);

    return () => clearInterval(interval);
  }, [text, reduceMotion]);

  if (reduceMotion) {
    return <span>{text}</span>;
  }

  const typing = count < text.length;

  return (
    <span>
      {text.slice(0, count)}
      {typing && active ? (
        <span className="ml-0.5 inline-block w-[0.5ch] animate-pulse bg-amber/70 text-transparent">
          .
        </span>
      ) : null}
    </span>
  );
}

function getReplayRowDelay(message: string): number {
  return Math.max(REPLAY_ROW_FLOOR_MS, message.length * MS_PER_CHAR + 180);
}

function cloneEvents(events: TimelineEvent[]): TimelineEvent[] {
  return events.map((event) => ({ ...event }));
}

export function WorkflowTimeline({
  events,
  replayLog,
  canReplay,
  isReplaying,
  replayRunId,
  onReplay,
  onReplayComplete,
}: WorkflowTimelineProps) {
  const reduceMotion = useReducedMotion();
  const [replayState, setReplayState] = useState<{
    runId: number;
    events: TimelineEvent[];
  }>({ runId: 0, events: [] });

  useEffect(() => {
    if (!isReplaying) {
      return;
    }

    if (reduceMotion) {
      const finishTimer = setTimeout(() => {
        onReplayComplete();
      }, 0);

      return () => clearTimeout(finishTimer);
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const replayRows = cloneEvents(replayLog);
    const settledRows = cloneEvents(events);
    let elapsed = 180;

    replayRows.forEach((event) => {
      const replayRowState = event.state === "error" ? "error" : "now";

      timers.push(
        setTimeout(() => {
          setReplayState((current) => ({
            runId: replayRunId,
            events: [
              ...current.events.map((item) =>
                item.state === "now"
                  ? { ...item, state: "done" as const }
                  : item,
              ),
              { ...event, state: replayRowState },
            ],
          }));
        }, elapsed),
      );

      elapsed += getReplayRowDelay(event.message);
    });

    timers.push(
      setTimeout(() => {
        setReplayState({
          runId: replayRunId,
          events: settledRows,
        });
        onReplayComplete();
      }, elapsed + REPLAY_ROW_SETTLE_MS),
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [
    events,
    isReplaying,
    onReplayComplete,
    reduceMotion,
    replayLog,
    replayRunId,
  ]);

  const displayEvents = isReplaying
    ? reduceMotion
      ? events
      : replayState.runId === replayRunId
        ? replayState.events
        : []
    : events;

  return (
    <section className="min-h-[260px] rounded-md border-2 border-brass-dark bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg)_92%,transparent),color-mix(in_srgb,var(--color-bg2)_45%,transparent))] px-[18px] py-4 font-mechanical text-xs leading-[1.9] text-cyan shadow-[inset_0_0_42px_rgb(0_0_0_/_60%)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="m-0 font-display text-sm font-black uppercase tracking-[0.04em] text-brass-light">
          Live discussion
        </h2>
        <button
          type="button"
          onClick={onReplay}
          disabled={!canReplay || isReplaying}
          className="rounded-sm border border-brass-dark px-2 py-1 font-mechanical text-[10px] uppercase tracking-[0.14em] text-brass transition-colors enabled:hover:border-brass enabled:hover:text-brass-light disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isReplaying ? "Replaying…" : "Replay"}
        </button>
      </div>
      <ol className="m-0 list-none space-y-1 p-0">
        {displayEvents.map((event) => (
          <motion.li
            key={`${event.timestampLabel}-${event.message}`}
            className={`origin-top ${stateClassName[event.state]}`}
            initial={
              reduceMotion ? false : { opacity: 0, scaleY: 0.3, y: -2 }
            }
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            transition={{ duration: 0.22, ease: steppedEase(4) }}
          >
            [{event.timestampLabel}]{" "}
            <Teletype text={event.message} active={event.state === "now"} />
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
