# App Shell & Header Bar

## Status

Complete - Merged

## Goals

- Build the outer page frame: centered max-width container (~900px) sitting above the scanlines/vignette layers from feature 01.
- Create `src/components/table/StrategyTable.tsx` as the top-level layout shell that arranges header, table surface region, and the lower split region.
- Build the header bar: brass-framed panel with the `AI Strategy Table` wordmark (Cinzel display face) and the `a cinematic decision chamber` eyebrow (Special Elite, cyan).
- Create `src/components/observability/CostBadge.tsx`: a brass dial glyph with a static needle plus `SESSION COST $0.01` text, styled as an instrument reading.
- Render the shell at the `/` route (`src/app/page.tsx`) with proportions matching the reference screenshot and mockup.
- Verify in the browser, then run `npm run build` and `npm run lint`.

## Notes

- Active feature: `context/features/03-app-shell-and-header.md`.
- Current repo state: on `main`, clean working tree, feature 02 has been merged (`merge: core types and fixtures`).
- Work started on branch `feature/app-shell-and-header`.
- Implementation added `StrategyTable` and `CostBadge`, rendered at `/`, with static placeholder regions for the table surface and lower split panels.
- Verification: `npm run lint` passes; `npm run build` passes.
- Served markup smoke check passed against the existing local dev server at `http://localhost:3004/`.
- Browser visual verification is still pending because no in-app browser was available in this Codex session and no local Playwright package is installed.
- Header markup and styles should follow `context/ai-strategy-table-mockup.html` `.headerbar`, `.wordmark`, `.gauge-badge`, and `.dial`.
- Reference screenshot: `context/screenshots/Screenshot 2026-07-02 at 5.20.09 PM.png` (top header band).
- Use the existing Brass & Neon tokens from feature 01; do not hardcode one-off palette or font values in components.
- This feature is static markup/display only. No AI calls, state machine, persistence, or real observability math.

## Out of Scope

- Advisor seats, question plate, table etching, or connection lines (feature 04).
- Timeline rows and decision brief content (feature 05).
- Real token/call/cache/latency accounting (feature 16).
- Any interactivity, Zustand/XState state, AI integration, schemas, or API routes.

## History

- **2026-06-28** — Initial Next.js + Tailwind CSS v4 setup. Scaffolded from Create Next App, removed default boilerplate (SVGs, AGENTS.md), added project context docs. Committed (`chore: initial nextjs and tailwind set up`) and pushed to remote `rikilamadrid/devstash`.
- **2026-06-29** — Added mock data (`src/lib/mock-data.ts`) and dashboard screenshots. Committed (`feat: add mock data and dashboard screenshots`).
- **2026-07-03** — Added Vercel deployment planning to the feature roadmap: inserted early preview CI/CD as feature 06, renumbered the existing features through 21, added final production-readiness as feature 22, and aligned the overview/convention docs with the stateless Vercel deployment path.
- **2026-07-03** — Completed feature 01 theme foundation: removed Create Next App boilerplate, added Brass & Neon Tailwind tokens, wired the three project typefaces, and applied the base room background with scanlines and vignette.
- **2026-07-03** — Completed feature 02 core types and fixture data: added strict TypeScript strategy models in `src/types/strategy.ts`, added the canonical Madrid demo session in `src/lib/fixtures.ts`, and verified with `npm run build` plus `npm run lint`.
- **2026-07-02** — Completed feature 03 app shell and header: added `StrategyTable` layout shell and `CostBadge` brass dial, rendered at `/` with static placeholder regions. Verified with `npm run build` and `npm run lint`.
