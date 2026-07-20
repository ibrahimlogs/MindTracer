import "server-only";

import { z } from "zod";

const booleanString = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

const optionalIntegerString = z
  .string()
  .regex(/^\d+$/)
  .transform((value) => Number.parseInt(value, 10));

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
  OPENAI_REASONING_MODEL: z.string().min(1).default("gpt-5.6"),
  OPENAI_REASONING_TIMEOUT_MS: optionalIntegerString.default(12000),
  OPENAI_REASONING_MAX_RETRIES: optionalIntegerString.default(1),
  OPENAI_STORE_RESPONSES: booleanString.default(false),
  REASONING_ANALYZER_MODE: z
    .enum(["openai", "deterministic", "fallback"])
    .default("deterministic"),
  MISCONCEPTION_RANKER_MODE: z
    .enum(["openai", "deterministic", "fallback"])
    .default("deterministic"),
  VERIFICATION_ADAPTER_MODE: z
    .enum(["openai", "deterministic", "fallback"])
    .default("deterministic"),
  VERIFICATION_EVALUATOR_MODE: z
    .enum(["openai", "deterministic", "fallback"])
    .default("deterministic"),
  INTERVENTION_SELECTOR_MODE: z
    .enum(["openai", "deterministic", "fallback"])
    .default("deterministic"),
  INTERVENTION_ADAPTER_MODE: z
    .enum(["openai", "deterministic", "fallback"])
    .default("deterministic"),
  REASONING_DELTA_MODE: z
    .enum(["openai", "deterministic", "fallback"])
    .default("deterministic"),
  TRANSFER_EVALUATOR_MODE: z
    .enum(["openai", "deterministic", "fallback"])
    .default("deterministic"),
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
    OPENAI_REASONING_MODEL: process.env.OPENAI_REASONING_MODEL,
    OPENAI_REASONING_TIMEOUT_MS: process.env.OPENAI_REASONING_TIMEOUT_MS,
    OPENAI_REASONING_MAX_RETRIES: process.env.OPENAI_REASONING_MAX_RETRIES,
    OPENAI_STORE_RESPONSES: process.env.OPENAI_STORE_RESPONSES,
    REASONING_ANALYZER_MODE: process.env.REASONING_ANALYZER_MODE,
    MISCONCEPTION_RANKER_MODE: process.env.MISCONCEPTION_RANKER_MODE,
    VERIFICATION_ADAPTER_MODE: process.env.VERIFICATION_ADAPTER_MODE,
    VERIFICATION_EVALUATOR_MODE: process.env.VERIFICATION_EVALUATOR_MODE,
    INTERVENTION_SELECTOR_MODE: process.env.INTERVENTION_SELECTOR_MODE,
    INTERVENTION_ADAPTER_MODE: process.env.INTERVENTION_ADAPTER_MODE,
    REASONING_DELTA_MODE: process.env.REASONING_DELTA_MODE,
    TRANSFER_EVALUATOR_MODE: process.env.TRANSFER_EVALUATOR_MODE,
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
