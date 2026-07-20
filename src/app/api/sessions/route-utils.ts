import type { NextRequest } from "next/server";
import { ZodError, type ZodType } from "zod";

import { apiError, apiSuccess } from "@/lib/api/response";
import { AiReasoningError } from "@/lib/ai/reasoning";
import {
  idempotencyKeySchema,
  SessionEngineError,
  toSessionEngineError,
} from "@/lib/session-engine";

export async function parseJson<T>(request: NextRequest, schema: ZodType<T>) {
  const body = (await request.json().catch(() => ({}))) as unknown;
  return schema.parse(body);
}

export function parseIdempotencyKey(request: NextRequest) {
  return idempotencyKeySchema.parse(request.headers.get("Idempotency-Key"));
}

export function handleRouteError(error: unknown, requestId?: string) {
  if (error instanceof ZodError) {
    return apiError(
      "VALIDATION_ERROR",
      "The request did not match the API contract.",
      422,
      error.flatten(),
      { requestId },
    );
  }

  if (error instanceof AiReasoningError) {
    return apiError(
      "INTERNAL_ERROR",
      error.category === "AI_NOT_CONFIGURED"
        ? "Reasoning analysis is not configured."
        : "Reasoning analysis is temporarily unavailable.",
      error.retryable ? 503 : 500,
      { category: error.category, retryable: error.retryable },
      { requestId },
    );
  }

  const sessionError =
    error instanceof SessionEngineError ? error : toSessionEngineError(error);

  return apiError(
    sessionError.code,
    sessionError.message,
    sessionError.status,
    sessionError.details,
    { requestId },
  );
}

export function sessionSuccess<T>(data: T, status = 200, requestId?: string) {
  return apiSuccess(data, { status }, { requestId });
}
