import { zodTextFormat } from "openai/helpers/zod";

import type {
  ReasoningAnalyzer,
  ReasoningAnalyzerOutput,
} from "@/lib/ai/reasoning/analyzer";
import type { ReasoningAnalyzerConfig } from "@/lib/ai/reasoning/config";
import { AiReasoningError, mapOpenAIError } from "@/lib/ai/reasoning/errors";
import {
  buildReasoningPrompt,
  reasoningSystemPrompt,
} from "@/lib/ai/reasoning/prompt";
import {
  reasoningAnalysisResultSchema,
  type ReasoningAnalysisInput,
} from "@/lib/ai/reasoning/schema";
import { validateReasoningSafety } from "@/lib/ai/reasoning/safety";
import { getOpenAIClient } from "@/lib/ai/client";

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
          "OpenAI refused the extraction request.",
          false,
        );
      }
      if ("parsed" in item && item.parsed) return item.parsed;
    }
  }
  throw new AiReasoningError(
    "AI_EMPTY_RESPONSE",
    "OpenAI returned no parsed reasoning output.",
    true,
  );
}

export class OpenAIReasoningAnalyzer implements ReasoningAnalyzer {
  constructor(private readonly config: ReasoningAnalyzerConfig) {}

  async analyze(
    input: ReasoningAnalysisInput,
  ): Promise<ReasoningAnalyzerOutput> {
    if (!this.config.hasApiKey) {
      throw new AiReasoningError(
        "AI_NOT_CONFIGURED",
        "OpenAI reasoning mode requires OPENAI_API_KEY.",
        false,
      );
    }

    let retryCount = 0;
    const startedAt = performance.now();
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
              { role: "system", content: reasoningSystemPrompt },
              { role: "user", content: buildReasoningPrompt(input) },
            ],
            text: {
              format: zodTextFormat(
                reasoningAnalysisResultSchema,
                "reasoning_analysis",
              ),
            },
          },
          { signal: controller.signal },
        );
        clearTimeout(timeout);

        if (response.status !== "completed") {
          throw new AiReasoningError(
            "AI_INCOMPLETE_RESPONSE",
            "OpenAI response did not complete.",
            true,
          );
        }

        const parsed = reasoningAnalysisResultSchema.parse(
          extractParsed(response),
        );
        const safe = validateReasoningSafety(parsed);

        return {
          source: "openai",
          result: safe,
          metadata: {
            provider: "openai",
            model: response.model ?? this.config.model,
            responseId: response.id ?? null,
            latencyMs: Math.round(performance.now() - startedAt),
            retryCount,
            analyzerMode: "openai",
            storageRequested: this.config.storeResponses,
            finishStatus: response.status,
          },
        };
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
      new AiReasoningError(
        "AI_INTERNAL_ERROR",
        "OpenAI analysis failed.",
        false,
      )
    );
  }
}
