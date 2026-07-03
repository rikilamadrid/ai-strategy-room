# Brass & Neon Theme Foundation

## Status

Done

## Goals

- Remove leftover Create Next App boilerplate from `src/app/page.tsx`, `src/app/layout.tsx`, and `src/app/globals.css`.
- Define the full Brass & Neon palette as design tokens in `src/app/globals.css` using the Tailwind v4 `@theme` directive (no `tailwind.config.*` file).
- Tokens must include: `bg` `#0c0a0d`, `bg2` `#17131a`, `brass` `#c9a227`, `brass-dark` `#6e5518`, `brass-light` `#f0d27a`, `pink` `#ff2fb0`, `pink-soft` `#ff7fd0`, `cyan` `#2fd6d6`, `amber` `#ffb347`, `parchment` `#ece0c4`, `ink` `#2a2118`.
- Load the three typefaces via `next/font`: a display face (Cinzel Decorative), a mechanical/typewriter face (Special Elite), and an editorial italic serif (Cormorant Garamond); expose each as a CSS variable.
- Apply the base body treatment: gunmetal radial-gradient background, fixed low-opacity scanlines layer, and an inset vignette at the frame edges — all as reusable, pointer-events-none overlays.
- Page renders a dark room with correct fonts loaded (verify in browser: no FOUT, correct colors sampled, scanlines + vignette visible).

## Notes

- Palette source of truth: project overview "Visual Direction — Brass & Neon" and the mockup `context/ai-strategy-table-mockup.html` `:root` block (lines 9–22).
- Body background / scanlines / vignette CSS to port: mockup lines 24–41.
- Font families used in the mockup: line 7 (`Cinzel Decorative`, `Special Elite`, `Cormorant Garamond`).
- Tailwind v4 is CSS-configured — see `context/coding-standards.md` "Tailwind CSS v4"; theme goes in `globals.css` via `@theme`.
- **This feature is the foundation for every other visual feature.** No dependencies. Do this first.

## Out of Scope

- Any advisor seats, header, table surface, timeline, or brief markup (features 03–05).
- Light mode / theme toggle (v1 is dark-only).
- Film-grain texture and animated motion beyond static scanlines/vignette (motion arrives in Phase 2).
- Font subsetting/performance tuning (Phase 4 performance feature).
