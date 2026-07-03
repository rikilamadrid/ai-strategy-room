# Live Timeline & Decision Brief

## Status

Complete — merged to `main`.

## Goals

- Create `src/components/workflow/WorkflowTimeline.tsx`: the left panel of the lower split — dark terminal-style list of timeline rows (Special Elite, cyan) with per-row states: `done` (green), `now` (amber), `pending` (dim). Renders from fixture `TimelineEvent[]`.
- Create `src/components/brief/DecisionBrief.tsx`: the right panel — aged-parchment card with the recommendation (editorial italic, red left-rule), a `CONFIDENCE — <level>` line, and a bulleted list of agreement / risk / next-action items. Renders from the fixture `DecisionBrief`.
- Wire both panels into the lower split region of `StrategyTable` as a two-column grid.
- Full static prototype now matches the reference screenshot end-to-end (header, seats, question, timeline, brief).
- `npm run build` passes; layout holds on desktop widths.

## Notes

- Active feature spec: `context/features/05-timeline-and-brief.md`.
- Branch: `feature/timeline-and-brief` (started from clean `main`; feature 04 already merged).
- Timeline CSS + rows should follow mockup `.split`, `.panel`, and `.timeline` styles in `context/ai-strategy-table-mockup.html`.
- Brief CSS + content should follow mockup `.brief`, `.rec`, and `.conf` styles in `context/ai-strategy-table-mockup.html`.
- Reference screenshot: `context/screenshots/Screenshot 2026-07-02 at 5.20.09 PM.png` (bottom two panels).
- Confidence is rendered as a qualitative label mapped from the numeric `confidence` field.
- Implementation added `WorkflowTimeline` and `DecisionBrief`, then replaced the lower split placeholders in `StrategyTable` with fixture-driven panels.
- Added `success` and `seal` color tokens from the mockup so state color and the brief rule stay token-driven.
- Verification: `npm run lint` passes; `npm run build` passes.
- Served markup smoke check passed against the existing local dev server at `http://localhost:3004/`.
- Browser visual review approved by Ricardo.
- Tokens only — use Brass & Neon vars from feature 01; no one-off palette or font stacks in components.
- This feature is static markup/display only. No AI calls, state machine, persistence, real observability math, or animation.
- Merged to `main` with `merge: timeline and decision brief panels`.

## Out of Scope

- Wax-seal stamp-in reveal animation for the brief (Phase 2 streaming, feature 09).
- Teletype reveal / replay of the timeline (Phase 2, features 09 and 11).
- Real synthesized brief content from a model (Phase 3, feature 15).
- Copy/share/export of the brief (v2, not in v1).

## History

- **2026-06-28** — Initial Next.js + Tailwind CSS v4 setup. Scaffolded from Create Next App, removed default boilerplate (SVGs, AGENTS.md), added project context docs. Committed (`chore: initial nextjs and tailwind set up`) and pushed to remote `rikilamadrid/devstash`.
- **2026-06-29** — Added mock data (`src/lib/mock-data.ts`) and dashboard screenshots. Committed (`feat: add mock data and dashboard screenshots`).
- **2026-07-03** — Added Vercel deployment planning to the feature roadmap: inserted early preview CI/CD as feature 06, renumbered the existing features through 21, added final production-readiness as feature 22, and aligned the overview/convention docs with the stateless Vercel deployment path.
- **2026-07-03** — Completed feature 01 theme foundation: removed Create Next App boilerplate, added Brass & Neon Tailwind tokens, wired the three project typefaces, and applied the base room background with scanlines and vignette.
- **2026-07-03** — Completed feature 02 core types and fixture data: added strict TypeScript strategy models in `src/types/strategy.ts`, added the canonical Madrid demo session in `src/lib/fixtures.ts`, and verified with `npm run build` plus `npm run lint`.
- **2026-07-02** — Completed feature 03 app shell and header: added `StrategyTable` layout shell and `CostBadge` brass dial, rendered at `/` with static placeholder regions. Verified with `npm run build` and `npm run lint`.
- **2026-07-02** — Completed feature 04 advisor seats & table surface: added `AdvisorSeat` (per-status brass pocket-gauge), `QuestionPlate`, and the 2×2 seats grid in `StrategyTable`. Also wired the PWA icon set/favicons/web manifest into layout metadata and served the brand `favicon.ico` from `public/` root (removed the default `src/app/favicon.ico` — the app-dir convention broke the build on the non-RGBA `.ico` and overrode the public file). Verified with `npm run build`. Merged to `main`.
- **2026-07-03** — Completed feature 05 live timeline & decision brief: added fixture-driven `WorkflowTimeline` and `DecisionBrief` panels, wired them into the lower split region, and added tokenized success/seal colors. Verified with `npm run lint`, `npm run build`, served markup smoke check, and Ricardo browser review. Merged to `main`.
