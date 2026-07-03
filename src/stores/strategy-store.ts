import { create } from "zustand";

import { demoStrategySession } from "@/lib/fixtures";
import type {
  Advisor,
  DecisionBrief,
  StrategySession,
  TimelineEvent,
  WorkflowStatus,
} from "@/types/strategy";

const WORKFLOW_SEQUENCE: WorkflowStatus[] = [
  "idle",
  "planning",
  "advising",
  "mapping",
  "moderating",
  "complete",
];

export interface AdvisorResultPatch {
  argument?: string;
  confidence?: number;
  risks?: string[];
  status?: Advisor["status"];
}

export interface StrategyStoreSnapshot {
  status: WorkflowStatus;
  question: string;
  advisors: Advisor[];
  timeline: TimelineEvent[];
  decisionBrief?: DecisionBrief;
}

export interface StrategyStoreState extends StrategyStoreSnapshot {
  /**
   * Monotonic counter bumped on every `startSession`. The streaming simulation
   * keys its timed run on this so a fresh session cancels the previous run and
   * restarts cleanly. `0` means no session has started.
   */
  runId: number;
  setQuestion: (question: string) => void;
  startSession: (question?: string) => void;
  advanceStage: (nextStatus?: WorkflowStatus) => boolean;
  setAdvisorStatus: (id: Advisor["id"], status: Advisor["status"]) => void;
  setAdvisorResult: (id: Advisor["id"], patch: AdvisorResultPatch) => void;
  appendTimelineEvent: (event: TimelineEvent) => void;
  logTimelineEvent: (message: string, timestampLabel: string) => void;
  sealTimeline: () => void;
  setBrief: (brief?: DecisionBrief) => void;
  reset: () => void;
}

function cloneSession(session: StrategySession): StrategyStoreSnapshot {
  return {
    status: session.status,
    question: session.question,
    advisors: session.advisors.map((advisor) => ({
      ...advisor,
      risks: advisor.risks ? [...advisor.risks] : undefined,
    })),
    timeline: session.timeline.map((event) => ({ ...event })),
    decisionBrief: session.decisionBrief
      ? {
          ...session.decisionBrief,
          agreements: [...session.decisionBrief.agreements],
          disagreements: [...session.decisionBrief.disagreements],
          risks: [...session.decisionBrief.risks],
          unknowns: [...session.decisionBrief.unknowns],
        }
      : undefined,
  };
}

function createPlanningAdvisors(seedAdvisors: Advisor[]) {
  return seedAdvisors.map(({ id, name, purpose }) => ({
    id,
    name,
    purpose,
    status: "waiting" as const,
  }));
}

export function getNextWorkflowStatus(
  status: WorkflowStatus,
): WorkflowStatus | undefined {
  const currentIndex = WORKFLOW_SEQUENCE.indexOf(status);

  if (currentIndex === -1 || currentIndex === WORKFLOW_SEQUENCE.length - 1) {
    return undefined;
  }

  return WORKFLOW_SEQUENCE[currentIndex + 1];
}

export function canTransitionWorkflow(
  current: WorkflowStatus,
  next: WorkflowStatus,
): boolean {
  if (next === "error") {
    return current !== "idle" && current !== "complete" && current !== "error";
  }

  return getNextWorkflowStatus(current) === next;
}

const INITIAL_SESSION = cloneSession(demoStrategySession);

// First load presents an empty room waiting for a question — the demo roster
// still provides advisor names/purposes, but no session is in flight yet.
const IDLE_SESSION: StrategyStoreSnapshot = {
  status: "idle",
  question: "",
  advisors: createPlanningAdvisors(INITIAL_SESSION.advisors),
  timeline: [],
  decisionBrief: undefined,
};

function createPlanningSession(question: string): StrategyStoreSnapshot {
  const normalizedQuestion = question.trim();

  return {
    status: "planning",
    question: normalizedQuestion,
    advisors: createPlanningAdvisors(INITIAL_SESSION.advisors),
    timeline: [],
    decisionBrief: undefined,
  };
}

export const useStrategyStore = create<StrategyStoreState>((set) => ({
  ...IDLE_SESSION,
  runId: 0,
  setQuestion: (question) => {
    set({ question });
  },
  startSession: (question) => {
    set((state) => {
      const nextQuestion = (question ?? state.question).trim();

      if (!nextQuestion) {
        return state;
      }

      return { ...createPlanningSession(nextQuestion), runId: state.runId + 1 };
    });
  },
  advanceStage: (nextStatus) => {
    let advanced = false;

    set((state) => {
      const targetStatus = nextStatus ?? getNextWorkflowStatus(state.status);

      if (!targetStatus || !canTransitionWorkflow(state.status, targetStatus)) {
        return state;
      }

      advanced = true;

      return {
        status: targetStatus,
      };
    });

    return advanced;
  },
  setAdvisorStatus: (id, status) => {
    set((state) => ({
      advisors: state.advisors.map((advisor) =>
        advisor.id === id ? { ...advisor, status } : advisor,
      ),
    }));
  },
  setAdvisorResult: (id, patch) => {
    set((state) => ({
      advisors: state.advisors.map((advisor) =>
        advisor.id === id
          ? {
              ...advisor,
              ...patch,
              risks: patch.risks ? [...patch.risks] : advisor.risks,
              status: patch.status ?? "complete",
            }
          : advisor,
      ),
    }));
  },
  appendTimelineEvent: (event) => {
    set((state) => ({
      timeline: [...state.timeline, event],
    }));
  },
  logTimelineEvent: (message, timestampLabel) => {
    // The newest event is the live `now` row; any prior `now` resolves to `done`
    // so the timeline reads as a single advancing head with a green history.
    set((state) => ({
      timeline: [
        ...state.timeline.map((event) =>
          event.state === "now" ? { ...event, state: "done" as const } : event,
        ),
        { message, timestampLabel, state: "now" as const },
      ],
    }));
  },
  sealTimeline: () => {
    set((state) => ({
      timeline: state.timeline.map((event) =>
        event.state === "now" ? { ...event, state: "done" as const } : event,
      ),
    }));
  },
  setBrief: (brief) => {
    set((state) => {
      if (
        brief &&
        state.status !== "moderating" &&
        state.status !== "complete"
      ) {
        return state;
      }

      return {
        decisionBrief: brief
          ? {
              ...brief,
              agreements: [...brief.agreements],
              disagreements: [...brief.disagreements],
              risks: [...brief.risks],
              unknowns: [...brief.unknowns],
            }
          : undefined,
      };
    });
  },
  reset: () => {
    set({ ...cloneSession(demoStrategySession), runId: 0 });
  },
}));
