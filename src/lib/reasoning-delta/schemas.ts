import { z } from "zod";

import type { ReasoningAnalysisResult } from "@/lib/ai/reasoning";
import type {
  InterventionSnapshot,
  PersistedAttempt,
  SupportUsageSummary,
  VerificationSnapshot,
} from "@/lib/session-engine/repository";
import type { ProblemRecord, ReasoningRubric } from "@/types/education";

export const reasoningDeltaPromptVersion = "reasoning-delta-v1";

export const rubricDimensionIdSchema = z.enum([
  "observation_accuracy",
  "relationship_type",
  "evidence_use",
  "rule_formation",
  "formal_representation",
  "uncertainty_awareness",
  "independence",
  "remaining_gap",
]);

export const rubricStateSchema = z.enum([
  "strong",
  "developing",
  "missing",
  "incorrect",
  "insufficient_evidence",
]);

export const changeStatusSchema = z.enum([
  "preserved",
  "improved",
  "corrected",
  "unchanged",
  "regressed",
  "insufficient_evidence",
]);

export const overallChangeSchema = z.enum([
  "substantially_improved",
  "improved",
  "partially_improved",
  "unchanged",
  "regressed",
  "insufficient_evidence",
]);

export const reasoningDeltaDimensionSchema = z.object({
  dimensionId: rubricDimensionIdSchema,
  beforeState: rubricStateSchema,
  afterState: rubricStateSchema,
  changeStatus: changeStatusSchema,
  beforeEvidence: z.string().min(1).max(240),
  afterEvidence: z.string().min(1).max(240),
  conciseReason: z.string().min(1).max(240),
});

export const reasoningDeltaOutputSchema = z.object({
  preservedUnderstanding: z.array(z.string().min(1).max(240)).max(6),
  correctedReasoning: z.array(z.string().min(1).max(240)).max(6),
  newUnderstanding: z.array(z.string().min(1).max(240)).max(6),
  remainingGaps: z.array(z.string().min(1).max(240)).max(6),
  dimensions: z.array(reasoningDeltaDimensionSchema).length(8),
  overallChange: overallChangeSchema,
  supportSummary: z.object({
    interventionCount: z.number().int().min(0),
    highestLevelUsed: z.number().int().min(0).max(8),
    supportLabel: z.string().min(1).max(120),
    independenceAdjustment: z.string().min(1).max(240),
  }),
  transferReady: z.boolean(),
  transferReadinessReason: z.string().min(1).max(240),
  learnerFacingSummary: z.string().min(1).max(500),
  internalNotes: z.array(z.string().max(240)).max(6),
});

export interface ReasoningDeltaInput {
  sessionPublicId: string;
  problem: ProblemRecord;
  conceptIds: readonly string[];
  initialAttempt: PersistedAttempt;
  initialAnalysis: ReasoningAnalysisResult;
  verifiedLearningNeed: string;
  verification: VerificationSnapshot | null;
  interventions: readonly InterventionSnapshot[];
  supportUsage: SupportUsageSummary;
  retryAttempt: PersistedAttempt;
  retryAnalysis: ReasoningAnalysisResult;
  rubric: ReasoningRubric;
  promptVersion: typeof reasoningDeltaPromptVersion;
}

export type RubricDimensionId = z.infer<typeof rubricDimensionIdSchema>;
export type RubricState = z.infer<typeof rubricStateSchema>;
export type ChangeStatus = z.infer<typeof changeStatusSchema>;
export type OverallChange = z.infer<typeof overallChangeSchema>;
export type ReasoningDeltaDimension = z.infer<
  typeof reasoningDeltaDimensionSchema
>;
export type ReasoningDeltaOutput = z.infer<typeof reasoningDeltaOutputSchema>;
