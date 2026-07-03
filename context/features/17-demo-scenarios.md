# Prebuilt Demo Scenarios

## Status

Not Started

## Goals

- Add 2–3 prebuilt demo scenarios (question + full canned planner/advisor/moderator results) that run the entire experience with **zero live API calls**.
- Add a small in-theme picker (e.g. brass toggle or "load a scenario" control) so a visitor with no API key can still watch a full animated session.
- Demo scenarios reuse the real components and motion (features 09–15) — only the data source is canned, not the UI.
- Clearly indicate when a session is a demo vs. a live run (subtle instrument label), without breaking the atmosphere.
- Verify in browser: with no API key configured, selecting a demo scenario plays a complete session end-to-end.

## Notes

- Prebuilt demo scenarios are an explicit cost control: overview "Cost Controls" ("Provide several prebuilt demo scenarios that require no live API call").
- Generalizes the single fixture from feature 02 into a small library of canned sessions.
- **Depends on:** features 09 (motion), 15 (full workflow shape to canned-mirror). Ideally also 16 so demos report zero cost.

## Out of Scope

- Saving user-created sessions as new demos (v2).
- Responsive/a11y/perf passes (features 18–20) — those apply to demos too but are their own features.
