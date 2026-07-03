# Responsive Layout

## Status

Not Started

## Goals

- Make the full experience usable from mobile through desktop: the 2×2 seat grid, question plate, and timeline/brief split reflow gracefully at narrow widths (e.g. seats stack, split becomes single-column).
- Preserve legibility of the decision brief at every breakpoint — it must never become cramped or clipped (legibility wins over atmosphere).
- Ensure streaming/animation causes no layout shift or reflow jank as content grows on small screens (reserve space for incoming rows/arguments).
- Header and cost instruments remain readable and don't overflow on mobile.
- Verify in browser at representative widths (~375px, ~768px, ~1280px): no horizontal scroll, no overlap, no clipped content.

## Notes

- Responsive information architecture is a portfolio goal: overview "Portfolio Story" and "Goals" (responsive layout).
- Base desktop layout comes from features 03–05; this feature adds the breakpoints.
- Streaming-without-layout-instability overlaps with feature 20 (performance) — here the focus is layout reflow, there it's shift/perf metrics.
- **Depends on:** Phase 1–2 UI complete (features 03–09). Best done after the real workflow (15) so content sizes are realistic.

## Out of Scope

- Accessibility semantics / reduced-motion (feature 19).
- Performance profiling and Lighthouse (feature 20).
- Case-study content page (feature 21).
