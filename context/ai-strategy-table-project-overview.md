# AI Strategy Table — Project Overview

> **A cinematic multi-agent decision room where specialized AI perspectives debate a question, challenge assumptions, and produce a clear recommendation.**

---

## Vision

AI Strategy Table should feel less like a chatbot and more like entering a brass-and-glass decision chamber pulled out of an alternate-history intelligence bureau. A visitor submits a dilemma, watches a small group of AI advisors analyze it from different perspectives, and receives a structured conclusion showing consensus, disagreement, risks, and next actions.

The project is primarily a **frontend experience**. The AI workflow exists to create meaningful state changes, streaming content, visual relationships, and moments of interaction.

| Goal | Description |
| --- | --- |
| **Memorable** | The round-table interface should immediately stand apart from generic AI chat apps |
| **Visually rich** | Showcase motion, streaming, layered states, responsive layout, and polished micro-interactions |
| **Architecturally clear** | Demonstrate orchestration, typed outputs, validation, caching, and observability |
| **Cheap to run** | Complete one session with one planner call and one parallel advisor batch where possible |
| **Portfolio-ready** | Explain the product, architecture, tradeoffs, and frontend decisions clearly |

---

## Core Experience

The visitor enters a decision such as:

> Should I lease or buy a car after moving to Madrid?

The app then creates a compact panel of advisors. Suggested roles:

- **Strategist** — long-term implications and tradeoffs
- **Skeptic** — risks, weak assumptions, and failure modes
- **Pragmatist** — cost, effort, and immediate feasibility
- **Human Advocate** — lifestyle, emotions, and personal priorities
- **Moderator** — synthesizes the final decision brief

The workflow should be visible in the interface:

```text
Question
   ↓
Context & Constraint Parser
   ↓
Advisor Perspectives — generated in parallel
   ↓
Agreement / Conflict Mapper
   ↓
Moderator Synthesis
   ↓
Decision Brief
```

The final result is not a wall of prose. It is a visual brief containing:

- recommendation
- confidence level
- strongest supporting arguments
- unresolved questions
- major risks
- suggested next action

---

## UI / UX

### Primary Layout

```text
┌─────────────────────────────────────────────────────────────┐
│ AI Strategy Table                         Session cost $0.01 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│          [Skeptic]                 [Strategist]              │
│                                                             │
│                    YOUR QUESTION                            │
│                                                             │
│       [Human Advocate]             [Pragmatist]              │
│                                                             │
├──────────────────────────────┬──────────────────────────────┤
│ Live discussion timeline     │ Decision brief               │
│ Advisor activity             │ Consensus / risks / actions  │
└──────────────────────────────┴──────────────────────────────┘
```

### Key Interactions

- Advisor pocket-gauges light up and their needles sweep as responses stream in.
- Etched brass lines connect advisors when they agree, hairline cracks of neon when they conflict.
- Selecting an advisor opens a focused panel with their argument and evidence, styled like pulling a file card from a drawer.
- The timeline can replay the order of the workflow, teletype-style.
- The final recommendation card is stamped in after validation completes — a wax-seal-style reveal, not a soft fade.
- A **Try another angle** control reruns only one advisor, not the entire workflow.
- Sessions live entirely in client state for v1 — no accounts, no saved history, nothing to persist. Closing the tab clears the session. Sharing/persistence can be a v2 idea, not a v1 requirement.

### Visual Direction — "Brass & Neon"

This is a deliberate departure from RicardoOS's Future Aero language — a different project should not share a design system. Where RicardoOS is clean chrome and daylight, AI Strategy Table is a dim room lit by instruments: part cyberpunk signage, part Victorian engineering, part worn film stock.

**Palette**
- `#0c0a0d` gunmetal-black — base background
- `#c9a227` / `#f0d27a` brass and brass-light — structure, borders, frames
- `#ff2fb0` hot neon pink — primary accent, active/agreement states
- `#2fd6d6` neon cyan — secondary signal, roles and labels
- `#ffb347` amber — "thinking" / in-progress state
- `#ece0c4` aged parchment — text-heavy surfaces like the decision brief

**Materials & texture**
Riveted brass plating, etched glass, worn leather, faint film grain, low-opacity scanlines, and a soft vignette at the frame edges. Nothing should look flat-vector; every panel should feel like it has weight and age.

**Typography**
A carved display face (Cinzel Decorative or similar) for the wordmark and section headers; a mechanical typewriter/terminal face (Special Elite or a monospace equivalent) for data, timestamps, and advisor status; an italic serif (Cormorant Garamond) for the decision brief's editorial voice. Three roles, three moods — structural, mechanical, editorial.

**Advisor avatars**
Not abstract orbs — each advisor is a brass pocket-gauge with a glass face and a moving needle. Idle advisors sit still; a thinking advisor's needle ticks back and forth; a complete advisor's needle settles and the bezel glows neon.

**Motion**
Mechanical, not smooth. Ticking gauge needles, neon flicker-on rather than fade-in, teletype/punch-card text reveal instead of soft transitions, a brass gear-turn or shutter-click between workflow stages. Reduced-motion mode should feel like a still photograph of the machine — instruments frozen mid-reading — rather than a flattened UI.

**Table surface**
An engraved brass-and-glass table under a single hanging light, not a floating glass slab. Faint concentric etching radiates from the center where the question sits.

---

## AI Workflow and Cost Control

The workflow must be small and deterministic.

### Recommended Call Pattern

1. **Planner call:** classify the decision, extract constraints, and choose four advisor roles.
2. **Advisor call:** request all four perspectives in one structured response, or run them in parallel only when streaming behavior is worth the extra calls.
3. **Moderator call:** synthesize the advisor outputs into the final brief.

Target: **2–3 LLM requests per completed session**.

### Cost Controls

- Use compact prompts and strict JSON schemas.
- Limit each advisor to a fixed word budget.
- Cache by normalized question + selected context.
- Provide several prebuilt demo scenarios that require no live API call.
- Allow one-advisor regeneration rather than rerunning the full workflow.
- Display estimated tokens, latency, and cache hits as part of the UI — styled as an instrument reading, not a plain stat.
- Use a low-cost model for role generation and moderation.

---

## Suggested Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js, App Router |
| UI | React + TypeScript strict mode |
| Styling | Tailwind CSS + CSS custom properties |
| Motion | Framer Motion |
| State | Zustand or XState for workflow state |
| Validation | Zod structured schemas |
| AI | Vercel AI SDK with a low-cost provider/model |
| Persistence | None — client state only, no database, no accounts |
| Deployment | Vercel free tier |
| Testing | Vitest, React Testing Library, Playwright |

The provider must remain swappable behind a small `AIClient` interface.

---

## Core Data Models

```ts
export type WorkflowStatus =
  | "idle"
  | "planning"
  | "advising"
  | "mapping"
  | "moderating"
  | "complete"
  | "error";

export interface Advisor {
  id: string;
  name: string;
  purpose: string;
  status: "waiting" | "thinking" | "complete" | "error";
  argument?: string;
  confidence?: number;
  risks?: string[];
}

export interface DecisionBrief {
  recommendation: string;
  confidence: number;
  agreements: string[];
  disagreements: string[];
  risks: string[];
  unknowns: string[];
  nextAction: string;
}
```

---

## Project Structure

```text
src/
├── app/
│   ├── page.tsx
│   └── api/strategy/route.ts
├── components/
│   ├── table/StrategyTable.tsx
│   ├── advisors/AdvisorSeat.tsx
│   ├── workflow/WorkflowTimeline.tsx
│   ├── brief/DecisionBrief.tsx
│   └── observability/CostBadge.tsx
├── lib/
│   ├── ai/client.ts
│   ├── ai/prompts.ts
│   ├── ai/schemas.ts
│   ├── workflow/orchestrator.ts
│   └── cache.ts               # in-memory cache, resets on server restart — not a DB
└── stores/
    └── strategy-store.ts
```

---

## Build Phases

| Phase | Deliverable |
| --- | --- |
| **1 — Visual prototype** | Static table, gauge-styled advisor seats, timeline, and final brief using fixture data |
| **Deploy checkpoint — Preview CI/CD** | Vercel project, GitHub Actions build checks, and a live preview URL after Phase 1 |
| **2 — Workflow state** | Real state machine, streaming simulation, errors, retries, and replay |
| **3 — AI integration** | Structured planner, advisor, and moderator calls with validation |
| **4 — Portfolio polish** | Responsive behavior, accessibility, performance, case-study content, demo scenarios |
| **Launch checkpoint — Production readiness** | Production Vercel settings, env-var audit, final smoke tests, and showcase URL hookup |

### Deployment Plan

Deployment is part of the build plan, not a final afterthought. After the Phase 1 visual prototype is complete, the project should be deployed to Vercel and wired to GitHub Actions so every later feature gets CI/build feedback and preview deployments. Once AI integration and portfolio polish are complete, run a final production-readiness pass covering Vercel settings, provider environment variables, live/demo smoke tests, cost observability, and the showcase URL.

The deployment plan must keep the v1 constraints intact: Vercel free tier, no database, no auth, no server-side session persistence, and no expansion beyond the 2–3 LLM request target.

---

## Portfolio Story

The project should explicitly demonstrate:

- complex frontend state and transitions
- streaming UI without layout instability
- agent orchestration without exposing hidden chain-of-thought
- structured AI outputs and runtime validation
- selective retries and cost-aware workflow design
- accessible motion and responsive information architecture
- a fully custom visual identity, distinct from other projects in the portfolio, executed with restraint despite its maximalist inspiration

---

## Things to Avoid

- A normal chat window disguised with avatars
- Fake agent activity that does not correspond to real workflow states
- Exposing private model reasoning or chain-of-thought
- More than four advisors in v1
- Long unstructured responses
- Automatic web research in v1
- Expensive multi-round debates
- Neon-for-its-own-sake: every glow or texture should track a real state (thinking, agreement, conflict), not decorate an idle screen
- Overcrowding the brass/glass motif to the point of illegibility — legibility of the decision brief always wins over atmosphere

> **The table is the product. The AI should create interaction, not replace it.**
