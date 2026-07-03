# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
While in initial development (`0.y.z`), new backward-compatible features bump the
MINOR version and fixes bump the PATCH version.

## [Unreleased]

### Added

- Streaming simulation: posing a question now drives a timed, fixture-backed progression through the workflow (planning → advisors deliberating in parallel → mapping → moderating → complete). Purely client-side on a timer — no network calls, no cost-budget impact (feature 09).
- Mechanical motion (Framer Motion): advisor gauge needles tick while thinking and settle with a neon bezel flicker when an argument lands; timeline rows reveal punch-card + teletype style; the decision brief stamps in wax-seal style at completion. All motion is gated on `prefers-reduced-motion` (feature 09).

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

[Unreleased]: https://github.com/rikilamadrid/devstash/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/rikilamadrid/devstash/releases/tag/v0.2.0
