import type { NextRequest } from "next/server";

import {
  handleRouteError,
  parseIdempotencyKey,
  parseJson,
  sessionSuccess,
} from "@/app/api/sessions/route-utils";
import {
  interventionMoreHelpSchema,
  sessionEngine,
  sessionPathSchema,
} from "@/lib/session-engine";

interface RouteProps {
  params: Promise<{ sessionId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteProps) {
  const requestId = crypto.randomUUID();

  try {
    const path = sessionPathSchema.parse(await params);
    const input = await parseJson(request, interventionMoreHelpSchema);
    const idempotencyKey = parseIdempotencyKey(request);
    return sessionSuccess(
      await sessionEngine.requestMoreHelp(
        path.sessionId,
        input,
        idempotencyKey,
      ),
      201,
      requestId,
    );
  } catch (error) {
    return handleRouteError(error, requestId);
  }
}
