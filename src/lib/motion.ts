/**
 * Motion primitives for the "Brass & Neon" mechanical feel. Motion here is
 * deliberately un-smooth — ticking, snapping, flickering — never eased fades.
 */

/**
 * A stepped easing function for Framer Motion `transition.ease`. Quantizes
 * progress into `steps` discrete jumps so a tween reads like a ratcheting
 * mechanism (the CSS `steps()` equivalent), e.g. a gauge needle ticking.
 */
export function steppedEase(steps: number) {
  return (progress: number) => Math.round(progress * steps) / steps;
}

/** Six-step tick, matching the mockup's `@keyframes tick` steps(6). */
export const tickEase = steppedEase(6);

/**
 * Neon flicker-on opacity keyframes — a tube stuttering to life, not a fade.
 * Feed `NEON_FLICKER_OPACITY` to `animate.opacity` and `NEON_FLICKER_TIMES` to
 * `transition.times` for the uneven strobe.
 */
export const NEON_FLICKER_OPACITY = [0, 1, 0.25, 1, 0.55, 1];
export const NEON_FLICKER_TIMES = [0, 0.1, 0.2, 0.4, 0.55, 1];
