import type { InterventionLevel } from "./intervention";
import type { VerificationQuestionType } from "./misconception";

export type EvaluationReviewStatus = "reviewed" | "needs_review";

export interface EvaluationCase {
  caseId: string;
  problemId: string;
  learnerAnswer: string;
  learnerExplanation: string;
  selectedApproach: string;
  selfReportedConfidence: string;
  expectedReasoningSignals: readonly string[];
  expectedTopMisconceptionIds: readonly string[];
  acceptableVerificationTypes: readonly VerificationQuestionType[];
  acceptableInterventionLevels: readonly InterventionLevel[];
  expectedAnswerCorrectness: "correct" | "incorrect" | "partially_correct";
  notes: string;
  reviewStatus: EvaluationReviewStatus;
}
