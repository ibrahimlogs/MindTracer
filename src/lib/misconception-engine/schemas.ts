import { z } from "zod";

import type { ReasoningAnalysisResult } from "@/lib/ai/reasoning";
import type { PersistedAttempt } from "@/lib/session-engine/repository";
import type {
  MisconceptionRecord,
  ProblemRecord,
  VerificationQuestionTemplate,
} from "@/types/education";

export const misconceptionRankerPromptVersion = "misconception-ranker-v1";
export const verificationEvaluatorPromptVersion = "verification-evaluator-v1";
export const maximumRetrievedCandidates = 6;
export const maximumRankedHypotheses = 3;
export const maximumAutomaticVerificationQuestions = 2;

export const retrievalScoreBandSchema = z.enum(["strong", "moderate", "weak"]);
export const confidenceBandSchema = z.enum([
  "high",
  "medium",
  "low",
  "insufficient_evidence",
]);
export const overallUncertaintySchema = z.enum([
  "low",
  "medium",
  "high",
  "insufficient_evidence",
]);
export const verificationRiskSchema = z.enum(["low", "medium", "high"]);
export const verificationReasonCodeSchema = z.enum([
  "COMPETING_HYPOTHESES",
  "MEDIUM_OR_LOW_CONFIDENCE",
  "ANALYSIS_NEEDS_CLARIFICATION",
  "ANSWER_REASONING_CONFLICT",
  "COUNTERSIGNAL_PRESENT",
  "DIFFERENT_INTERVENTIONS_REQUIRED",
  "ARITHMETIC_VS_CONCEPTUAL_UNCLEAR",
  "VERIFICATION_NOT_NEEDED",
  "NO_MEANINGFUL_HYPOTHESIS",
]);
export const questionAdaptationSourceSchema = z.enum([
  "deterministic",
  "openai",
  "fallback",
]);
export const verificationResultStatusSchema = z.enum([
  "confirmed",
  "probable",
  "uncertain",
  "not_detected",
  "arithmetic_only",
]);
export const verificationResolutionSchema = z.enum([
  "resolved",
  "partially_resolved",
  "unresolved",
]);
export const interventionFamilySchema = z.enum([
  "consecutive_difference",
  "additive_multiplicative_contrast",
  "slope_intercept_bridge",
  "variable_role_check",
  "arithmetic_check",
  "evidence_comparison",
  "none",
]);

export const retrievedCandidateSchema = z.object({
  candidateId: z.string().min(1),
  retrievalScoreBand: retrievalScoreBandSchema,
  matchedSignals: z.array(z.string().min(1)).max(8),
  matchedCounterSignals: z.array(z.string().min(1)).max(8),
  sourceReasons: z.array(z.string().min(1)).max(8),
  requiresVerification: z.boolean(),
});

export const rankedHypothesisSchema = z.object({
  misconceptionId: z.string().min(1),
  rank: z.number().int().min(1).max(maximumRankedHypotheses),
  confidenceBand: confidenceBandSchema,
  supportingEvidence: z.array(z.string().min(1).max(240)).max(8),
  conflictingEvidence: z.array(z.string().min(1).max(240)).max(8),
  unresolvedDistinctions: z.array(z.string().min(1).max(240)).max(6),
  verificationNeeded: z.boolean(),
  verificationGoal: z.string().min(1).max(240),
});

export const hypothesisRankingOutputSchema = z.object({
  hypotheses: z.array(rankedHypothesisSchema).max(maximumRankedHypotheses),
  overallUncertainty: overallUncertaintySchema,
  verificationRecommended: z.boolean(),
  verificationReason: z.string().min(1).max(300),
  safeLearnerMessage: z.string().min(1).max(300),
  rankerSource: questionAdaptationSourceSchema,
  fallbackErrorCategory: z.string().min(1).nullable(),
});

export const verificationDecisionSchema = z.object({
  required: z.boolean(),
  reasonCode: verificationReasonCodeSchema,
  reason: z.string().min(1).max(300),
  targetHypothesisIds: z.array(z.string().min(1)).max(maximumRankedHypotheses),
  verificationGoal: z.string().min(1).max(240),
  riskIfSkipped: verificationRiskSchema,
});

export const verificationQuestionOutputSchema = z.object({
  templateId: z.string().min(1),
  question: z.string().min(1).max(300),
  answerFormat: z.enum([
    "number",
    "short_text",
    "choice",
    "yes_no_with_reason",
  ]),
  verificationGoal: z.string().min(1).max(240),
  targetHypothesisIds: z.array(z.string().min(1)).min(1).max(3),
  revealsAnswer: z.boolean(),
  adaptationSource: questionAdaptationSourceSchema,
});

export const verificationEvaluationOutputSchema = z.object({
  status: verificationResultStatusSchema,
  confirmedMisconceptionId: z.string().min(1).nullable(),
  remainingHypotheses: z
    .array(rankedHypothesisSchema)
    .max(maximumRankedHypotheses),
  supportedHypothesisIds: z.array(z.string().min(1)).max(3),
  weakenedHypothesisIds: z.array(z.string().min(1)).max(3),
  rejectedHypothesisIds: z.array(z.string().min(1)).max(3),
  resolution: verificationResolutionSchema,
  evidenceSummary: z.array(z.string().min(1).max(240)).max(6),
  requiresAdditionalVerification: z.boolean(),
  additionalVerificationGoal: z.string().min(1).max(240).nullable(),
  recommendedInterventionFamily: interventionFamilySchema,
  recommendedStartingLevel: z.number().int().min(1).max(4),
  safeLearnerSummary: z.object({
    preservedUnderstanding: z.array(z.string().min(1).max(240)).max(4),
    verifiedLearningNeed: z.string().min(1).max(240),
    nextSystemAction: z.string().min(1).max(240),
  }),
});

export interface CandidateRetrievalInput {
  sessionPublicId: string;
  problem: ProblemRecord;
  attempt: PersistedAttempt;
  analysis: ReasoningAnalysisResult;
  candidateRecords: readonly MisconceptionRecord[];
}

export interface HypothesisRankingInput extends CandidateRetrievalInput {
  retrievedCandidates: readonly RetrievedCandidate[];
  verificationHistory: readonly {
    question: string;
    response: string | null;
    status: "pending" | "answered" | "skipped";
  }[];
  promptVersion: typeof misconceptionRankerPromptVersion;
  allowedCandidateIds: readonly string[];
}

export interface VerificationQuestionSelectionInput {
  problem: ProblemRecord;
  ranking: HypothesisRankingOutput;
  decision: VerificationDecision;
  candidateRecords: readonly MisconceptionRecord[];
  verificationHistoryCount: number;
}

export interface VerificationResponseEvaluationInput {
  verificationInteractionId: string;
  question: string;
  verificationGoal: string;
  targetHypothesisIds: readonly string[];
  expectedEvidence: string;
  disconfirmingEvidence: string;
  learnerResponse: string;
  originalReasoningAnalysis: ReasoningAnalysisResult;
  rankedHypotheses: readonly RankedHypothesis[];
  problem: ProblemRecord;
  answerFormat: VerificationQuestionOutput["answerFormat"];
  verificationHistoryCount: number;
}

export type RetrievedCandidate = z.infer<typeof retrievedCandidateSchema>;
export type RankedHypothesis = z.infer<typeof rankedHypothesisSchema>;
export type HypothesisRankingOutput = z.infer<
  typeof hypothesisRankingOutputSchema
>;
export type VerificationDecision = z.infer<typeof verificationDecisionSchema>;
export type VerificationQuestionOutput = z.infer<
  typeof verificationQuestionOutputSchema
>;
export type VerificationEvaluationOutput = z.infer<
  typeof verificationEvaluationOutputSchema
>;
export type VerificationQuestionTemplateRecord = VerificationQuestionTemplate;
