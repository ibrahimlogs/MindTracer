import { AiReasoningError } from "@/lib/ai/reasoning";
import { getServerEnv } from "@/lib/validation/env";

import { DeterministicReasoningDeltaEvaluator } from "./deterministic-evaluator.ts";
import type { ReasoningDeltaEvaluator } from "./evaluator.ts";
import { OpenAIReasoningDeltaEvaluator } from "./openai-evaluator.ts";

class FallbackReasoningDeltaEvaluator implements ReasoningDeltaEvaluator {
  constructor(
    private readonly openai: ReasoningDeltaEvaluator,
    private readonly deterministic: ReasoningDeltaEvaluator,
  ) {}

  async evaluate(input: Parameters<ReasoningDeltaEvaluator["evaluate"]>[0]) {
    try {
      return await this.openai.evaluate(input);
    } catch (error) {
      if (error instanceof AiReasoningError && error.retryable) {
        return this.deterministic.evaluate(input);
      }
      throw error;
    }
  }
}

export function createReasoningDeltaEvaluator(): ReasoningDeltaEvaluator {
  const mode = getServerEnv().REASONING_DELTA_MODE;
  const deterministic = new DeterministicReasoningDeltaEvaluator();
  if (mode === "deterministic") return deterministic;
  const openai = new OpenAIReasoningDeltaEvaluator();
  if (mode === "openai") return openai;
  return new FallbackReasoningDeltaEvaluator(openai, deterministic);
}
