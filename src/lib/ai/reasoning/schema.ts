import { z } from "zod";

import type { AttemptType } from "@/lib/session-engine";

export const reasoningPromptVersion = "reasoning-extractor-v1";

export const relationshipClaimedSchema = z.enum([
  "constant_difference",
  "direct_multiplication",
  "additive_linear",
  "constant_ratio",
  "approximate_growth",
  "equation_based",
  "no_relationship_claimed",
  "unclear",
  "other",
]);

export const operationUsedSchema = z.enum([
  "addition",
  "subtraction",
  "multiplication",
  "division",
  "comparison",
  "pattern_extension",
  "substitution",
  "equation_formation",
  "estimation",
  "counting_steps",
  "none",
  "unclear",
]);

export const reasoningAnalysisInputSchema = z.object({
  analysisId: z.string().min(1),
  sessionPublicId: z.string().min(1),
  problemId: z.string().min(1),
  conceptIds: z.array(z.string().min(1)).min(1),
  problemContext: z.string().min(1).max(1200),
  dataRepresentation: z.unknown(),
  question: z.string().min(1).max(800),
  expectedAnswerType: z.enum(["number", "text", "equation", "choice"]),
  answerStatus: z.enum(["correct", "incorrect", "unparseable", "empty"]),
  answerCanBeParsed: z.boolean(),
  explanationIsEmpty: z.boolean(),
  solutionModelConcepts: z.array(z.string().min(1)),
  learnerAnswer: z.string().max(500),
  learnerExplanation: z.string().max(2000),
  selectedApproach: z.string().max(120).optional(),
  selfReportedConfidence: z.string().max(80).optional(),
  attemptType: z.custom<AttemptType>(),
  allowedOperations: z.array(operationUsedSchema),
  promptVersion: z.literal(reasoningPromptVersion),
});

const quoteFragmentSchema = z.string().max(180);

export const safeLearnerSummarySchema = z.object({
  preservedUnderstanding: z.array(z.string().min(1).max(240)).max(4),
  stillUnclear: z.array(z.string().min(1).max(240)).max(4),
  nextSystemAction: z.string().min(1).max(240),
});

export const reasoningAnalysisResultSchema = z.object({
  observedClaims: z.array(
    z.object({
      claim: z.string().min(1).max(240),
      evidenceQuoteFragment: quoteFragmentSchema,
      source: z.enum([
        "answer",
        "explanation",
        "selected_approach",
        "confidence_selection",
      ]),
      certainty: z.enum(["explicit", "strongly_implied"]),
    }),
  ),
  inferredReasoningSteps: z.array(
    z.object({
      step: z.string().min(1).max(240),
      evidenceBasis: z.string().min(1).max(240),
      inferenceStrength: z.enum(["strong", "moderate", "weak"]),
    }),
  ),
  relationshipClaimed: relationshipClaimedSchema,
  relationshipOtherDescription: z.string().max(160).nullable(),
  operationsUsed: z.array(operationUsedSchema),
  evidenceReferenced: z.array(
    z.object({
      evidenceType: z.enum([
        "table_row",
        "value_pair",
        "consecutive_change",
        "ratio",
        "equation",
        "verbal_pattern",
        "isolated_value",
        "none",
      ]),
      description: z.string().min(1).max(240),
      problemReference: z.string().min(1).max(160),
      supportStrength: z.enum(["strong", "partial", "weak"]),
    }),
  ),
  evidenceIgnored: z.array(
    z.object({
      description: z.string().min(1).max(240),
      relevance: z.string().min(1).max(200),
      omissionConfidence: z.enum(["high", "medium", "low"]),
    }),
  ),
  correctObservations: z.array(z.string().min(1).max(240)),
  unsupportedClaims: z.array(z.string().min(1).max(240)),
  contradictionSignals: z.array(
    z.object({
      description: z.string().min(1).max(240),
      evidenceA: z.string().min(1).max(180),
      evidenceB: z.string().min(1).max(180),
      severity: z.enum(["low", "medium", "high"]),
    }),
  ),
  uncertaintySignals: z.array(
    z.object({
      signal: z.string().min(1).max(160),
      source: z.string().min(1).max(120),
      meaning: z.string().min(1).max(200),
    }),
  ),
  reasoningCompleteness: z.enum([
    "complete",
    "mostly_complete",
    "partial",
    "minimal",
    "absent",
    "contradictory",
    "insufficient_evidence",
  ]),
  answerReasoningAlignment: z.enum([
    "correct_answer_supported_by_reasoning",
    "correct_answer_weakly_supported",
    "correct_answer_by_apparent_guess",
    "incorrect_answer_with_partially_correct_reasoning",
    "incorrect_answer_with_incorrect_reasoning",
    "answer_and_reasoning_conflict",
    "insufficient_evidence",
  ]),
  explanationQuality: z.enum([
    "clear_and_evidenced",
    "understandable_but_incomplete",
    "vague",
    "contradictory",
    "minimal",
    "absent",
  ]),
  needsClarification: z.boolean(),
  clarificationGoal: z.string().min(1).max(240).nullable(),
  extractionConfidenceBand: z.enum([
    "high",
    "medium",
    "low",
    "insufficient_evidence",
  ]),
  safeLearnerSummary: safeLearnerSummarySchema,
  internalNotes: z.string().max(300),
});

export type ReasoningAnalysisInput = z.infer<
  typeof reasoningAnalysisInputSchema
>;
export type ReasoningAnalysisResult = z.infer<
  typeof reasoningAnalysisResultSchema
>;
export type SafeLearnerSummary = z.infer<typeof safeLearnerSummarySchema>;

export const reasoningAnalysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: Object.keys(reasoningAnalysisResultSchema.shape),
  properties: Object.fromEntries(
    Object.keys(reasoningAnalysisResultSchema.shape).map((key) => [key, {}]),
  ),
} as const;
