import type {
  ReasoningAnalysisInput,
  ReasoningAnalysisResult,
} from "@/lib/ai/reasoning/schema";

export type ReasoningAnalysisSource = "openai" | "deterministic" | "fallback";

export interface ReasoningAnalyzerMetadata {
  provider: "openai" | "mindtrace";
  model: string;
  responseId: string | null;
  latencyMs: number;
  retryCount: number;
  analyzerMode: "openai" | "deterministic" | "fallback";
  storageRequested: boolean;
  finishStatus: string;
  errorCategory?: string;
}

export interface ReasoningAnalyzerOutput {
  source: ReasoningAnalysisSource;
  result: ReasoningAnalysisResult;
  metadata: ReasoningAnalyzerMetadata;
}

export interface ReasoningAnalyzer {
  analyze(input: ReasoningAnalysisInput): Promise<ReasoningAnalyzerOutput>;
}
