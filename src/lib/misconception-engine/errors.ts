import type { AiErrorCategory } from "@/lib/ai/reasoning";

export type MisconceptionEngineErrorCode =
  | "NO_CANDIDATES"
  | "UNKNOWN_MISCONCEPTION_ID"
  | "DUPLICATE_HYPOTHESIS_ID"
  | "INVALID_RANKING_OUTPUT"
  | "INVALID_VERIFICATION_QUESTION"
  | "UNKNOWN_TEMPLATE_ID"
  | "VERIFICATION_LIMIT_REACHED"
  | "AI_RANKER_UNAVAILABLE";

export class MisconceptionEngineError extends Error {
  readonly code: MisconceptionEngineErrorCode;
  readonly details: Record<string, unknown>;

  constructor(
    code: MisconceptionEngineErrorCode,
    message: string,
    details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "MisconceptionEngineError";
    this.code = code;
    this.details = details;
  }
}

export interface EngineFallbackMetadata {
  source: "deterministic" | "openai" | "fallback";
  fallbackErrorCategory: AiErrorCategory | null;
}
