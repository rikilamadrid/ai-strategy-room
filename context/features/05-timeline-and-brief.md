# Live Timeline & Decision Brief

## Status

Not Started

## Goals

- Create `src/components/workflow/WorkflowTimeline.tsx`: the left panel of the lower split — dark terminal-style list of timeline rows (Special Elite, cyan) with per-row states: `done` (green), `now` (amber), `pending` (dim). Renders from fixture `TimelineEvent[]`.
- Create `src/components/brief/DecisionBrief.tsx`: the right panel — aged-parchment card with the recommendation (editorial italic, red left-rule), a `CONFIDENCE — <level>` line, and a bulleted list of agreement / risk / next-action items. Renders from the fixture `DecisionBrief`.
- Wire both panels into the lower split region of `StrategyTable` as a two-column grid.
- Full static prototype now matches the reference screenshot end-to-end (header, seats, question, timeline, brief).
- `npm run build` passes; layout holds on desktop widths.

## Notes

- Timeline CSS + rows: mockup `context/ai-strategy-table-mockup.html` `.timeline` (lines 162–168, markup 223–230).
- Brief CSS + content: mockup `.brief` (lines 169–182, markup 232–241).
- Split grid: mockup `.split` (lines 151–154).
- Confidence is rendered as a qualitative label (e.g. "moderate") mapped from the numeric `confidence` field in the `DecisionBrief` type.
- Reference screenshot: `context/screenshots/Screenshot 2026-07-02 at 5.20.09 PM.png` (bottom two panels).
- **Depends on:** 01, 02, 03; sits alongside 04. This completes **Phase 1 — Visual prototype**.

## Out of Scope

- Wax-seal stamp-in reveal animation for the brief (Phase 2 streaming, feature 09).
- Teletype reveal / replay of the timeline (Phase 2, features 09 and 11).
- Real synthesized brief content from a model (Phase 3, feature 15).
- Copy/share/export of the brief (v2, not in v1).
