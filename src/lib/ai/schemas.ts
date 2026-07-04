import { z } from "zod";

import type { Advisor, DecisionBrief } from "@/types/strategy";

/**
 * Zod schemas for the three structured LLM outputs in the strategy workflow:
 * planner, advisor, and moderator. Every planner/advisor/moderator response is
 * validated against one of these before it ever touches store state or the DOM
 * — raw model text is never rendered directly (see CLAUDE.md → "No exposed
 * reasoning" and "Structured outputs only").
 *
 * The inferred types are the source of truth used by the AI layer; the
 * compile-time checks at the bottom of this file assert they stay in agreement
 * with the hand-written types in `@/types/strategy` (feature 02) so the two
 * can't silently drift.
 */

/** A confidence score in the range [0, 1], matching the UI gauge scale. */
const confidence = z.number().min(0).max(1);

/**
 * Planner output — the single planner call classifies the decision, extracts
 * the constraints it inferred from the question, and chooses exactly four
 * advisor roles for the table. Producing a fifth (or fewer than four) seats is
 * out of scope by design (CLAUDE.md → "Four advisors, one moderator").
 */
export const plannerAdvisorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  purpose: z.string().min(1),
});

export const plannerSchema = z.object({
  classification: z.string().min(1),
  constraints: z.array(z.string().min(1)),
  advisors: z.array(plannerAdvisorSchema).length(4),
});

/**
 * Advisor output — one advisor's structured perspective: a single argument, a
 * confidence score, and the risks they flag. Requested for all four advisors in
 * one batch; this schema validates each individual advisor's slice of that
 * response.
 */
export const advisorSchema = z.object({
  argument: z.string().min(1),
  confidence,
  risks: z.array(z.string().min(1)),
});

/**
 * Moderator output — the final decision brief synthesized from the advisor
 * outputs. This is the `DecisionBrief` the UI stamps in after validation.
 */
export const decisionBriefSchema = z.object({
  recommendation: z.string().min(1),
  confidence,
  agreements: z.array(z.string().min(1)),
  disagreements: z.array(z.string().min(1)),
  risks: z.array(z.string().min(1)),
  unknowns: z.array(z.string().min(1)),
  nextAction: z.string().min(1),
});

export type PlannerAdvisor = z.infer<typeof plannerAdvisorSchema>;
export type PlannerOutput = z.infer<typeof plannerSchema>;
export type AdvisorOutput = z.infer<typeof advisorSchema>;
export type DecisionBriefOutput = z.infer<typeof decisionBriefSchema>;

/**
 * Compile-time drift guards. This type never runs and produces no output — it
 * exists so `next build` (tsc) fails if a schema and its feature-02 counterpart
 * diverge. Each element asserts assignability in one direction; a mismatch
 * surfaces as a type error on the offending line. If one starts erroring, the
 * schema and the type in `@/types/strategy` disagree — reconcile them rather
 * than loosening the guard.
 */
type AssertAssignable<Actual extends Expected, Expected> = Actual;
type AdvisorRole = Pick<Advisor, "id" | "name" | "purpose">;
type AdvisorAIFields = Required<Pick<Advisor, "argument" | "confidence" | "risks">>;

export type SchemaDriftGuards = [
  // The planner's chosen roles must be exactly the descriptive slice of `Advisor`.
  AssertAssignable<PlannerAdvisor, AdvisorRole>,
  AssertAssignable<AdvisorRole, PlannerAdvisor>,
  // An advisor's produced fields must be exactly the optional AI slice of `Advisor`.
  AssertAssignable<AdvisorOutput, AdvisorAIFields>,
  AssertAssignable<AdvisorAIFields, AdvisorOutput>,
  // The moderator output must equal `DecisionBrief` in both directions.
  AssertAssignable<DecisionBriefOutput, DecisionBrief>,
  AssertAssignable<DecisionBrief, DecisionBriefOutput>,
];
