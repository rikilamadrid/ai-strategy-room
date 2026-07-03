# Question Input & Session Start

## Status

Complete — merged to `main` on 2026-07-03. Branch pruned.

## Goals

- Turn the question plate into an interactive entry point: when `status === 'idle'`, the plate shows a text input + a brass "Convene the table" submit control; when a session is running, it shows the locked-in question (as in Phase 1).
- On submit, call the store's `setQuestion` + `startSession`, transitioning `idle → planning` and resetting advisors to `waiting`.
- Validate input client-side: non-empty, trimmed, reasonable max length; disable submit and show an inline instrument-style hint when invalid.
- Empty/initial state: on first load with no session, the table presents the input prompt rather than fixture content.
- Verify in browser: typing a question and submitting advances the visible status and clears prior results.

## Notes

- Active feature spec: `context/features/08-question-input.md`.
- Branch: `feature/question-input` (to be created).
- Question plate to extend: `src/components/table/QuestionPlate.tsx` (feature 04) + mockup `.question-plate` styling (lines 139–149).
- This is the first `'use client'` interactive surface — keep it isolated (only client where interactivity is needed).
- Store actions confirmed present in `src/stores/strategy-store.ts`: `setQuestion`, `startSession`, `reset`, plus `WorkflowStatus` transitions.
- **Depends on:** feature 07 (store actions `setQuestion`, `startSession`, `reset`) — done.

### Implementation

- Store now initializes to an `IDLE_SESSION` (status `idle`, empty question, advisors reset to `waiting`, empty timeline, no brief). The demo roster still supplies advisor names/purposes; `reset()` left unchanged (still returns the demo session — not wired to any UI yet, out of scope here).
- `QuestionPlate` is now a `'use client'` component. When `status === 'idle'` it renders a `<form>` with a labeled textarea + brass "Convene the table" submit; otherwise it renders the locked-in question exactly as before.
- Validation: trimmed non-empty required (submit disabled otherwise); hard `maxLength={280}` cap; instrument-style hint shows "characters left" normally and an amber "A question is required" when the field holds only whitespace.
- On submit: `setQuestion(trimmed)` then `startSession(trimmed)` → `idle → planning`, advisors reset to `waiting`, prior timeline/brief cleared.
- `StrategyTable` drops the unused `question` selector and renders `<QuestionPlate />` (self-sourced from store).
- Verified: `npm run lint` and `npm run build` pass; served HTML confirms first load shows the input prompt (no fixture question/brief/advisor-result content leaks).

## Out of Scope

- What happens *after* `planning` (the staged progression) — that is feature 09.
- Real planner/AI classification of the question (Phase 3, feature 13).
- Prebuilt demo-scenario picker (feature 17).
- Autocomplete, question history, or saved sessions (v2).

## History

Moved to `context/HISTORY.md` (detailed per-feature log) and summarized in the root `CHANGELOG.md` (user-facing, Keep a Changelog format). Append there once a feature is merged — not here.
