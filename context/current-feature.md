# Vercel Preview Deployment & CI/CD

## Status

In Progress — CI workflow and deployment documentation implemented; pending Vercel project connection/live URL.

## Goals

- Create a lightweight GitHub Actions CI workflow that runs install, lint, and `npm run build` on pull requests and pushes.
- Document the Vercel setup path in `README.md`, including the production/preview deployment flow and any required secrets or dashboard settings.
- Record the eventual Vercel preview/live URL in `README.md` once the project is connected.
- Keep the deployment path stateless: Vercel free tier, no database, no auth, no server-side session persistence, and no AI provider variables yet.
- Verify the Phase 1 static prototype still builds cleanly before the feature is considered complete.

## Notes

- Active feature spec: `context/features/06-vercel-preview-ci.md`.
- Branch: `feature/vercel-preview-ci` (created from clean `main`; feature 05 already merged).
- This feature happens immediately after feature 05 because the static visual prototype is now worth deploying.
- Official docs checked on 2026-07-03:
  - `actions/checkout` latest release is `v7.0.0`; use `actions/checkout@v7`.
  - `actions/setup-node` latest release is `v6.4.0`; use `actions/setup-node@v6`.
  - Vercel's GitHub integration creates automatic deployments on branch pushes, production updates from the production branch, and PR preview URLs.
- Prefer Vercel's built-in GitHub integration for deployments; the GitHub Actions workflow should be CI/build signal only unless a later task explicitly requires custom Vercel CLI deploys.
- CI should use `npm ci`, `npm run lint`, and `npm run build`.
- Added `.github/workflows/ci.yml` with install/lint/build checks for pull requests plus pushes to `main`, `feature/**`, and `fix/**`.
- Replaced the stock README with project-specific local development, CI, and Vercel setup documentation.
- Vercel project creation and URL recording require the repository to be imported into the user's Vercel account.
- Verification: `npm run lint` passes; `npm run build` passes.
- AI provider environment variables are not required yet; those arrive with feature 12 and are production-checked again in feature 22.
- No UI changes are planned for this feature except minimal fixes if the deployed/static build exposes a rendering problem.

## Out of Scope

- Real AI provider keys, model configuration, or API-route production behavior (features 12-16 and final readiness in feature 22).
- Custom domain setup, launch checklist, or production monitoring polish (feature 22).
- Adding a database, durable cache, auth, or user accounts.
- Changing the app UI beyond any minimal fixes needed for the deployed Phase 1 build to render correctly.

## History

- **2026-06-28** — Initial Next.js + Tailwind CSS v4 setup. Scaffolded from Create Next App, removed default boilerplate (SVGs, AGENTS.md), added project context docs. Committed (`chore: initial nextjs and tailwind set up`) and pushed to remote `rikilamadrid/devstash`.
- **2026-06-29** — Added mock data (`src/lib/mock-data.ts`) and dashboard screenshots. Committed (`feat: add mock data and dashboard screenshots`).
- **2026-07-03** — Added Vercel deployment planning to the feature roadmap: inserted early preview CI/CD as feature 06, renumbered the existing features through 21, added final production-readiness as feature 22, and aligned the overview/convention docs with the stateless Vercel deployment path.
- **2026-07-03** — Completed feature 01 theme foundation: removed Create Next App boilerplate, added Brass & Neon Tailwind tokens, wired the three project typefaces, and applied the base room background with scanlines and vignette.
- **2026-07-03** — Completed feature 02 core types and fixture data: added strict TypeScript strategy models in `src/types/strategy.ts`, added the canonical Madrid demo session in `src/lib/fixtures.ts`, and verified with `npm run build` plus `npm run lint`.
- **2026-07-02** — Completed feature 03 app shell and header: added `StrategyTable` layout shell and `CostBadge` brass dial, rendered at `/` with static placeholder regions. Verified with `npm run build` and `npm run lint`.
- **2026-07-02** — Completed feature 04 advisor seats & table surface: added `AdvisorSeat` (per-status brass pocket-gauge), `QuestionPlate`, and the 2x2 seats grid in `StrategyTable`. Also wired the PWA icon set/favicons/web manifest into layout metadata and served the brand `favicon.ico` from `public/` root (removed the default `src/app/favicon.ico` — the app-dir convention broke the build on the non-RGBA `.ico` and overrode the public file). Verified with `npm run build`. Merged to `main`.
- **2026-07-03** — Completed feature 05 live timeline & decision brief: added fixture-driven `WorkflowTimeline` and `DecisionBrief` panels, wired them into the lower split region, and added tokenized success/seal colors. Verified with `npm run lint`, `npm run build`, served markup smoke check, and Ricardo browser review. Merged to `main`.
