# Advisor Perspectives Call

## Status

Not Started

## Goals

- Extend the strategy route with the advisor step: given the question + planner constraints + four roles, produce each advisor's argument, confidence, and risks, validated against the advisor Zod schema.
- Prefer one structured call returning all four perspectives (per the cost target); use parallel calls only if real streaming per-advisor is worth the extra requests — document which was chosen and why.
- Replace the Phase 2 simulation with real results: advisor gauges move on real state changes, arguments reveal (teletype) as real content arrives, timeline rows reflect actual advisor completion.
- Enforce a fixed word budget per advisor so responses stay compact and structured (no walls of prose).
- Each advisor's private reasoning is never exposed — only the finished argument/risks are shown.
- Verify in browser: a real question yields four distinct, on-role, budget-bounded arguments with confidence values.

## Notes

- Advisor call is step #2: overview "Recommended Call Pattern" step 2 (all four in one structured response, or parallel only when streaming is worth it).
- Word budget + no chain-of-thought: overview "Cost Controls" and "Things to Avoid".
- The teletype reveal + gauge motion already exist (feature 09) — swap the data source from timer to real response.
- **Depends on:** features 09 (motion), 12 (schemas), 13 (planner output feeds this).

## Out of Scope

- Moderator synthesis / final brief from real data (feature 15).
- Caching and single-advisor real regeneration cost display (feature 16).
- Adding a fifth advisor or multi-round debate (explicitly out per overview "Things to Avoid").
