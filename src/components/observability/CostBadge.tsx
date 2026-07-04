import type { SessionCost } from "@/stores/strategy-store";
import type { WorkflowStatus } from "@/types/strategy";

const STATUS_DIAL: Record<
  WorkflowStatus,
  { angle: number; glowClass: string; needleClass: string }
> = {
  idle: {
    angle: -50,
    glowClass: "shadow-[inset_0_0_8px_rgb(0_0_0_/_80%)]",
    needleClass: "bg-brass-dark shadow-none",
  },
  planning: {
    angle: -18,
    glowClass:
      "shadow-[inset_0_0_8px_rgb(0_0_0_/_80%),0_0_8px_color-mix(in_srgb,var(--color-amber)_35%,transparent)]",
    needleClass: "bg-amber shadow-[0_0_6px_var(--color-amber)]",
  },
  advising: {
    angle: 35,
    glowClass:
      "shadow-[inset_0_0_8px_rgb(0_0_0_/_80%),0_0_8px_color-mix(in_srgb,var(--color-pink)_35%,transparent)]",
    needleClass: "bg-pink shadow-[0_0_6px_var(--color-pink)]",
  },
  mapping: {
    angle: 18,
    glowClass:
      "shadow-[inset_0_0_8px_rgb(0_0_0_/_80%),0_0_8px_color-mix(in_srgb,var(--color-cyan)_35%,transparent)]",
    needleClass: "bg-cyan shadow-[0_0_6px_var(--color-cyan)]",
  },
  moderating: {
    angle: 42,
    glowClass:
      "shadow-[inset_0_0_8px_rgb(0_0_0_/_80%),0_0_8px_color-mix(in_srgb,var(--color-pink)_35%,transparent)]",
    needleClass: "bg-pink shadow-[0_0_6px_var(--color-pink)]",
  },
  complete: {
    angle: 50,
    glowClass:
      "shadow-[inset_0_0_8px_rgb(0_0_0_/_80%),0_0_8px_color-mix(in_srgb,var(--color-success)_35%,transparent)]",
    needleClass: "bg-success shadow-[0_0_6px_var(--color-success)]",
  },
  error: {
    angle: 46,
    glowClass:
      "shadow-[inset_0_0_8px_rgb(0_0_0_/_80%),0_0_8px_color-mix(in_srgb,var(--color-amber)_35%,transparent)]",
    needleClass: "bg-amber shadow-[0_0_6px_var(--color-amber)]",
  },
};

/** Compact token count — instrument dials read digits tight, not verbose. */
function formatTokens(tokens: number): string {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}k`;
  }
  return String(tokens);
}

/** Cumulative call latency, in seconds to one decimal — an instrument reading. */
function formatLatency(latencyMs: number): string {
  return `${(latencyMs / 1000).toFixed(1)}s`;
}

export function CostBadge({ status, cost }: { status: WorkflowStatus; cost: SessionCost }) {
  const dial = STATUS_DIAL[status];
  const totalRequests = cost.liveRequests + cost.cacheHits;
  const cacheReading =
    totalRequests === 0 ? "—" : cost.lastCacheHit ? "cache hit" : "live";

  return (
    <div
      className="flex items-center gap-3 font-mechanical text-[11px] uppercase tracking-[0.14em] text-brass-light sm:text-xs"
      aria-label={`Session instruments: ${cost.totalTokens} tokens, ${formatLatency(
        cost.latencyMs,
      )} latency, ${cost.cacheHits} of ${totalRequests} calls served from cache, workflow ${status}`}
    >
      <div
        className={`relative size-12 shrink-0 rounded-full border-2 border-brass bg-[radial-gradient(circle_at_35%_30%,var(--color-brass-dark),var(--color-bg)_70%)] ${dial.glowClass} sm:size-[54px]`}
        aria-hidden="true"
      >
        <span
          className={`absolute left-1/2 top-1/2 h-4 w-0.5 origin-bottom -translate-x-1/2 -translate-y-full sm:h-5 ${dial.needleClass}`}
          style={{ rotate: `${dial.angle}deg` }}
        />
      </div>
      <div className="flex items-center divide-x divide-brass-dark/70" aria-hidden="true">
        <span className="pr-2.5 whitespace-nowrap">
          <span className="text-cyan">tok</span> {formatTokens(cost.totalTokens)}
        </span>
        <span className="px-2.5 whitespace-nowrap">
          <span className="text-cyan">lat</span> {formatLatency(cost.latencyMs)}
        </span>
        <span
          className={`pl-2.5 whitespace-nowrap ${
            cost.lastCacheHit ? "text-success" : "text-pink"
          }`}
        >
          {cacheReading}
        </span>
      </div>
    </div>
  );
}
