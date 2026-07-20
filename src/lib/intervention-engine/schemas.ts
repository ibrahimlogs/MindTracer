import { z } from "zod";

import type { VerificationEvaluationOutput } from "@/lib/misconception-engine";
import type { PersistedAttempt } from "@/lib/session-engine/repository";
import type {
  InterventionRecord,
  MisconceptionRecord,
  ProblemRecord,
  VisualizerType,
} from "@/types/education";

export const interventionAdapterPromptVersion = "intervention-adapter-v1";

export const interventionFamilySchema = z.enum([
  "consecutive_difference",
  "additive_multiplicative_contrast",
  "slope_intercept_bridge",
  "variable_role_check",
  "arithmetic_check",
  "evidence_comparison",
  "none",
]);

export const interventionLevelSchema = z
  .number()
  .int()
  .min(1)
  .max(8)
  .transform((level) => level as InterventionLevel);

export const interventionSelectionSourceSchema = z.enum([
  "deterministic",
  "openai",
  "fallback",
]);

export const escalationReasonCodeSchema = z.enum([
  "LEARNER_REQUESTED_MORE_HELP",
  "RETRY_UNSUCCESSFUL",
  "RESPONSE_REMAINS_VAGUE",
  "CONCEPTUAL_CONFLICT_REMAINS",
  "WORKED_EXAMPLE_REQUESTED",
  "VERIFICATION_LIMIT_REACHED",
  "MANUAL_DEMO_ADVANCE",
]);

export const escalationTriggerSourceSchema = z.enum([
  "learner",
  "system",
  "demo",
  "developer",
]);

export const approvedVisualizerTypeSchema = z.enum([
  "none",
  "highlighted_table",
  "consecutive_difference",
  "additive_multiplicative_contrast",
  "slope_intercept_bridge",
  "variable_role_map",
  "arithmetic_check",
  "evidence_comparison",
]);

const visualizerConfigSchema = z.object({
  visualizerType: approvedVisualizerTypeSchema,
  problemId: z.string().min(1),
  rows: z
    .array(
      z.object({
        input: z.number(),
        output: z.number(),
      }),
    )
    .max(6),
  inputLabel: z.string().min(1),
  outputLabel: z.string().min(1),
  claim: z.string().max(160).nullable(),
  predictedValue: z.string().max(80).nullable(),
  observedValue: z.string().max(80).nullable(),
  showOffset: z.boolean(),
  showFinalEquation: z.boolean(),
  caption: z.string().min(1).max(240),
  reducedMotionSummary: z.string().min(1).max(300),
});

export const interventionSelectionSchema = z.object({
  interventionRecordId: z.string().min(1),
  family: interventionFamilySchema,
  level: interventionLevelSchema,
  type: z.string().min(1).max(80),
  title: z.string().min(1).max(120),
  instructionalGoal: z.string().min(1).max(240),
  preservedUnderstanding: z.array(z.string().min(1).max(240)).max(4),
  learnerFacingContent: z.string().min(1).max(500),
  visualizerType: approvedVisualizerTypeSchema,
  visualizerConfig: visualizerConfigSchema,
  revealsPartialAnswer: z.boolean(),
  revealsFullAnswer: z.boolean(),
  escalationAvailable: z.boolean(),
  nextAllowedLevel: interventionLevelSchema.nullable(),
  selectionSource: interventionSelectionSourceSchema,
  selectionReason: z.string().min(1).max(300),
  supportLabel: z.string().min(1).max(80),
  safetyValidation: z.object({
    answerLeakageChecked: z.boolean(),
    passed: z.boolean(),
    notes: z.array(z.string().min(1).max(160)).max(6),
  }),
});

export const interventionEscalationSchema = z.object({
  fromLevel: interventionLevelSchema,
  toLevel: interventionLevelSchema,
  reasonCode: escalationReasonCodeSchema,
  triggerSource: escalationTriggerSourceSchema,
  previousInterventionId: z.string().min(1),
  timestamp: z.string().datetime(),
});

export const supportUsageSummarySchema = z.object({
  interventionCount: z.number().int().min(0),
  highestLevelUsed: z.number().int().min(0).max(8),
  familiesUsed: z.array(interventionFamilySchema),
  visualizerTypesUsed: z.array(approvedVisualizerTypeSchema),
  learnerRequestedHelpCount: z.number().int().min(0),
  systemEscalationCount: z.number().int().min(0),
  replayCount: z.number().int().min(0),
  partialAnswerRevealed: z.boolean(),
  fullAnswerRevealed: z.boolean(),
});

export const adapterOutputSchema = z.object({
  interventionRecordId: z.string().min(1),
  title: z.string().min(1).max(120),
  preservedUnderstanding: z.array(z.string().min(1).max(240)).max(4),
  learnerFacingContent: z.string().min(1).max(500),
  visualCaption: z.string().min(1).max(240),
  adaptationSource: interventionSelectionSourceSchema,
});

export type InterventionLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type InterventionFamily = z.infer<typeof interventionFamilySchema>;
export type InterventionSelection = z.infer<typeof interventionSelectionSchema>;
export type InterventionEscalation = z.infer<
  typeof interventionEscalationSchema
>;
export type SupportUsageSummary = z.infer<typeof supportUsageSummarySchema>;
export type InterventionAdapterOutput = z.infer<typeof adapterOutputSchema>;
export type ApprovedVisualizerType = z.infer<
  typeof approvedVisualizerTypeSchema
>;

export interface InterventionEngineInput {
  sessionPublicId: string;
  problem: ProblemRecord;
  conceptIds: readonly string[];
  verifiedState: VerificationEvaluationOutput | null;
  recommendedFamily: InterventionFamily;
  recommendedStartingLevel: InterventionLevel;
  preservedUnderstanding: readonly string[];
  learnerAttempt: PersistedAttempt;
  previousInterventions: readonly {
    id?: string;
    interventionRecordId: string;
    level: InterventionLevel;
    family: InterventionFamily;
    visualizerType: ApprovedVisualizerType;
    selectionReason: string;
    revealsPartialAnswer: boolean;
    revealsFullAnswer: boolean;
  }[];
  failedRetryCount: number;
  learnerRequestedMoreHelp: boolean;
  datasetLadder: readonly InterventionRecord[];
  misconceptionRecord: MisconceptionRecord | null;
  allowedVisualizerTypes: readonly VisualizerType[];
  maximumPermittedLevel: InterventionLevel;
  promptVersion: typeof interventionAdapterPromptVersion;
}
