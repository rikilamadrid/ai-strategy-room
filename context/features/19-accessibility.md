# Accessibility & Reduced Motion

## Status

Not Started

## Goals

- Keyboard support: the question input, submit, advisor seats, "Try another angle", and replay controls are all reachable and operable by keyboard with visible focus states (brass/neon focus ring in-theme).
- Screen-reader support: advisor status changes and timeline updates announce via appropriate live regions; the decision brief is a properly structured, readable region.
- Implement a **reduced-motion mode** honoring `prefers-reduced-motion`: instruments freeze mid-reading (a still photograph of the machine) instead of ticking/flickering — content still updates, just without mechanical animation.
- Color contrast for text (parchment on dark, brief ink on parchment, cyan labels) meets WCAG AA; state is never conveyed by color alone (add text/label cues for thinking/agreement/conflict/error).
- Verify with keyboard-only navigation and an OS reduced-motion setting toggled on.

## Notes

- Reduced-motion "still photograph" behavior is specified in the overview "Motion" section; accessible motion is a stated portfolio goal ("Portfolio Story").
- Gate the Framer Motion animations from feature 09 behind the reduced-motion check rather than removing them.
- State-not-by-color-alone matters for the thinking/agreement/conflict/error signals.
- **Depends on:** features 09 (motion to gate), 10 (error states), 11 (replay). Applies across all interactive surfaces.

## Out of Scope

- Full localization/RTL (v1 is English).
- Automated a11y test suite (can note as follow-up; manual verification is the bar here).
- Performance metrics (feature 20).
