import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import type { z } from "zod";

/**
 * The one seam the rest of the app talks to for structured AI generation.
 *
 * The provider and model live entirely behind this interface — no `ai` or
 * `@ai-sdk/*` import should ever appear in a component, the store, or a route
 * handler. Swapping providers (or dropping in a fake for tests/demos) means
 * writing a new `AIClient`, not touching call sites. See the project overview
 * → "Suggested Tech Stack": the provider must remain swappable behind a small
 * `AIClient` interface.
 */
export interface AIClient {
  /** The model id this client generates against (for the cost/observability badge). */
  readonly model: string;
  /** Generate one schema-validated object. Rejects if the model output fails validation. */
  generateStructured<T>(request: StructuredRequest<T>): Promise<StructuredResult<T>>;
}

export interface StructuredRequest<T> {
  /** Zod schema the model output is constrained to and validated against. */
  schema: z.ZodType<T>;
  /** A short schema name — helps the provider produce well-formed output. */
  schemaName: string;
  /** System prompt: the advisor/planner/moderator persona and rules. */
  system: string;
  /** User prompt: the normalized question plus any selected context. */
  prompt: string;
  /** Word/token ceiling — every call is capped to keep the cost budget tight. */
  maxOutputTokens?: number;
}

export interface StructuredResult<T> {
  /** The validated object. Never raw model text. */
  object: T;
  /** Token accounting for the cost badge; fields are undefined if the provider omits them. */
  usage: TokenUsage;
}

export interface TokenUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

/** Low-cost default model. Overridable per deploy via `AI_MODEL`. */
export const DEFAULT_MODEL = "claude-haiku-4-5";

export interface AnthropicClientOptions {
  /** Falls back to `ANTHROPIC_API_KEY` in the environment when omitted. */
  apiKey?: string;
  /** Falls back to `AI_MODEL`, then `DEFAULT_MODEL`. */
  model?: string;
}

/**
 * The default `AIClient`, backed by Anthropic through the Vercel AI SDK. This
 * is the only place provider specifics live.
 */
export function createAnthropicClient(options: AnthropicClientOptions = {}): AIClient {
  const model = options.model ?? process.env.AI_MODEL ?? DEFAULT_MODEL;
  const provider = createAnthropic({
    apiKey: options.apiKey ?? process.env.ANTHROPIC_API_KEY,
  });
  const languageModel = provider(model);

  return {
    model,
    async generateStructured<T>(
      request: StructuredRequest<T>,
    ): Promise<StructuredResult<T>> {
      const { object, usage } = await generateObject({
        model: languageModel,
        schema: request.schema,
        schemaName: request.schemaName,
        system: request.system,
        prompt: request.prompt,
        maxOutputTokens: request.maxOutputTokens,
      });

      return {
        object,
        usage: {
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
        },
      };
    },
  };
}
