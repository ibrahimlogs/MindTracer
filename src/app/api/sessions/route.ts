import type { NextRequest } from "next/server";

import {
  handleRouteError,
  parseJson,
  sessionSuccess,
} from "@/app/api/sessions/route-utils";
import { checkRateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { createSessionSchema, sessionEngine } from "@/lib/session-engine";

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const limiter = checkRateLimit({
    key: `session-create:${request.headers.get("x-forwarded-for") ?? "local"}`,
    limit: 20,
    windowMs: 60_000,
  });

  if (limiter.limited) {
    const response = rateLimitedResponse(limiter.retryAfterSeconds);
    response.headers.set("Retry-After", String(limiter.retryAfterSeconds));
    return response;
  }

  try {
    const input = await parseJson(request, createSessionSchema);
    const session = sessionEngine.createSession(input);

    return sessionSuccess(
      {
        sessionId: session.sessionId,
        publicId: session.publicId,
        mode: session.mode,
        currentStage: session.currentStage,
        status: session.status,
        fallbackMode: session.fallbackMode,
      },
      201,
      requestId,
    );
  } catch (error) {
    return handleRouteError(error, requestId);
  }
}
