# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
The project is pre-release; all work to date sits under **Unreleased**, grouped by date.

## [Unreleased]

### 2026-07-03

#### Added

- Interactive question input: the question plate now renders a validated textarea and a brass "Convene the table" submit control when idle, and locks to the posed question once a session is running (feature 08).
- Strategy store and workflow state machine: a Zustand session store with pure, unit-testable transition helpers enforcing `idle → planning → advising → mapping → moderating → complete` (plus `error`); added an explicit `status` field to the session model (feature 07).
- Continuous integration: GitHub Actions running install, lint, and build on every push, plus a project-specific README runbook and Vercel deployment docs (feature 06).
- Live discussion timeline and decision-brief panels in the lower split region, with tokenized success/seal colors (feature 05).
- Brass & Neon theme foundation: Tailwind design tokens, the three project typefaces, and the base room background with scanlines and vignette (feature 01).
- Core TypeScript strategy models and the canonical Madrid demo session fixture (feature 02).

#### Changed

- Store now initializes to an empty idle session so first load presents the input prompt instead of fixture content; `StrategyTable` reads workflow state from the store (features 07–08).
- Feature roadmap restructured for the stateless Vercel path: early preview CI/CD inserted as feature 06, remaining features renumbered, and production-readiness added as the final phase.

### 2026-07-02

#### Added

- App shell and header: `StrategyTable` layout with the `CostBadge` brass dial rendered at `/` (feature 03).
- Advisor seats and table surface: per-status `AdvisorSeat` pocket-gauges in a 2×2 grid, the initial `QuestionPlate`, and the PWA icon set / web manifest (feature 04).

#### Removed

- Default `src/app/favicon.ico`, in favor of the brand `favicon.ico` served from `public/` — the app-dir convention broke the build on the non-RGBA icon and overrode the public file (feature 04).

### 2026-06-29

#### Added

- Mock data (`src/lib/mock-data.ts`) and dashboard reference screenshots.

### 2026-06-28

#### Added

- Initial Next.js + Tailwind CSS v4 scaffold and project context docs.

#### Removed

- Create Next App default boilerplate (SVGs, AGENTS.md).

[Unreleased]: https://github.com/rikilamadrid/devstash/commits/main
