# Question Input & Session Start

## Status

Not Started

## Goals

- Turn the question plate into an interactive entry point: when `status === 'idle'`, the plate shows a text input + a brass "Convene the table" submit control; when a session is running, it shows the locked-in question (as in Phase 1).
- On submit, call the store's `setQuestion` + `startSession`, transitioning `idle → planning` and resetting advisors to `waiting`.
- Validate input client-side: non-empty, trimmed, reasonable max length; disable submit and show an inline instrument-style hint when invalid.
- Empty/initial state: on first load with no session, the table presents the input prompt rather than fixture content.
- Verify in browser: typing a question and submitting advances the visible status and clears prior results.

## Notes

- Question plate to extend: `src/components/table/QuestionPlate.tsx` (feature 04) + mockup `.question-plate` styling (lines 139–149).
- This is the first `'use client'` interactive surface — keep it isolated per `context/coding-standards.md` (only client where interactivity is needed).
- **Depends on:** feature 07 (store actions `setQuestion`, `startSession`, `reset`).

## Out of Scope

- What happens *after* `planning` (the staged progression) — that is feature 09.
- Real planner/AI classification of the question (Phase 3, feature 13).
- Prebuilt demo-scenario picker (feature 17).
- Autocomplete, question history, or saved sessions (v2).
