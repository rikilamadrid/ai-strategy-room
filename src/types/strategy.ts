export type WorkflowStatus =
  | "idle"
  | "planning"
  | "advising"
  | "mapping"
  | "moderating"
  | "complete"
  | "error";

export interface Advisor {
  id: string;
  name: string;
  purpose: string;
  status: "waiting" | "thinking" | "complete" | "error";
  argument?: string;
  confidence?: number;
  risks?: string[];
}

export interface DecisionBrief {
  recommendation: string;
  confidence: number;
  agreements: string[];
  disagreements: string[];
  risks: string[];
  unknowns: string[];
  nextAction: string;
}

export interface TimelineEvent {
  timestampLabel: string;
  message: string;
  state: "done" | "now" | "pending";
}

export interface StrategySession {
  status: WorkflowStatus;
  question: string;
  advisors: Advisor[];
  timeline: TimelineEvent[];
  decisionBrief?: DecisionBrief;
}
