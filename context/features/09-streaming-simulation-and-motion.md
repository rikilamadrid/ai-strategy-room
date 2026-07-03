# Streaming Simulation & Mechanical Motion

## Status

Not Started

## Goals

- Add Framer Motion and drive a timed, fixture-backed progression through the workflow stages after `startSession`: `planning → advising` (advisors resolve in parallel) `→ mapping → moderating → complete`.
- Advisor gauges animate per state: idle needle still, `thinking` needle ticks back and forth (amber), `complete` needle settles and the bezel flickers on (pink) — neon flicker-on, not fade-in.
- Timeline rows append and advance in real time (the `now` row is amber; resolved rows flip to `done`/green) as each simulated stage completes.
- Advisor arguments reveal teletype/punch-card style rather than appearing instantly.
- The decision brief "stamps in" with a wax-seal-style reveal only once `status === 'complete'` (not a soft fade).
- Motion is mechanical (ticking, flicker, shutter/gear transition between stages), and every glow tracks a real state — no idle decoration.

## Notes

- Ticking-needle keyframe reference: mockup `context/ai-strategy-table-mockup.html` `@keyframes tick` + `.seat.thinking` (lines 111–135).
- Timeline row states (`done`/`now`/pending) already modeled in feature 02; here they animate over time.
- Motion library: project overview "Suggested Tech Stack" (Framer Motion). Motion direction: overview "Motion" section.
- **Depends on:** features 07 (state machine to advance) and 08 (something to trigger start). Uses the same fixture data — no network calls.

## Out of Scope

- Real streamed tokens from a model (Phase 3, feature 14) — this is a *simulation* on a timer.
- Error/retry paths (feature 10) and replay control (feature 11).
- Reduced-motion still-frame handling (Phase 4 accessibility, feature 19) — build motion here, gate it for a11y later.
- Agreement/conflict connector lines (later polish, not required for v1 sign-off).
