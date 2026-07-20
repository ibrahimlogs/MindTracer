import { z } from "zod";

import type { ReasoningAnalysisResult } from "@/lib/ai/reasoning";
import type { ReasoningDeltaOutput } from "@/lib/reasoning-delta";
import type { SupportUsageSummary } from "@/lib/session-engine/repository";
import type { ProblemRecord, ReasoningRubric } from "@/types/education";

export const transferEvaluatorPromptVersion = "transfer-evaluator-v1";

export const transferSupportStateSchema = z.enum([
  "independent",
  "delayed_hint_available",
  "hint_requested",
  "supported",
]);

export const transferEvidenceUseSchema = z.enum([
  "strong",
  "developing",
  "weak",
  "missing",
  "insufficient_evidence",
]);

export const explanationCompletenessSchema = z.enum([
  "complete",
  "mostly_complete",
  "partial",
  "minimal",
  "contradictory",
  "absent",
]);

export const transferIndependenceStateSchema = z.enum([
  "independent",
  "low_support",
  "supported",
  "heavily_supported",
  "insufficient_evidence",
]);

export const transferStatusSchema = z.enum([
  "successful",
  "partially_successful",
  "unsuccessful",
  "inconclusive",
]);

export const copiedStructureRiskSchema = z.enum([
  "low",
  "medium",
  "high",
  "insufficient_evidence",
]);

export const transferEvaluationOutputSchema = z.object({
  answerCorrect: z.boolean(),
  conceptApplied: z.boolean(),
  evidenceUse: transferEvidenceUseSchema,
  explanationCompleteness: explanationCompletenessSchema,
  independenceState: transferIndependenceStateSchema,
  transferStatus: transferStatusSchema,
  copiedStructureRisk: copiedStructureRiskSchema,
  remainingGap: z.string().min(1).max(240).nullable(),
  learnerFacingSummary: z.string().min(1).max(500),
  internalNotes: z.array(z.string().max(240)).max(6),
});

export interface TransferSelection {
  problemId: string;
  supportState: z.infer<typeof transferSupportStateSchema>;
  selectorSource: "deterministic";
  selectionReason: string;
  selectedAt: string;
}

export interface TransferEvaluationInput {
  sourceConceptIds: readonly string[];
  transferProblem: ProblemRecord;
  initialLearningNeed: string;
  reasoningDelta: ReasoningDeltaOutput;
  supportSummary: SupportUsageSummary;
  transferAnswer: string;
  transferExplanation: string;
  transferAnalysis: ReasoningAnalysisResult;
  helpUsedDuringTransfer: boolean;
  transferSupportState: z.infer<typeof transferSupportStateSchema>;
  transferRubric: ReasoningRubric;
  promptVersion: typeof transferEvaluatorPromptVersion;
}

export type TransferEvaluationOutput = z.infer<
  typeof transferEvaluationOutputSchema
>;
export type TransferSupportStateValue = z.infer<
  typeof transferSupportStateSchema
>;
