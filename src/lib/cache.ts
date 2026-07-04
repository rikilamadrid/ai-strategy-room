import type { AdvisorPerspective, DecisionBriefOutput, PlannerOutput } from "./ai/schemas";

/**
 * In-memory cache for the strategy workflow, keyed by normalized question (plus
 * selected context, once that exists). A module-level `Map` — it resets on
 * server restart and isn't shared across instances, by design (CLAUDE.md →
 * "in-memory cache, resets on server restart — not a DB").
 *
 * Each of the three call stages caches independently under the same key so a
 * repeated question can short-circuit any subset of the workflow that's already
 * been computed, without ever touching the model. A stage that hasn't run yet
 * for that question still calls live and populates its own slot.
 */
interface CacheEntry {
  plan?: PlannerOutput;
  advisors?: AdvisorPerspective[];
  brief?: DecisionBriefOutput;
  model?: string;
}

const cache = new Map<string, CacheEntry>();

export function normalizeQuestion(question: string): string {
  return question.trim().toLowerCase().replace(/\s+/g, " ");
}

function readEntry(question: string): CacheEntry | undefined {
  return cache.get(normalizeQuestion(question));
}

function writeEntry(question: string, patch: Partial<CacheEntry>): void {
  const key = normalizeQuestion(question);
  cache.set(key, { ...cache.get(key), ...patch });
}

export function getCachedPlan(
  question: string,
): { plan: PlannerOutput; model: string } | undefined {
  const entry = readEntry(question);
  return entry?.plan && entry.model ? { plan: entry.plan, model: entry.model } : undefined;
}

export function setCachedPlan(question: string, plan: PlannerOutput, model: string): void {
  writeEntry(question, { plan, model });
}

export function getCachedAdvisors(
  question: string,
): { advisors: AdvisorPerspective[]; model: string } | undefined {
  const entry = readEntry(question);
  return entry?.advisors && entry.model
    ? { advisors: entry.advisors, model: entry.model }
    : undefined;
}

export function setCachedAdvisors(
  question: string,
  advisors: AdvisorPerspective[],
  model: string,
): void {
  writeEntry(question, { advisors, model });
}

export function getCachedBrief(
  question: string,
): { brief: DecisionBriefOutput; model: string } | undefined {
  const entry = readEntry(question);
  return entry?.brief && entry.model ? { brief: entry.brief, model: entry.model } : undefined;
}

export function setCachedBrief(question: string, brief: DecisionBriefOutput, model: string): void {
  writeEntry(question, { brief, model });
}
