import { AiReasoningError } from "@/lib/ai/reasoning";
import { getServerEnv } from "@/lib/validation/env";

import { DeterministicTransferEvaluator } from "./deterministic-evaluator.ts";
import type { TransferEvaluator } from "./evaluator.ts";
import { OpenAITransferEvaluator } from "./openai-evaluator.ts";

class FallbackTransferEvaluator implements TransferEvaluator {
  constructor(
    private readonly openai: TransferEvaluator,
    private readonly deterministic: TransferEvaluator,
  ) {}

  async evaluate(input: Parameters<TransferEvaluator["evaluate"]>[0]) {
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

export function createTransferEvaluator(): TransferEvaluator {
  const mode = getServerEnv().TRANSFER_EVALUATOR_MODE;
  const deterministic = new DeterministicTransferEvaluator();
  if (mode === "deterministic") return deterministic;
  const openai = new OpenAITransferEvaluator();
  if (mode === "openai") return openai;
  return new FallbackTransferEvaluator(openai, deterministic);
}
