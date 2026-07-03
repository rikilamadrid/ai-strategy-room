# Vercel Preview Deployment & CI/CD

## Status

Not Started

## Goals

- Create the Vercel project after the Phase 1 static prototype is complete and record the preview/live URL in `README.md`.
- Add a GitHub Actions workflow that runs install, lint, and `npm run build` on pull requests and pushes so every feature branch gets a clean CI signal before merge.
- Wire the GitHub repository to Vercel so pushes to `main` produce a production deployment and feature branches produce preview deployments.
- Document the Vercel setup steps, required GitHub/Vercel secrets, and the expected deploy flow for future sessions.
- Verify the deployed Phase 1 prototype renders correctly on the Vercel URL with the Brass & Neon styles, fonts, scanlines, table, timeline, and brief intact.

## Notes

- This feature happens immediately after feature 05, once the static visual prototype is worth showing live.
- This is the portfolio-friendly early deployment: the live URL can be wired into the showcase site and then receive incremental upgrades as later features merge.
- Keep deployment infrastructure light: Vercel free tier, GitHub Actions for CI/build checks, no database, no auth, and no server-side persistence.
- AI provider environment variables are not required yet; those arrive with feature 12 and are production-checked again in feature 22.
- **Depends on:** features 01-05 (Phase 1 visual prototype).

## Out of Scope

- Real AI provider keys, model configuration, or API-route production behavior (features 12-16 and final readiness in feature 22).
- Custom domain setup, launch checklist, or production monitoring polish (feature 22).
- Adding a database, durable cache, auth, or user accounts.
- Changing the app UI beyond any minimal fixes needed for the deployed Phase 1 build to render correctly.
