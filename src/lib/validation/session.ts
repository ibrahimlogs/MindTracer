import { z } from "zod";

export const sessionIdSchema = z.string().trim().min(1).max(128);

export const learnerResponseSchema = z.object({
  sessionId: sessionIdSchema,
  answer: z.string().trim().min(1).max(2_000),
  confidence: z.number().int().min(1).max(5),
});

export type LearnerResponseInput = z.infer<typeof learnerResponseSchema>;
