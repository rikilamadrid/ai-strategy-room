# Timeline Replay

## Status

Complete — feature 11 (`feature/timeline-replay`) is merged to `main`, the feature branch is pruned, and the entry is logged in `context/HISTORY.md` and `CHANGELOG.md`. `npm run lint` and `npm run build` pass; Ricardo confirmed the replay flow in the browser. This feature closes out **Phase 2 — Workflow state**. Next up: Phase 3 — AI integration.

## Goals

- Record the ordered workflow event sequence in store state as a replayable log while a session runs. The log should preserve the sequence of stage-level beats and advisor/error resolutions without mutating the finished session result.
- Add a brass replay control to the live-discussion panel. It is only enabled once `status === 'complete'`; during a running session it stays visibly disabled.
- When replay starts, the timeline should clear and re-reveal the recorded rows teletype-style from the top, with the live head behaving like the original run rather than dumping the full final list at once.
- When replay ends, restore the settled final timeline state exactly as it was after completion. No new workflow run, no planner/advisor/moderator rerun, no fixture reset.
- If it is cheap, re-trigger the final brief stamp at the end of replay so the closeout still feels mechanical rather than abrupt.
- Verify in browser/build: complete a session, replay it, confirm the final state is unchanged after replay.

## Notes

- Replay is explicitly called for in `context/features/11-timeline-replay.md` and the project overview's key interactions.
- Reuse the feature-09 teletype reveal and existing fixture-driven event flow rather than creating a second simulation path.
- Keep replay client-only and cost-neutral: zero network calls, zero LLM requests, no cache changes.
- The canonical record should live in the store, not only inside component-local animation state, so Phase 3 can still replay real structured events later.
- Implementation stores a cloned `replayLog` in Zustand, tracks `isReplaying` / `replayRunId`, replays rows through the existing teletype treatment, and restores the settled `timeline` when replay ends.
- The final brief is re-keyed at replay completion so the stamp can fire again without rerunning the workflow.
- Advisor "Try another angle" controls are disabled while replay runs so replay does not overlap with a single-advisor retry or mutate the settled advisor state mid-replay.
- Verification so far: `npm run lint`, `npm run build`, and `curl -I http://localhost:3004/` pass. Automated browser verification could not complete: the in-app browser backend was unavailable, bundled Playwright browser was missing, system Chrome launched but the CDP verification script required an escalation that was rejected by the approval reviewer due account usage limits.
- Existing unrelated working-tree edits in `AGENTS.md` and `CLAUDE.md` were present before this feature work and are out of scope.
- **Depends on:** features 07 (store/timeline event infrastructure), 09 (simulation + reveal timing), and 10 (error rows should replay in sequence too).

## Out of Scope

- Scrubbing, pause, seek, speed controls, or a mini transport bar.
- Replaying a partial/in-progress session.
- Changing the data source for the simulation or adding persistence.
- Accessibility-specific reduced-motion replay refinements beyond honoring the current reduced-motion gates (feature 19 handles the broader pass).

## History

Moved to `context/HISTORY.md` (detailed per-feature log) and summarized in the root `CHANGELOG.md` (user-facing, Keep a Changelog format). Append there once a feature is merged — not here.
