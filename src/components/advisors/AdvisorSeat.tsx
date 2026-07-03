import type { Advisor } from "@/types/strategy";

type SeatVisual = {
  /** Status label shown beneath the advisor name. */
  label: string;
  /** Border + glow treatment for the seat panel. */
  seatClass: string;
  /** Needle fill color (token var). */
  needleColor: string;
  /** Needle glow, or "none" for the idle resting needle. */
  needleGlow: string;
  /** Fixed needle angle in degrees. No animation in this feature. */
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
    label: "error",
    seatClass:
      "border-amber shadow-[0_0_14px_color-mix(in_srgb,var(--color-amber)_30%,transparent)]",
    needleColor: "var(--color-amber)",
    needleGlow: "0 0 6px var(--color-amber)",
    needleAngle: 40,
  },
};

export function AdvisorSeat({ advisor }: { advisor: Advisor }) {
  const visual = SEAT_VISUALS[advisor.status];

  return (
    <div
      className={`flex items-center gap-3 rounded-md border bg-[linear-gradient(180deg,#1b1520,#120e14)] px-3 py-2.5 ${visual.seatClass}`}
    >
      <div
        aria-hidden
        className="relative h-11 w-11 flex-none rounded-full border-2 border-brass bg-[radial-gradient(circle_at_35%_30%,#4a3a16,#0e0b08_70%)]"
      >
        <span
          className={`absolute left-1/2 top-1/2 h-3.5 w-0.5 origin-bottom ${
            visual.dim ? "opacity-70" : ""
          }`}
          style={{
            background: visual.needleColor,
            boxShadow: visual.needleGlow,
            transform: `translate(-50%,-100%) rotate(${visual.needleAngle}deg)`,
          }}
        />
      </div>
      <div>
        <div className="font-mechanical text-[13px] tracking-[0.03em] text-brass-light">
          {advisor.name}
        </div>
        <div className="font-mechanical text-xs uppercase tracking-[0.08em] text-cyan">
          {visual.label}
        </div>
      </div>
    </div>
  );
}
