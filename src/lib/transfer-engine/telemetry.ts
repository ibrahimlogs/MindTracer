import { logger } from "@/lib/logger";

export function logTransferEngineEvent(context: Record<string, unknown>) {
  logger.info("transfer_engine.event", context);
}
