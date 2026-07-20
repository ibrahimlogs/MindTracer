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
    const session = await sessionEngine.generateAnalysis(
      path.sessionId,
      idempotencyKey,
      requestId,
    );
    return sessionSuccess(
      {
        sessionId: session.publicId,
        stage: session.currentStage,
        analysisSource: session.analysis?.source ?? "deterministic",
        summary: session.analysis?.summary ?? null,
        extractionConfidenceBand:
          session.analysis?.result.extractionConfidenceBand ?? null,
        needsClarification: session.analysis?.result.needsClarification ?? null,
        session,
      },
      201,
      requestId,
    );
  } catch (error) {
    return handleRouteError(error, requestId);
  }
}
