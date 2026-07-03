# App Shell & Header Bar

## Status

Not Started

## Goals

- Build the outer page frame: centered max-width container (~900px) sitting above the scanlines/vignette layers from feature 01.
- Create `src/components/table/StrategyTable.tsx` as the top-level layout shell that arranges header, table surface region, and the lower split region (surfaces can be empty placeholders for now).
- Build the header bar: brass-framed panel with the `AI Strategy Table` wordmark (Cinzel display face) + the `a cinematic decision chamber` eyebrow (Special Elite, cyan).
- Create `src/components/observability/CostBadge.tsx`: a brass dial glyph with a static needle plus `SESSION COST $0.01` text, styled as an instrument reading. Display only.
- Render the shell at the `/` route (`src/app/page.tsx`); layout matches the header/frame proportions of the reference screenshot.

## Notes

- Header markup + styles: mockup `context/ai-strategy-table-mockup.html` `.headerbar`/`.wordmark`/`.gauge-badge`/`.dial` (lines 47–85, markup 191–194).
- Frame container: mockup `.frame` (lines 42–44).
- Reference screenshot: `context/screenshots/Screenshot 2026-07-02 at 5.20.09 PM.png` (top header band).
- Follows project structure: `components/table/StrategyTable.tsx`, `components/observability/CostBadge.tsx`.
- **Depends on:** feature 01 (theme + fonts). The lower/table regions are placeholders filled by features 04 and 05.

## Out of Scope

- Advisor seats, question plate, table etching (feature 04).
- Timeline and decision brief content (feature 05).
- Real/animated cost values, token counts, cache hits (Phase 3, feature 16).
- Any interactivity or state — everything here is a server component / static markup.
