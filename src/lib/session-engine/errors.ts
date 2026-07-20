export type SessionErrorCode =
  | "VALIDATION_ERROR"
  | "SESSION_NOT_FOUND"
  | "SESSION_EXPIRED"
  | "SESSION_COMPLETED"
  | "INVALID_STATE_TRANSITION"
  | "DUPLICATE_SUBMISSION"
  | "IDEMPOTENCY_PAYLOAD_MISMATCH"
  | "PROBLEM_NOT_FOUND"
  | "VERIFICATION_NOT_PENDING"
  | "INTERVENTION_NOT_READY"
  | "TRANSFER_NOT_READY"
  | "DATABASE_UNAVAILABLE"
  | "INTERNAL_ERROR";

const statusByCode: Record<SessionErrorCode, number> = {
  VALIDATION_ERROR: 422,
  SESSION_NOT_FOUND: 404,
  SESSION_EXPIRED: 410,
  SESSION_COMPLETED: 409,
  INVALID_STATE_TRANSITION: 409,
  DUPLICATE_SUBMISSION: 409,
  IDEMPOTENCY_PAYLOAD_MISMATCH: 409,
  PROBLEM_NOT_FOUND: 404,
  VERIFICATION_NOT_PENDING: 409,
  INTERVENTION_NOT_READY: 409,
  TRANSFER_NOT_READY: 409,
  DATABASE_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
};

export class SessionEngineError extends Error {
  readonly status: number;

  constructor(
    readonly code: SessionErrorCode,
    message: string,
    readonly details: unknown = null,
  ) {
    super(message);
    this.name = "SessionEngineError";
    this.status = statusByCode[code];
  }
}

export function toSessionEngineError(error: unknown) {
  if (error instanceof SessionEngineError) return error;
  return new SessionEngineError("INTERNAL_ERROR", "Unexpected session error.");
}
