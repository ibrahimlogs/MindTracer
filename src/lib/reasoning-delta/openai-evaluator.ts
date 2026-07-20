import { getOpenAIClient } from "@/lib/ai/client";
import { AiReasoningError } from "@/lib/ai/reasoning";

import type { ReasoningDeltaEvaluator } from "./evaluator.ts";
import type { ReasoningDeltaOutput } from "./schemas.ts";

export class OpenAIReasoningDeltaEvaluator implements ReasoningDeltaEvaluator {
  async evaluate(): Promise<ReasoningDeltaOutput> {
    try {
      getOpenAIClient();
    } catch {
      throw new AiReasoningError(
        "AI_NOT_CONFIGURED",
        "OpenAI Reasoning Delta evaluation is not configured.",
        false,
      );
    }
    throw new AiReasoningError(
      "AI_INTERNAL_ERROR",
      "Live Reasoning Delta evaluation requires reviewed credentials before use.",
      false,
    );
  }
}
