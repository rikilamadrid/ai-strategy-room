# Strategy Store & Workflow State Machine

## Status

Complete — merged to `main` on 2026-07-03. Branch pruned.

## Goals

- Add Zustand and create `src/stores/strategy-store.ts` holding the full session in client state: `status`, `question`, `advisors`, `timeline`, and `decisionBrief`.
- Model the workflow as an explicit state machine over `WorkflowStatus` (`idle -> planning -> advising -> mapping -> moderating -> complete`, plus `error`) and reject invalid transitions.
- Expose granular actions for question updates, stage changes, advisor updates, timeline appends, brief updates, and reset.
- Refactor the Phase 1 components to read from the store instead of importing fixtures directly, while seeding the store from the existing demo fixture so the static screen stays visually unchanged.
- Keep the session in memory only with no persistence, and finish with a passing `npm run build`.

## Notes

- Active feature spec: `context/features/07-strategy-store.md`.
- Branch: `feature/strategy-store`.
- This is the first Phase 2 workflow-state feature and becomes the backbone for question input, streaming simulation, retry behavior, and AI orchestration.
- Use Zustand for v1 simplicity, but keep state transitions explicit and unit-testable in pure helper functions rather than burying workflow rules in component code.
- Seed the store from `demoStrategySession` on first load so the current Phase 1 table remains visually unchanged while components migrate to store selectors.
- Keep the app stateless: no localStorage, database, auth, or server session storage.
- Official package check on 2026-07-03: `zustand` current npm version is `5.0.14`; installed that exact version.
- Added `src/stores/strategy-store.ts` with exported pure workflow transition helpers plus a seeded Zustand store.
- Refactored `StrategyTable` into the client boundary that reads `status`, `question`, `advisors`, `timeline`, and `decisionBrief` from the store.
- Updated `StrategySession` and the demo fixture to carry explicit workflow `status`, and wired `CostBadge` to read the workflow stage from store-backed props while keeping the existing static visual.
- Verification: `npm run lint` passes; `npm run build` passes.

## Out of Scope

- Timers, simulated progression, or streaming playback behavior (feature 09).
- Real planner/advisor/moderator API calls (features 12-15).
- Persistence of any kind, including localStorage.
- UI expansion beyond the minimal refactor needed to source Phase 1 components from the store.

## History

- **2026-06-28** — Initial Next.js + Tailwind CSS v4 setup. Scaffolded from Create Next App, removed default boilerplate (SVGs, AGENTS.md), added project context docs. Committed (`chore: initial nextjs and tailwind set up`) and pushed to remote `rikilamadrid/devstash`.
- **2026-06-29** — Added mock data (`src/lib/mock-data.ts`) and dashboard screenshots. Committed (`feat: add mock data and dashboard screenshots`).
- **2026-07-03** — Added Vercel deployment planning to the feature roadmap: inserted early preview CI/CD as feature 06, renumbered the existing features through 21, added final production-readiness as feature 22, and aligned the overview/convention docs with the stateless Vercel deployment path.
- **2026-07-03** — Completed feature 01 theme foundation: removed Create Next App boilerplate, added Brass & Neon Tailwind tokens, wired the three project typefaces, and applied the base room background with scanlines and vignette.
- **2026-07-03** — Completed feature 02 core types and fixture data: added strict TypeScript strategy models in `src/types/strategy.ts`, added the canonical Madrid demo session in `src/lib/fixtures.ts`, and verified with `npm run build` plus `npm run lint`.
- **2026-07-02** — Completed feature 03 app shell and header: added `StrategyTable` layout shell and `CostBadge` brass dial, rendered at `/` with static placeholder regions. Verified with `npm run build` and `npm run lint`.
- **2026-07-02** — Completed feature 04 advisor seats & table surface: added `AdvisorSeat` (per-status brass pocket-gauge), `QuestionPlate`, and the 2x2 seats grid in `StrategyTable`. Also wired the PWA icon set/favicons/web manifest into layout metadata and served the brand `favicon.ico` from `public/` root (removed the default `src/app/favicon.ico` — the app-dir convention broke the build on the non-RGBA `.ico` and overrode the public file). Verified with `npm run build`. Merged to `main`.
- **2026-07-03** — Completed feature 05 live timeline & decision brief: added fixture-driven `WorkflowTimeline` and `DecisionBrief` panels, wired them into the lower split region, and added tokenized success/seal colors. Verified with `npm run lint`, `npm run build`, served markup smoke check, and Ricardo browser review. Merged to `main`.
- **2026-07-03** — Completed feature 06 Vercel preview deployment & CI/CD docs: added GitHub Actions install/lint/build CI, replaced the stock README with project-specific local/deployment runbook, and documented the Vercel GitHub integration flow with URL placeholders pending account-side project setup. Verified with `npm run lint` and `npm run build`. Merged to `main`.
- **2026-07-03** — Completed feature 07 strategy store & workflow state machine: installed `zustand@5.0.14`, added `src/stores/strategy-store.ts` with a seeded Zustand session store plus exported pure transition helpers enforcing the `idle -> planning -> advising -> mapping -> moderating -> complete` (+`error`) workflow, added explicit `status` to `StrategySession`/the demo fixture, and refactored `StrategyTable` and `CostBadge` to read from the store while keeping the Phase 1 screen visually unchanged. Verified with `npm run lint` and `npm run build`. Merged to `main`.
