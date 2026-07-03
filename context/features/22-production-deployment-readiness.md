# Production Deployment Readiness

## Status

Not Started

## Goals

- Audit the Vercel project settings before launch: build command, framework detection, Node/runtime settings, preview/production branch mapping, and deployment protection expectations.
- Configure and document production environment variables for the AI provider and any Vercel AI SDK settings introduced in Phase 3, without committing secrets.
- Run a final production verification pass: `npm run build`, deployed smoke test, demo scenario path, live AI path when keys are available, cache/cost indicators, responsive layout, accessibility, and reduced-motion behavior.
- Confirm the deployed app remains stateless: no database, no accounts, no server-side session persistence, and only the intended in-memory cache that resets on server restart.
- Wire the final production URL into the portfolio/showcase site or document the exact URL and embed target for that hookup.
- Update `README.md` with final deployment instructions, environment variable reference, demo/live usage notes, and the deployed URL.

## Notes

- This is the final deployment pass after the app is functionally complete, not the first deployment. The early preview pipeline is feature 06.
- Production must preserve the 2-3 LLM request budget: one planner call, one advisor batch, one moderator call, with cache hits and single-advisor regeneration reflected in cost observability.
- Treat missing or invalid AI environment variables as a visible, typed runtime state; do not hide failures behind fixture data except through explicit demo scenarios.
- **Depends on:** all prior features, especially 06 (Vercel pipeline), 12-16 (AI integration + cost observability), 17 (demo scenarios), and 18-21 (portfolio polish).

## Out of Scope

- Adding paid infrastructure, a database, auth, saved sessions, analytics, or a CMS.
- Reworking the AI orchestration beyond production hardening and configuration checks.
- Broad visual redesign or new portfolio content beyond documenting the deployed project accurately.
- Post-v1 features such as sharing, persistence, collaboration, or web research.
