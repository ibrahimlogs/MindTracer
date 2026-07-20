import type { AiReasoningError } from "@/lib/ai/reasoning";
import { DeterministicMisconceptionRanker } from "@/lib/misconception-engine/deterministic-ranker";
import { OpenAIMisconceptionRanker } from "@/lib/misconception-engine/openai-ranker";
import type { MisconceptionRanker } from "@/lib/misconception-engine/ranker";
import { getServerEnv } from "@/lib/validation/env";

export type MisconceptionRankerMode = "deterministic" | "openai" | "fallback";
export type VerificationAdapterMode = "deterministic" | "openai" | "fallback";
export type VerificationEvaluatorMode = "deterministic" | "openai" | "fallback";

export function getMisconceptionRankerConfig() {
  const env = getServerEnv();
  return {
    mode: env.MISCONCEPTION_RANKER_MODE,
    adapterMode: env.VERIFICATION_ADAPTER_MODE,
    evaluatorMode: env.VERIFICATION_EVALUATOR_MODE,
    model: env.OPENAI_REASONING_MODEL,
    timeoutMs: env.OPENAI_REASONING_TIMEOUT_MS,
    maxRetries: env.OPENAI_REASONING_MAX_RETRIES,
    storeResponses: env.OPENAI_STORE_RESPONSES,
    hasApiKey: Boolean(env.OPENAI_API_KEY),
  };
}

export function createMisconceptionRanker(): MisconceptionRanker {
  const config = getMisconceptionRankerConfig();
  if (config.mode === "deterministic")
    return new DeterministicMisconceptionRanker();
  if (config.mode === "openai") return new OpenAIMisconceptionRanker(config);

  const openai = new OpenAIMisconceptionRanker(config);
  const deterministic = new DeterministicMisconceptionRanker();
  return {
    async rank(input) {
      try {
        return await openai.rank(input);
      } catch (error) {
        const aiError = error as AiReasoningError;
        if (!aiError.retryable) throw error;
        const fallback = await deterministic.rank(input);
        return {
          ...fallback,
          rankerSource: "fallback",
          fallbackErrorCategory: aiError.category,
        };
      }
    },
  };
}
