import { z } from "zod";

import { sessionStages } from "@/lib/session-engine/stages";

const learnerKeySchema = z.enum(["learner-a", "learner-b"]);
const modeSchema = z.enum(["compare", "learner", "pipeline", "judge"]);
const stageSchema = z.enum(sessionStages);
const submissionKeySchema = z.string().trim().min(8).max(120);

export const idempotencyKeySchema = z.string().trim().min(8).max(160);

export const createSessionSchema = z.object({
  mode: modeSchema.default("compare"),
  learnerKey: learnerKeySchema.default("learner-a"),
  problemId: z.string().trim().min(1).default("ads_sales_001"),
});

export const sessionPathSchema = z.object({
  sessionId: z.string().trim().min(1).max(160),
});

export const attemptSchema = z.object({
  answer: z.string().trim().min(1).max(200),
  explanation: z.string().trim().min(1).max(1200),
  selectedApproach: z.string().trim().min(1).max(120).optional(),
  confidence: z.string().trim().min(1).max(80).optional(),
  submissionKey: submissionKeySchema,
});

export const verificationSubmitSchema = z.object({
  response: z.string().trim().min(1).max(1200),
  submissionKey: submissionKeySchema,
});

export const interventionAcknowledgeSchema = z.object({
  submissionKey: submissionKeySchema,
  interactionType: z
    .enum(["i_see_pattern", "let_me_try_again", "replay_visual"])
    .default("let_me_try_again"),
});

export const interventionMoreHelpSchema = z.object({
  submissionKey: submissionKeySchema,
  reason: z
    .enum(["more_help", "worked_example", "full_answer_request"])
    .default("more_help"),
});

export const transferSubmitSchema = z.object({
  answer: z.string().trim().min(1).max(200),
  explanation: z.string().trim().min(1).max(1200),
  supportUsed: z.boolean().default(false),
  submissionKey: submissionKeySchema,
});

export const jumpStageSchema = z.object({
  stage: stageSchema,
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type AttemptInput = z.infer<typeof attemptSchema>;
export type VerificationSubmitInput = z.infer<typeof verificationSubmitSchema>;
export type InterventionAcknowledgeInput = z.infer<
  typeof interventionAcknowledgeSchema
>;
export type InterventionMoreHelpInput = z.infer<
  typeof interventionMoreHelpSchema
>;
export type TransferSubmitInput = z.infer<typeof transferSubmitSchema>;
