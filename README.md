# AI Strategy Table

A cinematic multi-agent decision room built with Next.js App Router, TypeScript, and Tailwind CSS. The current build is the Phase 1 static prototype: Brass & Neon theme, advisor gauges, question plate, live timeline, and decision brief rendered from fixture data.

## Local Development

```bash
npm ci
npm run dev
```

Open [http://localhost:3004](http://localhost:3004).

Useful checks:

```bash
npm run lint
npm run build
```

## Environment Variables

The AI layer talks to a low-cost Anthropic model (`claude-haiku-4-5`) through the
Vercel AI SDK, kept swappable behind the `AIClient` interface in
`src/lib/ai/client.ts`. Copy the keys below into `.env.local` for local
development (the file is gitignored — never commit secrets):

| Variable | Required | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Yes (once AI calls run) | Anthropic API key for the provider. |
| `AI_MODEL` | No | Overrides the default model id (`claude-haiku-4-5`). |

No API route consumes these yet — the client/schemas/prompts scaffolding lands
in feature 12; the calls that use them arrive in features 13–15. The Vercel AI
SDK requires Node 22+ (matching the CI/production runtime); local dev on Node 20
works for build and lint but logs an engine warning.

## Deployment

Deployment uses Vercel's GitHub integration, with GitHub Actions providing the independent CI signal.

| Environment | Source | URL |
| --- | --- | --- |
| Production | `main` branch on Vercel | Pending Vercel project setup |
| Preview | Pull requests / feature branch pushes on Vercel | Pending Vercel project setup |

### Vercel Setup

1. Import this GitHub repository into Vercel as a Next.js project.
2. Use the Vercel free tier and keep the framework preset as Next.js.
3. Set the production branch to `main`.
4. Set the Node.js runtime to Node 22 to match CI.
5. Set `ANTHROPIC_API_KEY` (and optionally `AI_MODEL`) in the Vercel project — see [Environment Variables](#environment-variables). Production-hardening of these lands in feature 22.
6. After Vercel creates the project, update the URL table above with the production URL and a representative preview URL.

### GitHub Actions CI

`.github/workflows/ci.yml` runs on pull requests plus pushes to `main`, `feature/**`, and `fix/**`.

The workflow:

- checks out the repo with `actions/checkout@v7`
- sets up Node 22 with `actions/setup-node@v6`
- installs dependencies with `npm ci`
- runs `npm run lint`
- runs `npm run build`

### Expected Flow

1. Start each feature from `main` on a `feature/*` or `fix/*` branch.
2. Push the branch and confirm GitHub Actions passes.
3. Use Vercel's preview deployment for browser review.
4. Merge to `main` only after CI/build and visual review pass.
5. Vercel automatically publishes the updated production deployment from `main`.

## Constraints

- No database, auth, accounts, or server-side session persistence.
- AI provider config is a single env var (`ANTHROPIC_API_KEY`), read only through the swappable `AIClient` seam — no provider imports in components or the store.
- Completed AI sessions must remain within the 2-3 LLM request budget once real AI calls are introduced.
- Raw model output must never be rendered directly; structured validated output only.
