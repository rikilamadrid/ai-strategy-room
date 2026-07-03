# Core Types & Fixture Data

## Status

Not Started

## Goals

- Create `src/types/strategy.ts` with the core data models: `WorkflowStatus`, `Advisor`, and `DecisionBrief` exactly as defined in the project overview "Core Data Models".
- Add a `TimelineEvent` type (timestamp label, message, state: `done | now | pending`) to model the live-discussion rows.
- Add a `StrategySession` type that composes the question string, the advisor array, the timeline events, and the optional decision brief.
- Create `src/lib/fixtures.ts` exporting one complete demo session matching the mockup: the Madrid lease-vs-buy question, four advisors (Skeptic/Strategist/Human Advocate/Pragmatist) in mixed states, five timeline rows, and a filled decision brief.
- All types compile under TypeScript strict mode with no `any`; `npm run build` passes.

## Notes

- Type definitions: project overview "Core Data Models" (`WorkflowStatus`, `Advisor`, `DecisionBrief`).
- Fixture content to mirror: mockup `context/ai-strategy-table-mockup.html` markup (advisor names/states lines 197–214, question line 218, timeline rows 225–229, brief lines 234–240).
- Advisor states in the demo: Skeptic = `thinking`, Strategist = `complete` (argument ready), Human Advocate = `waiting`, Pragmatist = `waiting`.
- **Depends on:** nothing code-wise, but pairs with 01. This is pure data/types — no UI. Every Phase 1 UI feature consumes these fixtures.

## Out of Scope

- Any React components or rendering (features 03–05).
- Zustand store / state machine (feature 07).
- Zod schemas — these are plain TS types for now; runtime validation schemas come in Phase 3 (feature 12).
- Multiple demo scenarios (feature 17); this is a single canonical fixture.
