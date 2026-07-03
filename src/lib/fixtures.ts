import type { StrategySession } from "@/types/strategy";

/**
 * Resolved advisor outputs the streaming *simulation* reveals one at a time.
 * Pure fixture data — no network calls, no LLM requests (zero cost budget
 * impact). The order here is the order advisors settle during `advising`.
 */
export interface SimulatedAdvisorResult {
  id: string;
  argument: string;
  confidence: number;
  risks: string[];
}

export const simulatedAdvisorResults: SimulatedAdvisorResult[] = [
  {
    id: "strategist",
    argument:
      "Lease first to preserve flexibility while residency, neighborhood, commute, and parking needs settle into a reliable pattern.",
    confidence: 0.72,
    risks: [
      "Buying too early could lock in a car that fits the wrong city routine.",
    ],
  },
  {
    id: "skeptic",
    argument:
      "Ownership only pays off past the break-even mileage, and that assumes residency and insurance costs hold steady — neither is settled yet.",
    confidence: 0.58,
    risks: [
      "Residency timing may change the true cost of ownership.",
      "Lease contracts can hide early termination penalties.",
    ],
  },
  {
    id: "human-advocate",
    argument:
      "A short lease lowers the emotional stakes of a new-city move — no resale hassle if plans change, and freedom to trade up once life here feels permanent.",
    confidence: 0.6,
    risks: ["A lease can feel like money spent with nothing owned at the end."],
  },
  {
    id: "pragmatist",
    argument:
      "Leasing needs the least cash and effort right now: one predictable monthly figure, maintenance included, and no resale to manage mid-move.",
    confidence: 0.66,
    risks: ["Mileage caps could bite if the commute turns out longer than expected."],
  },
];

/**
 * Failure-path flag for the streaming simulation. When set to an advisor id,
 * that advisor faults during `advising` (enters `status: 'error'` instead of
 * resolving) so the error + "Try another angle" recovery UX is verifiable. The
 * rest of the workflow is unaffected. Default `null` — a clean demo run.
 */
export const simulatedErrorAdvisorId: string | null = null;

/**
 * Alternate "another angle" outputs used when an advisor is re-run via the
 * "Try another angle" control. Keyed by advisor id — one fresh take each. Pure
 * fixture data (zero cost budget); the retry resolves against this on a timer.
 */
export const advisorRetryResults: Record<string, SimulatedAdvisorResult> = {
  strategist: {
    id: "strategist",
    argument:
      "On second look, buy used and hold: if the Madrid move sticks, three years of lease payments buy nothing, while a two-year-old car keeps most of its value.",
    confidence: 0.64,
    risks: ["A used purchase bets on the move being permanent sooner than the data supports."],
  },
  skeptic: {
    id: "skeptic",
    argument:
      "Reframing the risk: the real hazard isn't lease vs. buy, it's committing before residency is confirmed — either option signed early can trap capital you may need for the move itself.",
    confidence: 0.55,
    risks: [
      "Signing anything pre-residency exposes you to relocation cost overruns.",
      "Currency and rate shifts can move both lease and loan terms.",
    ],
  },
  "human-advocate": {
    id: "human-advocate",
    argument:
      "Another angle: a car you own can make a new city feel like home faster — the freedom to explore on a whim may matter more than the spreadsheet says.",
    confidence: 0.57,
    risks: ["Emotional attachment to owning can outrun what the budget comfortably supports."],
  },
  pragmatist: {
    id: "pragmatist",
    argument:
      "Revised take: skip both for now. Ride-share and rental for the first few months costs less than any contract and buys time to learn what the commute actually demands.",
    confidence: 0.61,
    risks: ["Deferring a decision works only if day-to-day transport is genuinely optional at first."],
  },
};

export const demoStrategySession: StrategySession = {
  status: "advising",
  question: "Should I lease or buy a car after moving to Madrid?",
  advisors: [
    {
      id: "skeptic",
      name: "The skeptic",
      purpose: "Risks, weak assumptions, and failure modes",
      status: "thinking",
      risks: [
        "Residency timing may change the true cost of ownership.",
        "Lease contracts can hide early termination penalties.",
      ],
    },
    {
      id: "strategist",
      name: "The strategist",
      purpose: "Long-term implications and tradeoffs",
      status: "complete",
      argument:
        "Lease first to preserve flexibility while residency, neighborhood, commute, and parking needs settle into a reliable pattern.",
      confidence: 0.72,
      risks: ["Buying too early could lock in a car that fits the wrong city routine."],
    },
    {
      id: "human-advocate",
      name: "Human advocate",
      purpose: "Lifestyle, emotions, and personal priorities",
      status: "waiting",
    },
    {
      id: "pragmatist",
      name: "The pragmatist",
      purpose: "Cost, effort, and immediate feasibility",
      status: "waiting",
    },
  ],
  timeline: [
    {
      timestampLabel: "00:02",
      message: "Constraints parsed - budget, 3yr horizon",
      state: "done",
    },
    {
      timestampLabel: "00:05",
      message: "Strategist filed argument",
      state: "done",
    },
    {
      timestampLabel: "00:07",
      message: "Skeptic drafting counterpoint...",
      state: "now",
    },
    {
      timestampLabel: "--:--",
      message: "Pragmatist pending",
      state: "pending",
    },
    {
      timestampLabel: "--:--",
      message: "Moderator pending",
      state: "pending",
    },
  ],
  decisionBrief: {
    recommendation:
      "Lease for the first 18 months, revisit once residency is confirmed.",
    confidence: 0.62,
    agreements: ["Residency status is the swing variable."],
    disagreements: [
      "The long-term value of buying depends on how permanent the Madrid move becomes.",
    ],
    risks: ["Early termination penalties vary by dealer."],
    unknowns: [
      "Final residency status",
      "Actual parking and commute needs after the move",
    ],
    nextAction: "Request 3 lease quotes this week.",
  },
};
