# Timeline Replay

## Status

Not Started

## Goals

- Record the ordered sequence of workflow events during a session (stage transitions + advisor resolutions) as a replayable log in the store.
- Add a replay control to the timeline panel that re-plays the recorded event order teletype-style, without making any new calls or mutating the final session result.
- During replay, the timeline re-reveals rows in sequence and (optionally) re-triggers the corresponding gauge/brief reveals, then restores the final completed state when replay ends.
- Replay is only available once `status === 'complete'`; the control is disabled mid-session.
- Verify in browser: complete a session, hit replay, watch the sequence re-run and settle back to the final state.

## Notes

- Replay is called out in the overview "Key Interactions" ("The timeline can replay the order of the workflow, teletype-style").
- Reuse the teletype reveal built in feature 09 rather than reimplementing it.
- **Depends on:** features 07 (event log), 09 (reveal animations). This completes **Phase 2 — Workflow state**.

## Out of Scope

- Scrubbing/seeking to an arbitrary point (v1 is play-from-start only).
- Exporting or sharing a replay (v2).
- Reduced-motion replay behavior (handled in accessibility, feature 19).
- Real-data replay differences (Phase 3 changes the data source, not the replay mechanic).
