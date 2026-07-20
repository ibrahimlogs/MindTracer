import type { NextRequest } from "next/server";

import {
  handleRouteError,
  sessionSuccess,
} from "@/app/api/sessions/route-utils";
import { sessionEngine, sessionPathSchema } from "@/lib/session-engine";

interface SessionRouteProps {
  params: Promise<{ sessionId: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: SessionRouteProps,
) {
  const requestId = crypto.randomUUID();

  try {
    const path = sessionPathSchema.parse(await params);
    return sessionSuccess(
      sessionEngine.getSession(path.sessionId),
      200,
      requestId,
    );
  } catch (error) {
    return handleRouteError(error, requestId);
  }
}
