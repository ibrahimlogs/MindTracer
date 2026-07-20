import { logger } from "@/lib/logger";

export function logReasoningAnalysis(event: {
  requestId: string;
  sessionPublicId: string;
  attemptId: string;
  analyzerMode: string;
  analysisSource: string;
  model: string;
  promptVersion: string;
  latencyMs: number;
  retryCount: number;
  errorCategory?: string;
  fallbackUsed: boolean;
  finalStatus: string;
}) {
  logger.info("reasoning.analysis", event);
}
