# Moderator Synthesis

## Status

Not Started

## Goals

- Extend the strategy route with the moderator step: given the four validated advisor outputs, synthesize a `DecisionBrief` (recommendation, confidence, agreements, disagreements, risks, unknowns, next action), validated against the moderator Zod schema.
- Populate the decision-brief panel with the real synthesized brief and trigger the existing wax-seal stamp-in reveal on `status === 'complete'`.
- The agreement/conflict mapping (which advisors agree vs. disagree) is reflected in the brief's `agreements`/`disagreements` fields.
- Use a low-cost model for moderation and keep the brief structured (no long unstructured prose).
- Verify in browser: a full real session (question → planner → advisors → moderator) ends in a coherent, validated decision brief that visually matches the Phase 1 brief layout.

## Notes

- Moderator is step #3, completing the 2–3 request target: overview "Recommended Call Pattern" step 3.
- Brief structure must match the `DecisionBrief` type/schema (features 02, 12) and the brief component (feature 05).
- Legibility of the brief always wins over atmosphere: overview "Things to Avoid".
- **Depends on:** features 05 (brief UI), 12 (schema), 14 (advisor outputs feed synthesis). This completes the real end-to-end workflow.

## Out of Scope

- Caching, cost/latency/cache-hit instrumentation (feature 16).
- Demo scenarios that skip the live call (feature 17).
- Editing/regenerating the brief itself (v1 regeneration is per-advisor only).
