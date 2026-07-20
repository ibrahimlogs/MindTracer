import type { InterventionRecord } from "./intervention";

export type MisconceptionSeverity = "low" | "medium" | "high";
export type MisconceptionStatus = "active" | "experimental" | "archived";

export type VerificationQuestionType =
  | "counterexample_check"
  | "consecutive_comparison"
  | "rule_test"
  | "evidence_selection"
  | "explanation_check"
  | "variable_role_check"
  | "arithmetic_check"
  | "prediction_check";

export type VerificationAnswerFormat =
  | "number"
  | "short_text"
  | "choice"
  | "yes_no_with_reason";

export interface VerificationQuestionTemplate {
  templateId: string;
  misconceptionId: string;
  type: VerificationQuestionType;
  goal: string;
  promptTemplate: string;
  expectedEvidence: string;
  disconfirmingEvidence: string;
  answerFormat: VerificationAnswerFormat;
  difficulty: "foundation" | "beginner" | "intermediate";
  revealsAnswer: boolean;
  reusableAcrossProblems: boolean;
}

export interface MisconceptionRecord {
  misconceptionId: string;
  conceptIds: readonly string[];
  title: string;
  shortDescription: string;
  fullDescription: string;
  signals: readonly string[];
  counterSignals: readonly string[];
  possibleAlternativeExplanations: readonly string[];
  verificationQuestionTemplates: readonly VerificationQuestionTemplate[];
  interventionLadder: readonly InterventionRecord[];
  escalationRules: readonly string[];
  allowedNextActions: readonly string[];
  severity: MisconceptionSeverity;
  status: MisconceptionStatus;
}
