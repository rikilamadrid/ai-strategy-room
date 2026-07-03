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

- Active feature: `context/features/02-core-types-and-fixtures.md`.
- Type definitions: project overview "Core Data Models" (`WorkflowStatus`, `Advisor`, `DecisionBrief`).
- Fixture content to mirror: mockup `context/ai-strategy-table-mockup.html` markup (advisor names/states lines 197-214, question line 218, timeline rows 225-229, brief lines 234-240).
- Advisor states in the demo: Skeptic = `thinking`, Strategist = `complete` (argument ready), Human Advocate = `waiting`, Pragmatist = `waiting`.
- Depends on nothing code-wise, but pairs with feature 01. This is pure data/types; no UI work.

## Out of Scope

- Any React components or rendering (features 03-05).
- Zustand store / state machine (feature 07).
- Zod schemas; these are plain TypeScript types for now. Runtime validation schemas come in Phase 3 (feature 12).
- Multiple demo scenarios (feature 17); this is a single canonical fixture.

## History

- **2026-06-28** — Initial Next.js + Tailwind CSS v4 setup. Scaffolded from Create Next App, removed default boilerplate (SVGs, AGENTS.md), added project context docs. Committed (`chore: initial nextjs and tailwind set up`) and pushed to remote `rikilamadrid/devstash`.
- **2026-06-29** — Added mock data (`src/lib/mock-data.ts`) and dashboard screenshots. Committed (`feat: add mock data and dashboard screenshots`).
- **2026-07-03** — Added Vercel deployment planning to the feature roadmap: inserted early preview CI/CD as feature 06, renumbered the existing features through 21, added final production-readiness as feature 22, and aligned the overview/convention docs with the stateless Vercel deployment path.
- **2026-07-03** — Completed feature 01 theme foundation: removed Create Next App boilerplate, added Brass & Neon Tailwind tokens, wired the three project typefaces, and applied the base room background with scanlines and vignette.
