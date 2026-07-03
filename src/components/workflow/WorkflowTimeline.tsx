"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { steppedEase } from "@/lib/motion";
import type { TimelineEvent } from "@/types/strategy";

interface WorkflowTimelineProps {
  events: TimelineEvent[];
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

/**
 * Reveals a line of timeline text teletype-style — one character at a time with
 * a blinking punch caret — rather than printing it all at once. Reduced motion
 * shows the finished line immediately.
 */
function Teletype({ text, active }: { text: string; active: boolean }) {
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(reduceMotion ? text.length : 0);

  useEffect(() => {
    if (reduceMotion) {
      setCount(text.length);
      return;
    }

    setCount(0);
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

export function WorkflowTimeline({ events }: WorkflowTimelineProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="min-h-[260px] rounded-md border-2 border-brass-dark bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg)_92%,transparent),color-mix(in_srgb,var(--color-bg2)_45%,transparent))] px-[18px] py-4 font-mechanical text-xs leading-[1.9] text-cyan shadow-[inset_0_0_42px_rgb(0_0_0_/_60%)]">
      <h2 className="mb-4 mt-0 font-display text-sm font-black uppercase tracking-[0.04em] text-brass-light">
        Live discussion
      </h2>
      <ol className="m-0 list-none space-y-1 p-0">
        {events.map((event) => (
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
