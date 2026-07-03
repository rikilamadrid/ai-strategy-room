# Advisor Seats & Table Surface

## Status

Not Started

## Goals

- Build the table surface: brass-framed panel with the faint concentric-etching radial background and inset shadow, filling the table region of the shell.
- Create `src/components/advisors/AdvisorSeat.tsx`: a single seat = brass pocket-gauge (glass face + needle) plus the advisor name (Special Elite) and role/status label (cyan).
- Support three static visual states driven by the advisor's `status` prop: `waiting` (idle needle), `thinking` (amber bezel), `complete`/active (pink bezel glow). Needle angle differs per state.
- Lay the four seats out in a 2×2 grid around the center, mapped from the fixture advisor array (feature 02).
- Create `src/components/table/QuestionPlate.tsx`: centered brass plate with the `YOUR QUESTION` eyebrow and the italic question text from the fixture.
- Rendered result visually matches the reference screenshot's table region: Skeptic shows thinking (amber), Strategist shows argument-ready (pink), the other two waiting.

## Notes

- Table surface CSS: mockup `context/ai-strategy-table-mockup.html` `.table-surface` (lines 88–96).
- Seats + pocket-gauge + state variants + tick keyframe: mockup lines 97–137 (note the `tick` animation exists in the mockup but stays **static** here — a single fixed needle angle per state, no animation yet).
- Question plate: mockup `.question-plate` (lines 139–149, markup 216–219).
- Reference screenshot: `context/screenshots/Screenshot 2026-07-02 at 5.20.09 PM.png` (center table region).
- **Depends on:** 01 (theme), 02 (types/fixtures), 03 (shell provides the table region).

## Out of Scope

- Ticking-needle animation, neon flicker-on, streaming state changes (Phase 2, feature 09).
- Connecting lines between advisors (agreement brass lines / conflict neon cracks) — Phase 2 or later polish, not here.
- Click-to-open focused advisor file-card panel (Phase 2 interactivity).
- Timeline and brief (feature 05).
