# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
While in initial development (`0.y.z`), new backward-compatible features bump the
MINOR version and fixes bump the PATCH version.

## [Unreleased]

### Added

- Caching & cost observability — closes **Phase 3 — AI integration**. An in-memory cache (`src/lib/cache.ts`, keyed by normalized question) lets a repeat question return the same plan, advisor perspectives, and decision brief with zero new model calls. The session-cost instrument now shows real token counts, cumulative latency, and a cache-hit/live indicator instead of a placeholder value. "Try another angle" (feature 10) is wired to a real single-advisor call — it never reruns the planner or moderator, and it's never cached, so every retry is a genuinely fresh take (feature 16).
- Live moderator synthesis — the third and final real LLM request (call #3, completing the 2–3-request/session budget). Once all four advisors have weighed in, the moderator synthesizes their perspectives into a single decision brief: a recommendation, an overall confidence score, the points of agreement and disagreement, the material risks, the open unknowns, and one concrete next action. The brief is validated against its schema before it reaches the UI, then stamps in with the existing wax-seal reveal — completing the real end-to-end planner → advisors → moderator workflow (feature 15).
- Live advisor perspectives — the second real LLM request (call #2 of the 2–3-request/session budget). Once the planner has chosen the four roles, a single structured advisor call returns all four perspectives at once — each with its argument, a confidence score, and the risks it sees — so the seats fill with real deliberation instead of the fixture-backed simulation. Because it's one batched request, the four advisors are genuinely in flight together: every gauge flips to "thinking" when the call fires and settles when it lands (no faked one-at-a-time reveal). Each advisor is held to a fixed word budget so responses stay compact, and only the finished argument/risks are ever surfaced — never any private reasoning. The route re-validates the plan the client hands back (this app keeps no server-side session) and validates every perspective against the advisor schema before it reaches the UI; a failure surfaces as a visible in-timeline error, never malformed data. Mapping and moderator synthesis remain the client-side simulation for now (feature 15) (feature 14).
- Live planner call — the app's first real LLM request. Posing a question now calls the planner (call #1 of the 2–3-request/session budget): it classifies the decision, extracts the constraints, and chooses the four question-specific advisor roles that take the seats, replacing the demo roster. A new `POST /api/strategy` route validates the question, treats a missing API key as "not configured", and validates the model output against the planner schema before it reaches the UI — a failure surfaces as a visible in-timeline error state, never malformed data. Everything from the advisor debate onward remains the client-side simulation for now (features 14–15) (feature 13).
- AI client interface and structured-output schemas — the foundation of Phase 3. A small, provider-swappable `AIClient` seam (`src/lib/ai/client.ts`) wraps the Vercel AI SDK with a low-cost Anthropic model (`claude-haiku-4-5`, overridable via `AI_MODEL`), so no provider specifics leak into components or the store. Zod schemas (`src/lib/ai/schemas.ts`) validate the three structured outputs — planner (classification + constraints + exactly four advisor roles), advisor (argument + confidence + risks), and moderator (decision brief) — with compile-time guards keeping them in lock-step with the app's TypeScript types. Compact planner/advisor/moderator prompt scaffolding (`src/lib/ai/prompts.ts`) rounds it out. No API route or LLM calls yet — those arrive in the following features, so the 2–3 call budget is untouched (feature 12).

## [0.3.0] - 2026-07-03

### Added

- Streaming simulation: posing a question now drives a timed, fixture-backed progression through the workflow (planning → advisors deliberating in parallel → mapping → moderating → complete). Purely client-side on a timer — no network calls, no cost-budget impact (feature 09).
- Mechanical motion (Framer Motion): advisor gauge needles tick while thinking and settle with a neon bezel flicker when an argument lands; timeline rows reveal punch-card + teletype style; the decision brief stamps in wax-seal style at completion. All motion is gated on `prefers-reduced-motion` (feature 09).
- Advisor error state and single-advisor retry: an advisor can now fault mid-session — a dim, cracked seal-red gauge and a matching seal-red notice in the live-discussion timeline — while the rest of the table finishes unaffected. A brass "Try another angle" control re-runs just that one advisor (needle ticks, then settles on a fresh take) without rerunning the whole workflow. A fixture switch simulates the failure for testing; no cost-budget impact (feature 10).
- Timeline replay: once a session completes, a brass replay control re-reveals the recorded workflow beats teletype-style from the top, then restores the settled final timeline and re-stamps the decision brief. The event sequence is recorded in the store as a replayable log, so replay runs entirely client-side with zero network calls, no LLM reruns, and no cache changes; "Try another angle" is disabled while replay runs. Closes out Phase 2 — Workflow state (feature 11).

## [0.2.0] - 2026-07-03

First milestone release: the cinematic Brass & Neon decision room as a static,
stateless prototype driven by an in-memory workflow store — through the point of
posing a question and convening the table. (No AI integration yet.)

### Added

- Interactive question input: idle renders a validated textarea and a brass "Convene the table" submit; the plate locks to the posed question once a session is running (feature 08).
- Strategy store and workflow state machine (Zustand) enforcing `idle → planning → advising → mapping → moderating → complete` (plus `error`), with pure, unit-testable transition helpers and an explicit `status` on the session model (feature 07).
- Continuous integration: GitHub Actions running install, lint, and build on every push, plus a project README runbook and Vercel deployment docs (feature 06).
- Live discussion timeline and decision-brief panels in the lower split, with tokenized success/seal colors (feature 05).
- Advisor seats and the 2×2 table surface with per-status brass pocket-gauges, plus the PWA icon set and web manifest (feature 04).
- App shell and header with the CostBadge brass dial rendered at `/` (feature 03).
- Core TypeScript strategy models and the canonical Madrid demo session fixture (feature 02).
- Brass & Neon theme foundation: Tailwind design tokens, the three project typefaces, and the room background with scanlines and vignette (feature 01).

### Changed

- Store initializes to an empty idle session so first load presents the input prompt instead of fixture content; `StrategyTable` reads workflow state from the store (features 07–08).
- Feature roadmap restructured for the stateless Vercel path: early preview CI/CD inserted as feature 06, remaining features renumbered, and production-readiness added as the final phase.

### Removed

- Default `src/app/favicon.ico`, in favor of the brand `favicon.ico` served from `public/` — the app-dir convention broke the build on the non-RGBA icon and overrode the public file (feature 04).
- Create Next App default boilerplate: SVGs and AGENTS.md (initial scaffold).

[Unreleased]: https://github.com/rikilamadrid/devstash/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/rikilamadrid/devstash/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/rikilamadrid/devstash/releases/tag/v0.2.0
