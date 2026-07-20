import { getServerEnv } from "@/lib/validation/env";

export type ReasoningAnalyzerMode = "openai" | "deterministic" | "fallback";

export interface ReasoningAnalyzerConfig {
  mode: ReasoningAnalyzerMode;
  model: string;
  timeoutMs: number;
  maxRetries: number;
  storeResponses: boolean;
  hasApiKey: boolean;
}

export function getReasoningAnalyzerConfig(): ReasoningAnalyzerConfig {
  const env = getServerEnv();
  return {
    mode: env.REASONING_ANALYZER_MODE,
    model: env.OPENAI_REASONING_MODEL,
    timeoutMs: env.OPENAI_REASONING_TIMEOUT_MS,
    maxRetries: env.OPENAI_REASONING_MAX_RETRIES,
    storeResponses: env.OPENAI_STORE_RESPONSES,
    hasApiKey: Boolean(env.OPENAI_API_KEY),
  };
}
