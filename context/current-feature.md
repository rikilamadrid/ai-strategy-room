# Vercel Deployment Planning

## Status

Done

## Goals

- Add an early Vercel deployment feature after Phase 1 so the project gets a live preview URL and CI/CD pipeline before later workflow and AI work begins.
- Renumber the existing feature specs so current `06` through `20` become `07` through `21`.
- Fix feature dependency and out-of-scope cross-references after renumbering.
- Add a final production deployment readiness feature covering environment variables, production checks, Vercel project settings, optional domain hookup, and final showcase readiness.
- Keep the app stateless and preserve the 2–3 LLM request budget in the updated planning docs.

## Notes

- User confirmed the deployment work should happen in both places: early after the first visual prototype, plus a later production-readiness pass.
- Early deployment should include GitHub Actions CI/CD so pushes can build/deploy to Vercel and the live URL can be wired into a portfolio/showcase site.
- This is a documentation/planning change only; no app code or package installation is needed.

## History

- **2026-06-28** — Initial Next.js + Tailwind CSS v4 setup. Scaffolded from Create Next App, removed default boilerplate (SVGs, AGENTS.md), added project context docs. Committed (`chore: initial nextjs and tailwind set up`) and pushed to remote `rikilamadrid/devstash`.
- **2026-06-29** — Added mock data (`src/lib/mock-data.ts`) and dashboard screenshots. Committed (`feat: add mock data and dashboard screenshots`).
- **2026-07-03** — Added Vercel deployment planning to the feature roadmap: inserted early preview CI/CD as feature 06, renumbered the existing features through 21, added final production-readiness as feature 22, and aligned the overview/convention docs with the stateless Vercel deployment path.
