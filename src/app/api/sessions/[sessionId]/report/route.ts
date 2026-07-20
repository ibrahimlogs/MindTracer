import type { NextRequest } from "next/server";

import {
  handleRouteError,
  sessionSuccess,
} from "@/app/api/sessions/route-utils";
import { sessionEngine, sessionPathSchema } from "@/lib/session-engine";

interface RouteProps {
  params: Promise<{ sessionId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteProps) {
  const requestId = crypto.randomUUID();

  try {
    const path = sessionPathSchema.parse(await params);
    const session = sessionEngine.getSession(path.sessionId);
    return sessionSuccess(
      { sessionId: session.sessionId, report: session.report, session },
      200,
      requestId,
    );
  } catch (error) {
    return handleRouteError(error, requestId);
  }
}
