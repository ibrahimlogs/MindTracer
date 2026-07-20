import type { ReasoningAnalyzer } from "@/lib/ai/reasoning/analyzer";
import { getReasoningAnalyzerConfig } from "@/lib/ai/reasoning/config";
import { AiReasoningError } from "@/lib/ai/reasoning/errors";
import { DeterministicReasoningAnalyzer } from "@/lib/ai/reasoning/deterministic-analyzer";
import { OpenAIReasoningAnalyzer } from "@/lib/ai/reasoning/openai-analyzer";

class FallbackReasoningAnalyzer implements ReasoningAnalyzer {
  constructor(
    private readonly openai: OpenAIReasoningAnalyzer,
    private readonly deterministic: DeterministicReasoningAnalyzer,
  ) {}

  async analyze(input: Parameters<ReasoningAnalyzer["analyze"]>[0]) {
    try {
      return await this.openai.analyze(input);
    } catch (error) {
      if (error instanceof AiReasoningError && error.retryable) {
        const fallback = await this.deterministic.analyze(input);
        return {
          ...fallback,
          source: "fallback" as const,
          metadata: {
            ...fallback.metadata,
            analyzerMode: "fallback" as const,
            errorCategory: error.category,
          },
        };
      }
      throw error;
    }
  }
}

export function createReasoningAnalyzer(): ReasoningAnalyzer {
  const config = getReasoningAnalyzerConfig();
  const deterministic = new DeterministicReasoningAnalyzer();

  if (config.mode === "deterministic") return deterministic;

  const openai = new OpenAIReasoningAnalyzer(config);
  if (config.mode === "openai") return openai;

  return new FallbackReasoningAnalyzer(openai, deterministic);
}
