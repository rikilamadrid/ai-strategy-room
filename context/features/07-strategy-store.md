# Strategy Store & Workflow State Machine

## Status

Not Started

## Goals

- Add Zustand and create `src/stores/strategy-store.ts` holding the full session in client state: `status: WorkflowStatus`, `question`, `advisors`, `timeline`, `brief`.
- Model the workflow as an explicit state machine over `WorkflowStatus` (`idle → planning → advising → mapping → moderating → complete`, plus `error`); expose actions to transition between stages and reject invalid transitions.
- Expose granular actions: `setQuestion`, `startSession`, `advanceStage`, `setAdvisorStatus(id, status)`, `setAdvisorResult(id, argument…)`, `appendTimelineEvent`, `setBrief`, `reset`.
- Refactor the Phase 1 components (seats, timeline, brief, cost badge) to read from the store instead of importing fixtures directly; seed the store from the fixture on load so the static view is unchanged.
- Session lives entirely in memory — closing/refreshing the tab clears it (no persistence).
- Store logic is unit-testable in isolation (pure state transitions); `npm run build` passes.

## Notes

- State machine values: project overview `WorkflowStatus` and the workflow diagram (Question → Parser → Advisors → Mapper → Moderator → Brief).
- Stack choice: project overview "Suggested Tech Stack" (Zustand or XState) — use **Zustand** for v1 simplicity.
- **Depends on:** features 02 (types) and 03–05 (components to rewire). This is the backbone for all remaining Phase 2 features.

## Out of Scope

- Any timers, streaming, or simulated progression (feature 09) — this feature only defines state + transitions, still driven by fixture seed.
- Real API calls (Phase 3).
- Persistence to localStorage or a DB (explicitly none in v1).
- Question input UI (feature 08).
