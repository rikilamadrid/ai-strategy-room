# Errors & Single-Advisor Retry

## Status

Not Started

## Goals

- Add an `error` status path to the store: an individual advisor can enter `status: 'error'`, and the whole workflow can enter `WorkflowStatus 'error'`.
- Render advisor error state on the seat (e.g. cracked/dim bezel, error label) and a workflow-level error notice in the timeline, in-theme (no generic browser alert).
- Add a **"Try another angle"** control on a completed or errored advisor that re-runs *only that advisor* (re-enters `thinking`, then resolves) without rerunning the whole workflow.
- Simulate a failure path for testing (e.g. a fixture flag that forces one advisor to error) so the recovery UX is verifiable.
- Verify in browser: force an advisor error, confirm the rest of the session is unaffected, then retry that one advisor to completion.

## Notes

- Single-advisor regeneration is an explicit product requirement: project overview "Key Interactions" ("Try another angle" reruns one advisor) and "Cost Controls".
- Reuses the per-advisor store actions from feature 07 (`setAdvisorStatus`, `setAdvisorResult`).
- Error styling should track real state per the overview's "neon-for-its-own-sake" caution.
- **Depends on:** features 07 (states/actions) and 09 (per-advisor animated resolution to reuse).

## Out of Scope

- Real API error handling, timeouts, rate limits (Phase 3 — this retries against the *simulation*).
- Whole-workflow retry/restart beyond `reset` (single-advisor retry is the v1 feature).
- Replay (feature 11).
- Toast library wiring (keep errors in-canvas / in-timeline for v1).
