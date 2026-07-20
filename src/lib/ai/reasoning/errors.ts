export type AiErrorCategory =
  | "AI_NOT_CONFIGURED"
  | "AI_AUTHENTICATION_ERROR"
  | "AI_RATE_LIMITED"
  | "AI_TIMEOUT"
  | "AI_NETWORK_ERROR"
  | "AI_REFUSAL"
  | "AI_INCOMPLETE_RESPONSE"
  | "AI_INVALID_STRUCTURED_OUTPUT"
  | "AI_EMPTY_RESPONSE"
  | "AI_INTERNAL_ERROR";

export class AiReasoningError extends Error {
  constructor(
    readonly category: AiErrorCategory,
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = "AiReasoningError";
  }
}

export function mapOpenAIError(error: unknown): AiReasoningError {
  if (error instanceof AiReasoningError) return error;
  if (error instanceof DOMException && error.name === "AbortError") {
    return new AiReasoningError(
      "AI_TIMEOUT",
      "Reasoning analysis timed out.",
      true,
    );
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("401") || message.includes("api key")) {
      return new AiReasoningError(
        "AI_AUTHENTICATION_ERROR",
        "OpenAI authentication failed.",
        false,
      );
    }
    if (message.includes("429") || message.includes("rate")) {
      return new AiReasoningError(
        "AI_RATE_LIMITED",
        "OpenAI rate limited.",
        true,
      );
    }
    if (message.includes("timeout") || message.includes("aborted")) {
      return new AiReasoningError(
        "AI_TIMEOUT",
        "Reasoning analysis timed out.",
        true,
      );
    }
    if (message.includes("network") || message.includes("fetch")) {
      return new AiReasoningError(
        "AI_NETWORK_ERROR",
        "OpenAI network error.",
        true,
      );
    }
  }
  return new AiReasoningError(
    "AI_INTERNAL_ERROR",
    "OpenAI reasoning analysis failed.",
    false,
  );
}
