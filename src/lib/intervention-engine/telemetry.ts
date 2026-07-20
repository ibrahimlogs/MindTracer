import { logger } from "@/lib/logger";

export function logInterventionEngineEvent(event: {
  sessionPublicId: string;
  eventType: string;
  detail: Record<string, unknown>;
}) {
  logger.info("intervention_engine.event", event);
}
