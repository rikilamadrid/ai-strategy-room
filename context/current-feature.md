# Brass & Neon Theme Foundation

## Status

Done

## Goals

- Remove leftover Create Next App boilerplate from `src/app/page.tsx`, `src/app/layout.tsx`, and `src/app/globals.css`.
- Define the full Brass & Neon palette as Tailwind v4 design tokens in `src/app/globals.css`.
- Load Cinzel Decorative, Special Elite, and Cormorant Garamond via `next/font` and expose them as CSS variables.
- Apply the base gunmetal background, scanlines, and vignette treatment from the mockup.
- Verify `npm run build` passes.

## Notes

- Active feature: `context/features/01-theme-foundation.md`.
- Mockup source: `context/ai-strategy-table-mockup.html` `:root`, body, scanlines, and vignette styles.
- Keep scope to the page shell and global theme; advisor seats, header, table surface, timeline, and brief come later.

## History

- **2026-06-28** — Initial Next.js + Tailwind CSS v4 setup. Scaffolded from Create Next App, removed default boilerplate (SVGs, AGENTS.md), added project context docs. Committed (`chore: initial nextjs and tailwind set up`) and pushed to remote `rikilamadrid/devstash`.
- **2026-06-29** — Added mock data (`src/lib/mock-data.ts`) and dashboard screenshots. Committed (`feat: add mock data and dashboard screenshots`).
- **2026-07-03** — Added Vercel deployment planning to the feature roadmap: inserted early preview CI/CD as feature 06, renumbered the existing features through 21, added final production-readiness as feature 22, and aligned the overview/convention docs with the stateless Vercel deployment path.
- **2026-07-03** — Completed feature 01 theme foundation: removed Create Next App boilerplate, added Brass & Neon Tailwind tokens, wired the three project typefaces, and applied the base room background with scanlines and vignette.
