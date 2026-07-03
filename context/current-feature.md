# Streaming Simulation & Mechanical Motion

## Status

Complete — merged to `main` 2026-07-03 (branch `feature/streaming-simulation` pruned). Detailed entry in `context/HISTORY.md`; user-facing summary under `## [Unreleased]` in `CHANGELOG.md`. Next up: feature 10 (error/retry paths) or feature 11 (replay control), both deferred out of this feature.

Interpretation note: the "advisor arguments reveal teletype/punch-card style" goal was realized on the **timeline rows** (each advisor filing its argument types in), per overview lines 90 & 117 — "the timeline can replay the order of the workflow, teletype-style." The dedicated per-advisor argument panel (overview line 89) is a later feature and was out of scope here.

## Goals

- Add Framer Motion and drive a timed, fixture-backed progression through the workflow stages after `startSession`: `planning → advising` (advisors resolve in parallel) `→ mapping → moderating → complete`.
- Advisor gauges animate per state: idle needle still, `thinking` needle ticks back and forth (amber), `complete` needle settles and the bezel flickers on (pink) — neon flicker-on, not fade-in.
- Timeline rows append and advance in real time (the `now` row is amber; resolved rows flip to `done`/green) as each simulated stage completes.
- Advisor arguments reveal teletype/punch-card style rather than appearing instantly.
- The decision brief "stamps in" with a wax-seal-style reveal only once `status === 'complete'` (not a soft fade).
- Motion is mechanical (ticking, flicker, shutter/gear transition between stages), and every glow tracks a real state — no idle decoration.

## Notes

- Active feature spec: `context/features/09-streaming-simulation-and-motion.md`.
- Branch: `feature/streaming-simulation` (to be created).
- Ticking-needle keyframe reference: mockup `context/ai-strategy-table-mockup.html` `@keyframes tick` + `.seat.thinking` (lines 111–135).
- Timeline row states (`done`/`now`/pending) already modeled in feature 02; here they animate over time.
- Motion library: Framer Motion (verify current stable version against docs before installing). Motion direction: overview "Motion" section.
- Store trigger confirmed: `startSession` (feature 07/08) transitions `idle → planning`; this feature advances the machine forward on a timer through the remaining stages.
- **Depends on:** features 07 (state machine to advance) and 08 (something to trigger start) — both done. Uses the same fixture data — no network calls.
- **Cost budget:** no effect — pure client-side simulation on a timer, zero LLM requests.
- Respect `prefers-reduced-motion` at build time where cheap, but full still-frame a11y handling is feature 19 (out of scope here).

## Out of Scope

- Real streamed tokens from a model (Phase 3, feature 14) — this is a *simulation* on a timer.
- Error/retry paths (feature 10) and replay control (feature 11).
- Reduced-motion still-frame handling (Phase 4 accessibility, feature 19) — build motion here, gate it for a11y later.
- Agreement/conflict connector lines (later polish, not required for v1 sign-off).

## History

Moved to `context/HISTORY.md` (detailed per-feature log) and summarized in the root `CHANGELOG.md` (user-facing, Keep a Changelog format). Append there once a feature is merged — not here.
