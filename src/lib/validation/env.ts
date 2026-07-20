import "server-only";

import { z } from "zod";

const booleanString = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
});

export const serverEnvSchema = publicEnvSchema.extend({
  DATABASE_URL: z
    .url({ protocol: /^postgres(ql)?$/ })
    .optional()
    .or(z.literal("").transform(() => undefined)),
  OPENAI_API_KEY: z
    .string()
    .min(1, "OPENAI_API_KEY is required")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  DEMO_MODE: booleanString.default(true),
  ALLOW_IN_MEMORY_SESSION_FALLBACK: booleanString.default(true),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

export function getServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    DEMO_MODE: process.env.DEMO_MODE,
    ALLOW_IN_MEMORY_SESSION_FALLBACK:
      process.env.ALLOW_IN_MEMORY_SESSION_FALLBACK,
  });

  if (!result.success) {
    throw new Error(
      `Invalid server environment: ${z.prettifyError(result.error)}`,
    );
  }

  return result.data;
}
