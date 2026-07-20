import { apiSuccess } from "@/lib/api/response";
import { hasDatabaseUrl } from "@/lib/database/client";
import { getServerEnv } from "@/lib/validation/env";

async function checkDatabaseReachable() {
  if (!hasDatabaseUrl()) return false;

  try {
    const { getDatabase } = await import("@/lib/database/client");
    await getDatabase().$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const env = getServerEnv();
  const databaseConfigured = Boolean(env.DATABASE_URL);
  const databaseReachable = await checkDatabaseReachable();

  return apiSuccess({
    applicationReady:
      env.APP_ENV !== "production" ||
      !databaseConfigured ||
      databaseReachable ||
      env.ALLOW_IN_MEMORY_SESSION_FALLBACK,
    version: "1.0.0-build-week",
    appEnv: env.APP_ENV,
    databaseConfigured,
    databaseReachable,
    openAIConfigured: Boolean(env.OPENAI_API_KEY),
    reasoningMode: env.REASONING_ANALYZER_MODE,
    judgeModeEnabled: env.JUDGE_MODE,
    cachedJudgeFallbackEnabled: env.ALLOW_CACHED_JUDGE_FALLBACK,
    inMemoryFallbackEnabled: env.ALLOW_IN_MEMORY_SESSION_FALLBACK,
  });
}
