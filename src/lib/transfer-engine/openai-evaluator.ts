import { getOpenAIClient } from "@/lib/ai/client";
import { AiReasoningError } from "@/lib/ai/reasoning";

import type { TransferEvaluator } from "./evaluator.ts";
import type { TransferEvaluationOutput } from "./schemas.ts";

export class OpenAITransferEvaluator implements TransferEvaluator {
  async evaluate(): Promise<TransferEvaluationOutput> {
    try {
      getOpenAIClient();
    } catch {
      throw new AiReasoningError(
        "AI_NOT_CONFIGURED",
        "OpenAI transfer evaluation is not configured.",
        false,
      );
    }
    throw new AiReasoningError(
      "AI_INTERNAL_ERROR",
      "Live transfer evaluation requires reviewed credentials before use.",
      false,
    );
  }
}
