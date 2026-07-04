import { create } from "zustand";

import { demoStrategySession } from "@/lib/fixtures";
import type { TokenUsage } from "@/lib/ai/client";
import type { PlannerOutput } from "@/lib/ai/schemas";
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
  replayLog: TimelineEvent[];
  decisionBrief?: DecisionBrief;
  /**
   * The validated planner output for the current session, once it lands.
   * Kept around (not just its derived seat roster) so a single-advisor
   * regenerate ("Try another angle") can re-send the full plan + constraints
   * the route needs to re-validate, without rerunning the planner call.
   */
  plan?: PlannerOutput;
}

/**
 * Cumulative cost/observability readout for the current session — real token,
 * request, and cache counts, not a placeholder (CLAUDE.md → "the session-cost
 * badge reflects real token/call/cache counts"). Resets with the session.
 */
export interface SessionCost {
  totalTokens: number;
  liveRequests: number;
  cacheHits: number;
  latencyMs: number;
  lastCacheHit: boolean;
}

const IDLE_SESSION_COST: SessionCost = {
  totalTokens: 0,
  liveRequests: 0,
  cacheHits: 0,
  latencyMs: 0,
  lastCacheHit: false,
};

export interface StrategyStoreState extends StrategyStoreSnapshot {
  /**
   * Monotonic counter bumped on every `startSession`. The streaming simulation
   * keys its timed run on this so a fresh session cancels the previous run and
   * restarts cleanly. `0` means no session has started.
   */
  runId: number;
  replayRunId: number;
  isReplaying: boolean;
  briefAnimationKey: number;
  sessionCost: SessionCost;
  setQuestion: (question: string) => void;
  startSession: (question?: string) => void;
  advanceStage: (nextStatus?: WorkflowStatus) => boolean;
  applyPlannerResult: (result: PlannerOutput, timestampLabel: string) => void;
  failWorkflow: (message: string, timestampLabel: string) => void;
  setAdvisorStatus: (id: Advisor["id"], status: Advisor["status"]) => void;
  setAdvisorResult: (id: Advisor["id"], patch: AdvisorResultPatch) => void;
  appendTimelineEvent: (event: TimelineEvent) => void;
  logTimelineEvent: (message: string, timestampLabel: string) => void;
  logAdvisorError: (message: string, timestampLabel: string) => void;
  sealTimeline: () => void;
  startReplay: () => boolean;
  finishReplay: () => void;
  setBrief: (brief?: DecisionBrief) => void;
  recordUsage: (usage: TokenUsage, meta: { cacheHit: boolean; latencyMs: number }) => void;
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
    replayLog: session.timeline.map((event) => ({ ...event })),
    decisionBrief: session.decisionBrief
      ? {
          ...session.decisionBrief,
          agreements: [...session.decisionBrief.agreements],
          disagreements: [...session.decisionBrief.disagreements],
          risks: [...session.decisionBrief.risks],
          unknowns: [...session.decisionBrief.unknowns],
        }
      : undefined,
    plan: undefined,
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
  replayLog: [],
  decisionBrief: undefined,
  plan: undefined,
};

function cloneTimelineEvent(event: TimelineEvent): TimelineEvent {
  return { ...event };
}

function createPlanningSession(question: string): StrategyStoreSnapshot {
  const normalizedQuestion = question.trim();

  return {
    status: "planning",
    question: normalizedQuestion,
    advisors: createPlanningAdvisors(INITIAL_SESSION.advisors),
    timeline: [],
    replayLog: [],
    decisionBrief: undefined,
    plan: undefined,
  };
}

export const useStrategyStore = create<StrategyStoreState>((set) => ({
  ...IDLE_SESSION,
  runId: 0,
  replayRunId: 0,
  isReplaying: false,
  briefAnimationKey: 0,
  sessionCost: IDLE_SESSION_COST,
  setQuestion: (question) => {
    set({ question });
  },
  startSession: (question) => {
    set((state) => {
      const nextQuestion = (question ?? state.question).trim();

      if (!nextQuestion) {
        return state;
      }

      return {
        ...createPlanningSession(nextQuestion),
        runId: state.runId + 1,
        isReplaying: false,
        briefAnimationKey: 0,
        sessionCost: IDLE_SESSION_COST,
      };
    });
  },
  applyPlannerResult: (result, timestampLabel) => {
    // The planner's chosen roles replace the demo-seeded roster mid-`planning`,
    // and its extracted constraints stamp the first live timeline row. Guarded to
    // the `planning` stage so a late/duplicate response can't overwrite a session
    // that has already moved on (mirrors `setBrief`'s stage guard).
    set((state) => {
      if (state.status !== "planning") {
        return state;
      }

      const advisors: Advisor[] = result.advisors.map(({ id, name, purpose }) => ({
        id,
        name,
        purpose,
        status: "waiting" as const,
      }));

      const message = result.constraints.length
        ? `Constraints parsed — ${result.constraints.join(", ")}`
        : "Constraints parsed — none stated";
      const constraintEvent: TimelineEvent = {
        message,
        timestampLabel,
        state: "now",
      };

      return {
        advisors,
        plan: result,
        timeline: [
          ...state.timeline.map((event) =>
            event.state === "now" ? { ...event, state: "done" as const } : event,
          ),
          constraintEvent,
        ],
        replayLog: [...state.replayLog, cloneTimelineEvent(constraintEvent)],
      };
    });
  },
  failWorkflow: (message, timestampLabel) => {
    // A workflow-level fault (e.g. the planner call failing) moves the session to
    // `error` and stamps a permanent error row — reusing the feature-10 error
    // timeline treatment. No-op if the current stage can't transition to `error`.
    set((state) => {
      if (!canTransitionWorkflow(state.status, "error")) {
        return state;
      }

      const errorEvent: TimelineEvent = { message, timestampLabel, state: "error" };

      return {
        status: "error",
        timeline: [
          ...state.timeline.map((event) =>
            event.state === "now" ? { ...event, state: "done" as const } : event,
          ),
          errorEvent,
        ],
        replayLog: [...state.replayLog, cloneTimelineEvent(errorEvent)],
      };
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
    const nextEvent = cloneTimelineEvent(event);

    set((state) => ({
      timeline: [...state.timeline, nextEvent],
      replayLog: [...state.replayLog, cloneTimelineEvent(nextEvent)],
    }));
  },
  logTimelineEvent: (message, timestampLabel) => {
    // The newest event is the live `now` row; any prior `now` resolves to `done`
    // so the timeline reads as a single advancing head with a green history.
    const nextEvent = { message, timestampLabel, state: "now" as const };

    set((state) => ({
      timeline: [
        ...state.timeline.map((event) =>
          event.state === "now" ? { ...event, state: "done" as const } : event,
        ),
        nextEvent,
      ],
      replayLog: [...state.replayLog, cloneTimelineEvent(nextEvent)],
    }));
  },
  logAdvisorError: (message, timestampLabel) => {
    // A faulted advisor stamps a permanent error row. Like a normal resolution
    // it advances the head (any prior `now` flips to `done`), but the row reads
    // as `error` rather than becoming the live `now` — the other advisors keep
    // deliberating, so the workflow head moves on to the next one.
    const nextEvent = { message, timestampLabel, state: "error" as const };

    set((state) => ({
      timeline: [
        ...state.timeline.map((event) =>
          event.state === "now" ? { ...event, state: "done" as const } : event,
        ),
        nextEvent,
      ],
      replayLog: [...state.replayLog, cloneTimelineEvent(nextEvent)],
    }));
  },
  sealTimeline: () => {
    set((state) => ({
      timeline: state.timeline.map((event) =>
        event.state === "now" ? { ...event, state: "done" as const } : event,
      ),
    }));
  },
  startReplay: () => {
    let started = false;

    set((state) => {
      if (
        state.status !== "complete" ||
        state.isReplaying ||
        state.replayLog.length === 0
      ) {
        return state;
      }

      started = true;

      return {
        isReplaying: true,
        replayRunId: state.replayRunId + 1,
      };
    });

    return started;
  },
  finishReplay: () => {
    set((state) => {
      if (!state.isReplaying) {
        return state;
      }

      return {
        isReplaying: false,
        briefAnimationKey: state.briefAnimationKey + 1,
      };
    });
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
  recordUsage: (usage, meta) => {
    set((state) => ({
      sessionCost: {
        totalTokens: state.sessionCost.totalTokens + (usage.totalTokens ?? 0),
        liveRequests: state.sessionCost.liveRequests + (meta.cacheHit ? 0 : 1),
        cacheHits: state.sessionCost.cacheHits + (meta.cacheHit ? 1 : 0),
        latencyMs: state.sessionCost.latencyMs + meta.latencyMs,
        lastCacheHit: meta.cacheHit,
      },
    }));
  },
  reset: () => {
    set({
      ...cloneSession(demoStrategySession),
      runId: 0,
      replayRunId: 0,
      isReplaying: false,
      briefAnimationKey: 0,
      sessionCost: IDLE_SESSION_COST,
    });
  },
}));
