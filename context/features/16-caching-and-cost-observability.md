# Caching & Cost Observability

## Status

Not Started

## Goals

- Add an in-memory cache in `src/lib/cache.ts` keyed by normalized question + selected context; a repeat question returns cached results without new model calls (cache resets on server restart — not a DB).
- Make the `CostBadge` (and any instrument readouts) show **real** values: estimated tokens, latency, and cache hit/miss for the session, styled as instrument readings rather than plain stats.
- Wire real single-advisor regeneration ("Try another angle", feature 10) to call only the advisor step for one role and update its cost contribution, not rerun planner/moderator.
- Confirm a full fresh session stays within the 2–3 live-request target, and a cached repeat makes zero live calls.
- Verify in browser: run a question (see token/latency/cost update), rerun the same question (see a cache hit, no new cost), regenerate one advisor (see one incremental call).

## Notes

- Cache-by-normalized-question, in-memory cache file, and instrument-style readouts: overview "Cost Controls" and project structure (`lib/cache.ts` — "in-memory cache, resets on server restart — not a DB").
- Request-count target: overview "AI Workflow and Cost Control" (2–3 requests per completed session).
- **Depends on:** features 13–15 (real calls to cache/measure) and 10 (single-advisor retry to make cost-aware). Completes **Phase 3 — AI integration**.

## Out of Scope

- Persistent/shared caching across server restarts or across users (v1 is in-memory only).
- Prebuilt no-API demo scenarios (feature 17) — related but separate.
- Billing/quotas/auth (no accounts in v1).
