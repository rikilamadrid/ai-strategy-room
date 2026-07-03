# CLAUDE.md — Working Conventions for This Project

> Read this before every session. It keeps decisions consistent as work continues across multiple Claude Code sessions. Full spec lives in `context/ai-strategy-table-project-overview.md` — this file is the short, load-bearing summary plus rules that are easy to drift on.

---

## What this project is

AI Strategy Table. A cinematic multi-agent decision room, not a chatbot with avatars glued on. "Brass & Neon" visual identity — gunmetal-black background, brass instrument framing, hot pink/cyan neon signal colors, pocket-gauge advisors instead of orbs (Cinzel Decorative + Special Elite + Cormorant Garamond). Next.js App Router + TypeScript strict + Tailwind CSS + Zustand/XState + Zod + Vercel AI SDK, deployed on Vercel.

This is a **simple, stateless app** — no database, no accounts, no server-side persistence. A session lives entirely in client state and disappears when the tab closes. If a feature needs a database to work, it's out of scope for this project, not a missing piece to add.

Two things this project cannot ship without:
1. **Cost discipline.** Every completed session lands at 2–3 LLM requests — one planner call, one advisor batch, one moderator call. Cache in memory by normalized question, keep prompts compact, cap each advisor's word budget. Anything that grows the call count without a documented reason in `current-feature.md` is a bug, not a feature.
2. **No exposed reasoning.** The interface only ever shows structured, schema-validated output. Raw model text is never rendered directly to the DOM, and chain-of-thought is never surfaced, logged to the client, or hinted at in the UI.

---

## Context folder

All working context lives in `@context/`. Read the relevant files before starting work — don't rely on memory from earlier sessions.

```
context/
├── current-feature.md              # What's being built right now — status, goals, notes
├── HISTORY.md                       # Detailed per-feature log, appended once each feature merges
├── features/                        # Specs for phases/features not yet started or already completed
├── screenshots/                      # Reference screenshots for UI being built
├── ai-strategy-table-project-overview.md # Full project spec: vision, workflow, UI/UX, data models, phases
└── ai-strategy-table-mockup.html    # Visual/interaction reference prototype — Brass & Neon system
```

- **`current-feature.md`** is the single source of truth for what's in progress. Update it as work happens — Status, Goals, Notes. Once a feature is merged, append the detailed entry to `context/HISTORY.md` and a user-facing summary to the root `CHANGELOG.md` (Keep a Changelog format) — not to `current-feature.md`. Don't start work not described in `current-feature.md` without asking.
- **`features/`** holds specs for other phases (past or upcoming) — check here before assuming a phase hasn't been planned yet.
- **`screenshots/`** holds visual references for whatever UI is being built. If `current-feature.md` references a screenshot, look at it before writing markup.
- **`ai-strategy-table-mockup.html`** is the design source of truth for the whole app, not just one feature — check it for the gauge motif, palette, and type roles regardless of which feature is active.

---

## Before starting any phase

- Read `context/current-feature.md` first — it's the actual current task, status, and notes. `context/ai-strategy-table-project-overview.md` is the full spec; re-read the relevant section, don't work from memory of earlier sessions.
- Check `context/screenshots/` for any screenshot referenced in `current-feature.md`, and `context/ai-strategy-table-mockup.html` for the exact visual target — gauge states, brass/neon palette, type pairing. Match its tokens, don't reinvent them.
- Check `context/features/` for specs on other phases before assuming something hasn't been planned.
- Verify current stable versions of Next.js, the Vercel AI SDK, Zustand/XState, and Zod against their official docs before installing anything. Don't assume versions from training data — this stack moves fast.
- Work one Build Phase at a time (Visual prototype → Preview deployment/CI → Workflow state → AI integration → Portfolio polish → Production readiness). Don't jump ahead to a later phase while the current one is unfinished.

## While building

- **Tokens, not magic numbers.** Colors, type roles, radii, and motion timings come from the tokens file ported from the mockup — never hardcoded hex values or one-off font stacks in components.
- **Structured outputs only.** Every planner/advisor/moderator response is validated against its Zod schema before it touches state. A failed validation is a visible error state, not a silently swallowed fallback.
- **Cost-aware by default.** Cache in memory by normalized question + selected context — no database needed, this can reset on server restart. Any new feature that touches the AI workflow must state its effect on the 2–3 call budget in `current-feature.md`.
- **Four advisors, one moderator.** Don't add a fifth seat or an extra debate round casually — see `ai-strategy-table-project-overview.md` → Things to Avoid.
- **Motion is mechanical, not smooth.** Ticking needles, neon flicker-on, teletype/punch-card reveals, gear-turn or shutter transitions between stages — never soft fades or easing curves borrowed from a generic design system. Always respect `prefers-reduced-motion`; the reduced state should look like a still photograph of the machine, not a flattened UI.
- **No fake activity.** An advisor's gauge only shows "thinking" while a real request is in flight. Never simulate progress that isn't backed by actual workflow state.
- **Stay stateless.** No database, no auth, no user accounts, no server-side session storage. If a task seems to need one, stop and flag it rather than quietly adding infrastructure.

## Before ending a session

- Confirm `next build` runs with no type errors.
- If you touched `lib/ai/schemas.ts` or `lib/ai/prompts.ts`, confirm the planner/advisor/moderator calls still validate against fixture data.
- Confirm the session-cost badge reflects real token/call/cache counts, not a placeholder value.
- Update `context/current-feature.md`: refresh Notes/Status, and if the feature is complete, mark it done and append an entry to `context/HISTORY.md` plus a summary to `CHANGELOG.md`.
- Leave a short note (in your final message, not committed to a file) on what was completed and what the next session should pick up.

---

## Workflow

Same workflow for every feature/fix:

1. **Document** — describe the feature/fix in `context/current-feature.md` before writing code.
2. **Branch** — new branch per feature/fix: `feature/[name]` or `fix/[name]`.
3. **Implement** — build exactly what's documented; nothing extra.
4. **Test** — verify in the browser; run `npm run build` and fix any errors before moving on.
5. **Iterate** — adjust based on feedback.
6. **Commit** — only after the build passes and it's confirmed working. Ask before committing — never auto-commit.
7. **Merge** — merge to main once approved.
8. **Prune & close out** — immediately after a merge, without asking: delete the merged feature branch, refresh Status in `context/current-feature.md` (mark the feature complete), append the detailed entry to `context/HISTORY.md`, and add a user-facing summary to `CHANGELOG.md`. This is automatic — never wait to be told.
9. **Review** — periodically review AI-generated code for input validation on the question field, rate limiting on `/api/strategy`, logic edge cases, and consistency with existing patterns.

## Communication & code-change discipline

- Be concise and direct; explain non-obvious decisions briefly.
- Ask before large refactors or architectural changes.
- Don't add features not described in `current-feature.md` or `ai-strategy-table-project-overview.md`.
- Never delete files without asking first.
- Make minimal changes to accomplish the task — don't refactor unrelated code unless asked.
- Preserve existing patterns in the codebase.
- If something isn't working after 2–3 attempts, stop and explain the issue rather than continuing to try fixes.
- Conventional commit messages (`feat:`, `fix:`, `chore:`); one feature/fix per commit; never include "Generated with Claude" in a commit message.

---

## Hard "don't"s

- Don't add a database, auth, or any server-side persistence. This app is stateless by design.
- Don't add a fifth advisor role or a second debate round without asking — it breaks the cost budget and the layout.
- Don't render raw or unvalidated model output into the UI — always pass it through the Zod schema first.
- Don't let "Try another angle" (single-advisor regeneration) rerun the full workflow.
- Don't introduce a UI pattern that isn't in the mockup or explicitly described in `ai-strategy-table-project-overview.md` without flagging it first.
- Don't use generic AI-app defaults: cream-and-terracotta warmth, near-black-plus-acid-green minimalism, floating glass cards, abstract gradient orbs. This project's identity is brass instruments and neon signal colors, not generic AI chic.
- Don't skip the cost/observability display — token count, latency, and cache-hit indicators are a Phase 3 requirement, not optional polish.
- Don't assume a package version — verify against current docs, especially for the Vercel AI SDK.

---

## Reference files in this repo

| File | Purpose |
| --- | --- |
| `context/current-feature.md` | The active task — status, goals, notes |
| `context/HISTORY.md` | Detailed per-feature log, appended on each merge |
| `CHANGELOG.md` | User-facing change summary (Keep a Changelog format) |
| `context/features/` | Specs for other phases/features, past or upcoming |
| `context/screenshots/` | Reference screenshots for UI being built |
| `context/ai-strategy-table-project-overview.md` | Full spec: vision, workflow, UI/UX, data models, phases |
| `context/ai-strategy-table-mockup.html` | Visual/interaction reference prototype — match its Brass & Neon feel |
| `CLAUDE.md` | This file |
