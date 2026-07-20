import { logger } from "@/lib/logger";

export function logMisconceptionEngineEvent(event: {
  sessionPublicId: string;
  eventType: string;
  source: "deterministic" | "openai" | "fallback";
  detail: Record<string, unknown>;
}) {
  logger.info("misconception_engine.event", event);
}
