# AI Client Interface & Zod Schemas

## Status

Not Started

## Goals

- Add the Vercel AI SDK, Zod, and a low-cost provider; put the API key in `.env.local` and document required env vars in `README`.
- Create a small `AIClient` interface in `src/lib/ai/client.ts` so the provider/model is swappable behind one seam (no provider specifics leak into components or the store).
- Create `src/lib/ai/schemas.ts` with Zod schemas for the three structured outputs: planner (classification + constraints + four chosen roles), advisor (argument + confidence + risks), and moderator (`DecisionBrief`).
- Ensure the Zod schemas and the TypeScript types from feature 02 agree (derive types from schemas or add a compile-time check so they can't drift).
- Create `src/lib/ai/prompts.ts` scaffolding for the three compact prompts (no live tuning required yet).
- `npm run build` passes; a throwaway script can parse a sample payload against each schema successfully.

## Notes

- Provider must stay swappable behind `AIClient`: project overview "Suggested Tech Stack" ("provider must remain swappable behind a small `AIClient` interface").
- Structured outputs + strict JSON schemas + word budgets: overview "AI Workflow and Cost Control".
- Follow project structure: `lib/ai/client.ts`, `lib/ai/prompts.ts`, `lib/ai/schemas.ts`.
- **Read `node_modules/next/dist/docs/` before writing route/server code (per `AGENTS.md`) — this Next.js version may differ from training data.**
- **Depends on:** feature 02 (types to align with). No UI changes here.

## Out of Scope

- The actual API route and wiring calls into the store (features 13–15).
- Caching and cost instrumentation (feature 16).
- Prompt/word-budget fine-tuning for quality (iterate during 13–15).
