import type { StrategySession } from "@/types/strategy";

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
