# Question Input & Session Start

## Status

Complete — merged to `main` on 2026-07-03. Branch pruned.

## Goals

- Turn the question plate into an interactive entry point: when `status === 'idle'`, the plate shows a text input + a brass "Convene the table" submit control; when a session is running, it shows the locked-in question (as in Phase 1).
- On submit, call the store's `setQuestion` + `startSession`, transitioning `idle → planning` and resetting advisors to `waiting`.
- Validate input client-side: non-empty, trimmed, reasonable max length; disable submit and show an inline instrument-style hint when invalid.
- Empty/initial state: on first load with no session, the table presents the input prompt rather than fixture content.
- Verify in browser: typing a question and submitting advances the visible status and clears prior results.

## Notes

- Active feature spec: `context/features/08-question-input.md`.
- Branch: `feature/question-input` (to be created).
- Question plate to extend: `src/components/table/QuestionPlate.tsx` (feature 04) + mockup `.question-plate` styling (lines 139–149).
- This is the first `'use client'` interactive surface — keep it isolated (only client where interactivity is needed).
- Store actions confirmed present in `src/stores/strategy-store.ts`: `setQuestion`, `startSession`, `reset`, plus `WorkflowStatus` transitions.
- **Depends on:** feature 07 (store actions `setQuestion`, `startSession`, `reset`) — done.

### Implementation

- Store now initializes to an `IDLE_SESSION` (status `idle`, empty question, advisors reset to `waiting`, empty timeline, no brief). The demo roster still supplies advisor names/purposes; `reset()` left unchanged (still returns the demo session — not wired to any UI yet, out of scope here).
- `QuestionPlate` is now a `'use client'` component. When `status === 'idle'` it renders a `<form>` with a labeled textarea + brass "Convene the table" submit; otherwise it renders the locked-in question exactly as before.
- Validation: trimmed non-empty required (submit disabled otherwise); hard `maxLength={280}` cap; instrument-style hint shows "characters left" normally and an amber "A question is required" when the field holds only whitespace.
- On submit: `setQuestion(trimmed)` then `startSession(trimmed)` → `idle → planning`, advisors reset to `waiting`, prior timeline/brief cleared.
- `StrategyTable` drops the unused `question` selector and renders `<QuestionPlate />` (self-sourced from store).
- Verified: `npm run lint` and `npm run build` pass; served HTML confirms first load shows the input prompt (no fixture question/brief/advisor-result content leaks).

## Out of Scope

- What happens *after* `planning` (the staged progression) — that is feature 09.
- Real planner/AI classification of the question (Phase 3, feature 13).
- Prebuilt demo-scenario picker (feature 17).
- Autocomplete, question history, or saved sessions (v2).

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
- **2026-07-03** — Completed feature 08 question input & session start: made `QuestionPlate` the first `'use client'` interactive surface — idle renders a validated textarea + brass "Convene the table" submit, running renders the locked-in question. Submit wires `setQuestion` + `startSession` (`idle → planning`, advisors reset to `waiting`, prior results cleared). Validation is trimmed-non-empty with a 280-char cap and an instrument-style hint. Changed the store to initialize to an empty `IDLE_SESSION` so first load shows the input prompt instead of fixture content; `StrategyTable` drops the unused `question` selector. Verified with `npm run lint`, `npm run build`, and a served-HTML idle-state smoke check. Merged to `main`.
