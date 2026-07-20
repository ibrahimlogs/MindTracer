import { zodTextFormat } from "openai/helpers/zod";

import { getOpenAIClient } from "@/lib/ai/client";
import { AiReasoningError, mapOpenAIError } from "@/lib/ai/reasoning";
import type { MisconceptionRanker } from "@/lib/misconception-engine/ranker";
import {
  buildRankerPrompt,
  misconceptionRankerSystemPrompt,
} from "@/lib/misconception-engine/prompt";
import {
  hypothesisRankingOutputSchema,
  type HypothesisRankingInput,
  type HypothesisRankingOutput,
} from "@/lib/misconception-engine/schemas";
import { validateRankingOutput } from "@/lib/misconception-engine/safety";

export interface OpenAIRankerConfig {
  model: string;
  timeoutMs: number;
  maxRetries: number;
  storeResponses: boolean;
  hasApiKey: boolean;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractParsed(
  response: Awaited<
    ReturnType<ReturnType<typeof getOpenAIClient>["responses"]["parse"]>
  >,
) {
  for (const output of response.output) {
    if (output.type !== "message") continue;
    for (const item of output.content) {
      if (item.type === "refusal") {
        throw new AiReasoningError(
          "AI_REFUSAL",
          "OpenAI refused the ranking request.",
          false,
        );
      }
      if ("parsed" in item && item.parsed) return item.parsed;
    }
  }
  throw new AiReasoningError(
    "AI_EMPTY_RESPONSE",
    "OpenAI returned no parsed ranking output.",
    true,
  );
}

export class OpenAIMisconceptionRanker implements MisconceptionRanker {
  constructor(private readonly config: OpenAIRankerConfig) {}

  async rank(input: HypothesisRankingInput): Promise<HypothesisRankingOutput> {
    if (!this.config.hasApiKey) {
      throw new AiReasoningError(
        "AI_NOT_CONFIGURED",
        "OpenAI misconception ranking requires OPENAI_API_KEY.",
        false,
      );
    }

    let retryCount = 0;
    let lastError: AiReasoningError | null = null;

    while (retryCount <= this.config.maxRetries) {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        this.config.timeoutMs,
      );

      try {
        const response = await getOpenAIClient().responses.parse(
          {
            model: this.config.model,
            store: this.config.storeResponses,
            input: [
              { role: "system", content: misconceptionRankerSystemPrompt },
              { role: "user", content: buildRankerPrompt(input) },
            ],
            text: {
              format: zodTextFormat(
                hypothesisRankingOutputSchema,
                "misconception_ranking",
              ),
            },
          },
          { signal: controller.signal },
        );
        clearTimeout(timeout);
        if (response.status !== "completed") {
          throw new AiReasoningError(
            "AI_INCOMPLETE_RESPONSE",
            "OpenAI ranking response did not complete.",
            true,
          );
        }
        return validateRankingOutput(
          hypothesisRankingOutputSchema.parse(extractParsed(response)),
          input.allowedCandidateIds,
          "openai",
        );
      } catch (error) {
        clearTimeout(timeout);
        lastError = mapOpenAIError(error);
        if (!lastError.retryable || retryCount >= this.config.maxRetries) {
          throw lastError;
        }
        retryCount += 1;
        await wait(150 * retryCount);
      }
    }

    throw (
      lastError ??
      new AiReasoningError("AI_INTERNAL_ERROR", "OpenAI ranking failed.", false)
    );
  }
}
