import type { NextRequest } from "next/server";

import {
  handleRouteError,
  parseIdempotencyKey,
  parseJson,
  sessionSuccess,
} from "@/app/api/sessions/route-utils";
import {
  sessionEngine,
  sessionPathSchema,
  transferSubmitSchema,
} from "@/lib/session-engine";

interface RouteProps {
  params: Promise<{ sessionId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteProps) {
  const requestId = crypto.randomUUID();

  try {
    const path = sessionPathSchema.parse(await params);
    const input = await parseJson(request, transferSubmitSchema);
    const idempotencyKey = parseIdempotencyKey(request);
    return sessionSuccess(
      await sessionEngine.submitTransfer(path.sessionId, input, idempotencyKey),
      201,
      requestId,
    );
  } catch (error) {
    return handleRouteError(error, requestId);
  }
}
