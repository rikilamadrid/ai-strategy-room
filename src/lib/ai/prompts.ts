/**
 * Compact prompt scaffolding for the three-call workflow: planner → advisor
 * batch → moderator. These are deliberately terse — prompt length is part of
 * the cost budget (CLAUDE.md → "keep prompts compact, cap each advisor's word
 * budget"). Live tuning for output quality happens during features 13–15; this
 * file just establishes the shape and the word caps.
 *
 * Every prompt demands structured output only. The schemas in `./schemas` are
 * what actually enforces that; these system prompts reinforce it and keep the
 * model from leaking chain-of-thought into user-visible fields.
 */

/** Per-advisor word ceiling for the `argument` field, enforced in the prompt. */
export const ADVISOR_WORD_BUDGET = 60;

/**
 * Planner system prompt. Classifies the decision, extracts constraints, and
 * selects exactly four advisor roles. Output is validated against
 * `plannerSchema`.
 */
export const plannerSystemPrompt = [
  "You are the planner for a strategy table. Given a decision question, you:",
  "1. Classify the decision in a few words (e.g. 'financial tradeoff', 'career move').",
  "2. Extract the concrete constraints implied by the question, one per item.",
  "3. Choose EXACTLY four complementary advisor roles to debate it. Each role has",
  "   a short id (kebab-case), a display name, and a one-line purpose.",
  "Return only the structured fields. Do not answer the question yourself.",
].join("\n");

export function plannerUserPrompt(question: string): string {
  return `Decision question:\n${question}`;
}

/**
 * Advisor system prompt. One structured perspective — a single argument, a
 * confidence score in [0,1], and the risks flagged. Output is validated against
 * `advisorSchema`.
 */
export const advisorSystemPrompt = [
  "You are one advisor at a strategy table, speaking strictly from your assigned role.",
  `Give ONE argument in at most ${ADVISOR_WORD_BUDGET} words, a confidence score`,
  "between 0 and 1, and the key risks you see. Stay in character for your role.",
  "Return only the structured fields — no preamble, no reasoning trace.",
].join("\n");

export function advisorUserPrompt(params: {
  question: string;
  role: { name: string; purpose: string };
  constraints: string[];
}): string {
  const { question, role, constraints } = params;
  const constraintLines = constraints.length
    ? constraints.map((c) => `- ${c}`).join("\n")
    : "- (none stated)";
  return [
    `Your role: ${role.name} — ${role.purpose}`,
    `Decision question:\n${question}`,
    `Constraints:\n${constraintLines}`,
  ].join("\n\n");
}

/**
 * Advisor batch system prompt. Produces all four advisors' perspectives in one
 * structured call (the cost-target path — call #2 of the 2–3/session budget).
 * Each advisor stays strictly in its assigned role, echoes its seat id, and
 * respects the word budget. Output is validated against `advisorBatchSchema`.
 */
export const advisorBatchSystemPrompt = [
  "You are the advisory panel at a strategy table: four distinct advisors, each",
  "with an assigned role. Produce EXACTLY one perspective per advisor — no more,",
  "no fewer — and keep each advisor strictly in its own role, with a distinct take.",
  `For each advisor return: its exact seat id, ONE argument in at most ${ADVISOR_WORD_BUDGET}`,
  "words, a confidence score between 0 and 1, and the key risks it sees.",
  "Return only the structured fields — no preamble, no reasoning trace.",
].join("\n");

export function advisorBatchUserPrompt(params: {
  question: string;
  roles: { id: string; name: string; purpose: string }[];
  constraints: string[];
}): string {
  const { question, roles, constraints } = params;
  const roleLines = roles
    .map((role) => `- id "${role.id}": ${role.name} — ${role.purpose}`)
    .join("\n");
  const constraintLines = constraints.length
    ? constraints.map((c) => `- ${c}`).join("\n")
    : "- (none stated)";
  return [
    `Decision question:\n${question}`,
    `Advisors (answer as each, echoing its exact id):\n${roleLines}`,
    `Constraints:\n${constraintLines}`,
  ].join("\n\n");
}

/**
 * Moderator system prompt. Synthesizes the advisor outputs into the final
 * decision brief. Output is validated against `decisionBriefSchema`.
 */
export const moderatorSystemPrompt = [
  "You are the moderator. Synthesize the advisors' perspectives into a decision brief:",
  "a single recommendation, an overall confidence score between 0 and 1, the points of",
  "agreement and disagreement, the material risks, the open unknowns, and one concrete",
  "next action. Be decisive and concise. Return only the structured fields.",
].join("\n");

export function moderatorUserPrompt(params: {
  question: string;
  advisors: { name: string; argument: string; confidence: number; risks: string[] }[];
}): string {
  const { question, advisors } = params;
  const advisorBlocks = advisors
    .map((a) => {
      const risks = a.risks.length ? a.risks.map((r) => `  - ${r}`).join("\n") : "  - (none)";
      return [
        `${a.name} (confidence ${a.confidence}):`,
        `  ${a.argument}`,
        `  Risks:`,
        risks,
      ].join("\n");
    })
    .join("\n\n");
  return [`Decision question:\n${question}`, `Advisor perspectives:\n${advisorBlocks}`].join(
    "\n\n",
  );
}
