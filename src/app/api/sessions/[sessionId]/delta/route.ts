import type { NextRequest } from "next/server";

import {
  handleRouteError,
  parseIdempotencyKey,
  sessionSuccess,
} from "@/app/api/sessions/route-utils";
import { sessionEngine, sessionPathSchema } from "@/lib/session-engine";

interface RouteProps {
  params: Promise<{ sessionId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteProps) {
  const requestId = crypto.randomUUID();

  try {
    const path = sessionPathSchema.parse(await params);
    const idempotencyKey = parseIdempotencyKey(request);
    return sessionSuccess(
      sessionEngine.createDelta(path.sessionId, idempotencyKey),
      201,
      requestId,
    );
  } catch (error) {
    return handleRouteError(error, requestId);
  }
}
