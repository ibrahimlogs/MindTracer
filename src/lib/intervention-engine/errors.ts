export type InterventionEngineErrorCode =
  | "UNKNOWN_INTERVENTION_ID"
  | "UNKNOWN_VISUALIZER_TYPE"
  | "WRONG_INTERVENTION_FAMILY"
  | "INVALID_INTERVENTION_LEVEL"
  | "ANSWER_LEAKAGE_DETECTED"
  | "UNSAFE_ADAPTATION"
  | "INTERVENTION_UNAVAILABLE";

export class InterventionEngineError extends Error {
  readonly code: InterventionEngineErrorCode;
  readonly details: Record<string, unknown>;

  constructor(
    code: InterventionEngineErrorCode,
    message: string,
    details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "InterventionEngineError";
    this.code = code;
    this.details = details;
  }
}
