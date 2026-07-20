import type { NextRequest } from "next/server";

import {
  handleRouteError,
  sessionSuccess,
} from "@/app/api/sessions/route-utils";
import { sessionEngine, sessionPathSchema } from "@/lib/session-engine";

interface RouteProps {
  params: Promise<{ sessionId: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteProps) {
  const requestId = crypto.randomUUID();

  try {
    const path = sessionPathSchema.parse(await params);
    return sessionSuccess(
      sessionEngine.restart(path.sessionId),
      201,
      requestId,
    );
  } catch (error) {
    return handleRouteError(error, requestId);
  }
}
