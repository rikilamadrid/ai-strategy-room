# Performance & Streaming Stability

## Status

Not Started

## Goals

- Eliminate cumulative layout shift during streaming: incoming advisor arguments and timeline rows must not push existing content around (reserve/animate height).
- Reduce unnecessary re-renders: verify store subscriptions are scoped (seats don't all re-render when one advisor updates); memoize where it measurably helps.
- Optimize font loading (subset/`display` strategy via `next/font`) and confirm no flash of unstyled/invisible text.
- Confirm the production build is clean and reasonably sized; run a Lighthouse pass and record scores, addressing obvious regressions.
- Verify in browser: a full streamed session shows a stable layout (CLS ≈ 0) and smooth mechanical motion without dropped frames on a mid-range profile.

## Notes

- "Streaming UI without layout instability" is an explicit portfolio goal: overview "Portfolio Story" and "Goals" (streaming, performance).
- Builds on feature 18 (responsive) for the layout side and feature 09 for motion.
- **Depends on:** the real streamed workflow (features 09, 14) so measurements are meaningful.

## Out of Scope

- Server-side scaling / edge deployment tuning beyond Vercel free tier defaults.
- Accessibility (feature 19) and responsive reflow (feature 18) — sibling concerns, separate features.
- Micro-optimizations that hurt readability of the code (`context/coding-standards.md`).
