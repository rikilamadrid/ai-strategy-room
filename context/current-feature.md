# Errors & Single-Advisor Retry

## Status

Complete — merged to `main` 2026-07-03 (branch `feature/errors-and-retry` pruned). Detailed entry in `context/HISTORY.md`; user-facing summary under `## [Unreleased]` in `CHANGELOG.md`. Next up: feature 11 (timeline replay), which closes out Phase 2 — Workflow state.

## Goals

- **Advisor error state.** An individual advisor can enter `status: 'error'`. Render it in-theme on the seat — a dim/cracked seal-red bezel and a "signal lost" label, needle slumped, no neon flicker (flicker is reserved for a completed argument). No generic browser alert.
- **Workflow-level error notice in the timeline.** When an advisor faults, append a timeline row in the seal-red error tone (a new `TimelineEvent` `state: 'error'`) so the failure is legible in the live-discussion log. The rest of the workflow keeps running — a single advisor erroring does **not** halt the session.
- **"Try another angle" control.** On a `complete` or `error` advisor, a small brass control re-runs *only that advisor*: it re-enters `thinking` (needle ticks) and then settles back to `complete` with an alternate fixture argument. It never reruns the whole workflow (hard rule) — no new stage transitions, no re-plan, no moderator rerun.
- **Simulated failure path for testing.** A fixture flag (`simulatedErrorAdvisorId`) forces one advisor to error during the simulated run so the error + recovery UX is verifiable. Default `null` (clean demo run); flip to an advisor id to exercise the path.
- Verify in browser: force an advisor error, confirm the other three advisors + mapping/moderating/brief are unaffected, then hit "Try another angle" to take the errored advisor back to completion.

## Notes

- Store already models `error` for both `WorkflowStatus` and `Advisor['status']`, and `canTransitionWorkflow` already permits a whole-workflow `error` transition (from any non-idle/non-complete/non-error stage). This feature exercises the *per-advisor* error + retry path; the whole-workflow `error` status stays reachable via `advanceStage('error')` but the simulation does not force it (single-advisor error ≠ workflow error).
- Reuses feature-07 store actions (`setAdvisorStatus`, `setAdvisorResult`) and the feature-09 timed-resolution pattern. Retry is seat-local: a `setTimeout` in `AdvisorSeat` drives `thinking → complete`, cleaned up on unmount. The gauge animates against **real** `thinking` status — no fake activity.
- New store action `logAdvisorError(message, timestampLabel)` mirrors `logTimelineEvent` (flips a prior `now` head to `done`) but stamps an `error` row instead of a `now` row.
- New `TimelineEvent` state `'error'` renders seal-red with a neon glow so the muted wax tone stays legible on the gunmetal background.
- Alternate retry arguments live in `advisorRetryResults` (fixtures) — one "another angle" per advisor. Note: the per-advisor argument *text* is not yet rendered on the seat (that panel is a later feature), so the observable retry feedback is the gauge (thinking → flicker-on) and status label; the regenerated argument lands in store state.
- Error styling tracks real state (per the overview's "no neon for its own sake" caution) — the seal bezel only appears on a real `error` status.
- **Depends on:** features 07 (states/actions) and 09 (per-advisor animated resolution). Both done.
- **Cost budget:** no effect — pure client-side simulation + retry on a timer, zero LLM requests.
- Respect `prefers-reduced-motion` where cheap (reuse the existing gauge/timeline gates); full still-frame a11y is feature 19.

## Out of Scope

- Real API error handling, timeouts, rate limits (Phase 3 — this retries against the *simulation*).
- Whole-workflow retry/restart beyond `reset` (single-advisor retry is the v1 feature).
- Timeline replay (feature 11).
- A per-advisor argument panel that would render the regenerated text (later feature).
- Toast library wiring — errors stay in-canvas / in-timeline for v1.

## History

Moved to `context/HISTORY.md` (detailed per-feature log) and summarized in the root `CHANGELOG.md` (user-facing, Keep a Changelog format). Append there once a feature is merged — not here.
