import { logger } from "@/lib/logger";

export function logReasoningDeltaEvent(context: Record<string, unknown>) {
  logger.info("reasoning_delta.event", context);
}
