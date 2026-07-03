import type { TimelineEvent } from "@/types/strategy";

interface WorkflowTimelineProps {
  events: TimelineEvent[];
}

const stateClassName: Record<TimelineEvent["state"], string> = {
  done: "text-success",
  now: "text-amber",
  pending: "text-cyan/55",
};

export function WorkflowTimeline({ events }: WorkflowTimelineProps) {
  return (
    <section className="min-h-[260px] rounded-md border-2 border-brass-dark bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg)_92%,transparent),color-mix(in_srgb,var(--color-bg2)_45%,transparent))] px-[18px] py-4 font-mechanical text-xs leading-[1.9] text-cyan shadow-[inset_0_0_42px_rgb(0_0_0_/_60%)]">
      <h2 className="mb-4 mt-0 font-display text-sm font-black uppercase tracking-[0.04em] text-brass-light">
        Live discussion
      </h2>
      <ol className="m-0 list-none space-y-1 p-0">
        {events.map((event) => (
          <li
            key={`${event.timestampLabel}-${event.message}`}
            className={stateClassName[event.state]}
          >
            [{event.timestampLabel}] {event.message}
          </li>
        ))}
      </ol>
    </section>
  );
}
