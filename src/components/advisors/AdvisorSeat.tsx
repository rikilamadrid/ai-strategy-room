"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { advisorRetryResults } from "@/lib/fixtures";
import { NEON_FLICKER_OPACITY, NEON_FLICKER_TIMES, tickEase } from "@/lib/motion";
import { useStrategyStore } from "@/stores/strategy-store";
import type { Advisor } from "@/types/strategy";

// How long a re-run advisor spends ticking before its new argument settles.
const RETRY_THINKING_MS = 1400;

type SeatVisual = {
  /** Status label shown beneath the advisor name. */
  label: string;
  /** Border + glow treatment for the seat panel. */
  seatClass: string;
  /** Needle fill color (token var). */
  needleColor: string;
  /** Needle glow, or "none" for the idle resting needle. */
  needleGlow: string;
  /** Resting needle angle in degrees once the gauge settles. */
  needleAngle: number;
  /** Idle needles read fainter than active ones. */
  dim?: boolean;
};

const SEAT_VISUALS: Record<Advisor["status"], SeatVisual> = {
  waiting: {
    label: "waiting",
    seatClass: "border-brass-dark",
    needleColor: "var(--color-brass-dark)",
    needleGlow: "none",
    needleAngle: -48,
    dim: true,
  },
  thinking: {
    label: "thinking…",
    seatClass:
      "border-amber shadow-[0_0_14px_color-mix(in_srgb,var(--color-amber)_30%,transparent)]",
    needleColor: "var(--color-amber)",
    needleGlow: "0 0 6px var(--color-amber)",
    needleAngle: -16,
  },
  complete: {
    label: "argument ready",
    seatClass:
      "border-pink shadow-[0_0_14px_color-mix(in_srgb,var(--color-pink)_35%,transparent)]",
    needleColor: "var(--color-pink)",
    needleGlow: "0 0 6px var(--color-pink)",
    needleAngle: 20,
  },
  error: {
    // A dead tube: dim, cracked-looking seal-red bezel, needle slumped, and no
    // neon flicker (that stays reserved for a completed argument).
    label: "signal lost",
    seatClass:
      "border-seal border-dashed shadow-[0_0_12px_color-mix(in_srgb,var(--color-seal)_35%,transparent)]",
    needleColor: "var(--color-seal)",
    needleGlow: "none",
    needleAngle: -40,
    dim: true,
  },
};

// The thinking needle sweeps between these before settling — matches the
// mockup's tick keyframe (-40deg → 40deg).
const TICK_SWEEP = [-40, 40];

export function AdvisorSeat({ advisor }: { advisor: Advisor }) {
  const reduceMotion = useReducedMotion();
  const setAdvisorStatus = useStrategyStore((state) => state.setAdvisorStatus);
  const setAdvisorResult = useStrategyStore((state) => state.setAdvisorResult);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visual = SEAT_VISUALS[advisor.status];
  const isThinking = advisor.status === "thinking";
  const isComplete = advisor.status === "complete";
  // "Try another angle" only makes sense once an advisor has settled — a
  // resolved argument to reconsider, or a fault to recover from.
  const canRetry = advisor.status === "complete" || advisor.status === "error";

  useEffect(
    () => () => {
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
      }
    },
    [],
  );

  // Re-run this one advisor without touching the rest of the workflow: it
  // re-enters `thinking` (needle ticks against real state) and settles back to
  // `complete` with an alternate fixture argument. No new stage transitions,
  // no moderator rerun — a timer, not a network call.
  const handleRetry = () => {
    if (retryTimer.current) {
      clearTimeout(retryTimer.current);
    }

    setAdvisorStatus(advisor.id, "thinking");
    const next = advisorRetryResults[advisor.id];

    retryTimer.current = setTimeout(() => {
      setAdvisorResult(
        advisor.id,
        next
          ? {
              argument: next.argument,
              confidence: next.confidence,
              risks: next.risks,
              status: "complete",
            }
          : { status: "complete" },
      );
    }, RETRY_THINKING_MS);
  };

  // Idle/complete/error: needle settles to its resting angle. Thinking: it
  // ticks back and forth in discrete steps until an argument lands. Reduced
  // motion always shows the still resting needle — a frozen instrument.
  const needleAnimate =
    isThinking && !reduceMotion
      ? { rotate: TICK_SWEEP }
      : { rotate: visual.needleAngle };

  const needleTransition =
    isThinking && !reduceMotion
      ? {
          duration: 1.4,
          repeat: Infinity,
          repeatType: "mirror" as const,
          ease: tickEase,
        }
      : { duration: 0.35, ease: tickEase };

  return (
    <div
      className={`relative flex items-center gap-3 rounded-md border bg-[linear-gradient(180deg,#1b1520,#120e14)] px-3 py-2.5 ${visual.seatClass}`}
    >
      {/* Neon bezel that flickers on the moment an argument is ready. */}
      {isComplete ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-pink shadow-[0_0_18px_color-mix(in_srgb,var(--color-pink)_45%,transparent)]"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: NEON_FLICKER_OPACITY }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 0.55, times: NEON_FLICKER_TIMES }
          }
        />
      ) : null}

      <div
        aria-hidden
        className="relative h-11 w-11 flex-none rounded-full border-2 border-brass bg-[radial-gradient(circle_at_35%_30%,#4a3a16,#0e0b08_70%)]"
      >
        <div className="absolute left-1/2 top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-full">
          <motion.span
            className={`block h-full w-full origin-bottom ${
              visual.dim ? "opacity-70" : ""
            }`}
            style={{
              background: visual.needleColor,
              boxShadow: visual.needleGlow,
            }}
            animate={needleAnimate}
            transition={needleTransition}
          />
        </div>
      </div>
      <div className="min-w-0">
        <div className="font-mechanical text-[13px] tracking-[0.03em] text-brass-light">
          {advisor.name}
        </div>
        <div
          className={`font-mechanical text-xs uppercase tracking-[0.08em] ${
            advisor.status === "error" ? "text-seal" : "text-cyan"
          }`}
        >
          {visual.label}
        </div>
        {canRetry ? (
          <button
            type="button"
            onClick={handleRetry}
            className="mt-1.5 rounded-sm border border-brass-dark bg-transparent px-2 py-0.5 font-mechanical text-[10px] uppercase tracking-[0.12em] text-brass transition-colors hover:border-brass hover:text-brass-light focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-brass"
          >
            ↻ Try another angle
          </button>
        ) : null}
      </div>
    </div>
  );
}
