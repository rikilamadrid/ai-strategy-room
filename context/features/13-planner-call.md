# Planner Call

## Status

Not Started

## Goals

- Create the strategy API route (`src/app/api/strategy/route.ts`) with a planner action that takes the user's question and returns a validated planner result: decision classification, extracted constraints, and four chosen advisor roles.
- Validate the model output against the planner Zod schema (feature 12); on validation failure, surface a clean typed error rather than passing malformed data downstream.
- Replace the fixture-seeded advisor roster during the `planning` stage with the planner's chosen roles: the four seats now reflect real, question-specific advisors.
- Wire the store so `startSession` triggers the planner call and populates advisors + a "constraints parsed" timeline row on success.
- Verify in browser: submitting a real question produces four contextually-appropriate advisor roles and advances to `advising`.

## Notes

- Planner is call #1 of the target 2–3 requests/session: overview "Recommended Call Pattern" step 1.
- Use a low-cost model for role generation: overview "Cost Controls".
- Reuse the `error` handling path from feature 10 for planner failures.
- **Read the App Router route-handler guide in `node_modules/next/dist/docs/` first (per `AGENTS.md`).**
- **Depends on:** features 07 (store), 12 (client + schemas). First real network call in the app.

## Out of Scope

- Advisor perspective generation (feature 14) and moderator synthesis (feature 15).
- Caching (feature 16).
- Streaming — the planner response can be a single structured call; streaming is for advisors.
