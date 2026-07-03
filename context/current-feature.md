# Advisor Seats & Table Surface

## Status

In Progress — implemented, pending review/merge

## Goals

- Build the table surface: brass-framed panel with the faint concentric-etching radial background and inset shadow, filling the table region of the shell.
- Create `src/components/advisors/AdvisorSeat.tsx`: a single seat = brass pocket-gauge (glass face + needle) plus the advisor name (Special Elite) and role/status label (cyan).
- Support three static visual states driven by the advisor's `status` prop: `waiting` (idle needle), `thinking` (amber bezel), `complete`/active (pink bezel glow). Needle angle differs per state.
- Lay the four seats out in a 2×2 grid around the center, mapped from the fixture advisor array (feature 02).
- Create `src/components/table/QuestionPlate.tsx`: centered brass plate with the `YOUR QUESTION` eyebrow and the italic question text from the fixture.
- Rendered result visually matches the reference screenshot's table region.

## Notes

- Active feature spec: `context/features/04-advisor-seats-and-table.md`.
- Branch: `feature/advisor-seats-and-table` (off `main`, clean tree; feature 03 merged).
- Implementation:
  - `AdvisorSeat.tsx` — per-status visual config (`waiting`/`thinking`/`complete`/`error`) driving seat border/glow, needle color, needle glow, and a fixed needle angle. Needle rendered as a real element (not the mockup's pseudo-element) so angle/color are data-driven. **Static — no `tick` animation** (deferred to feature 09).
  - `QuestionPlate.tsx` — brass plate, pink-soft `YOUR QUESTION` eyebrow, italic question from fixture.
  - `StrategyTable.tsx` — replaced the table-surface placeholder with a `<section>` holding the 2×2 seats grid (mapped from `demoStrategySession.advisors`) + the question plate. Lower split panels remain placeholders (feature 05).
- Status → role label mapping: `waiting → "waiting"`, `thinking → "thinking…"`, `complete → "argument ready"`, `error → "error"`.
- Waiting seats show a subtle dimmed brass idle needle (spec calls for an idle needle; kept faint to match the mockup's near-empty waiting bezels).
- Tokens only — Brass & Neon vars from feature 01; no one-off hex/font values.
- Verification: `npm run build` passes (no type errors), `npm run lint` passes. Browser screenshot at `http://localhost:3004/` confirmed the table region matches the reference (Skeptic amber/thinking, Strategist pink/argument-ready, other two waiting).
- This feature is static markup/display only. No AI calls, state machine, persistence, or real observability math.

## Out of Scope

- Ticking-needle animation, neon flicker-on, streaming state changes (feature 09).
- Connecting lines between advisors (agreement brass lines / conflict neon cracks).
- Click-to-open focused advisor file-card panel.
- Timeline and brief (feature 05).

## History

- **2026-06-28** — Initial Next.js + Tailwind CSS v4 setup. Scaffolded from Create Next App, removed default boilerplate (SVGs, AGENTS.md), added project context docs. Committed (`chore: initial nextjs and tailwind set up`) and pushed to remote `rikilamadrid/devstash`.
- **2026-06-29** — Added mock data (`src/lib/mock-data.ts`) and dashboard screenshots. Committed (`feat: add mock data and dashboard screenshots`).
- **2026-07-03** — Added Vercel deployment planning to the feature roadmap: inserted early preview CI/CD as feature 06, renumbered the existing features through 21, added final production-readiness as feature 22, and aligned the overview/convention docs with the stateless Vercel deployment path.
- **2026-07-03** — Completed feature 01 theme foundation: removed Create Next App boilerplate, added Brass & Neon Tailwind tokens, wired the three project typefaces, and applied the base room background with scanlines and vignette.
- **2026-07-03** — Completed feature 02 core types and fixture data: added strict TypeScript strategy models in `src/types/strategy.ts`, added the canonical Madrid demo session in `src/lib/fixtures.ts`, and verified with `npm run build` plus `npm run lint`.
- **2026-07-02** — Completed feature 03 app shell and header: added `StrategyTable` layout shell and `CostBadge` brass dial, rendered at `/` with static placeholder regions. Verified with `npm run build` and `npm run lint`.
