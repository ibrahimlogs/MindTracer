export type LearningStage =
  | "problem_presented"
  | "initial_attempt"
  | "reasoning_analysis"
  | "hypothesis_ready"
  | "verification_required"
  | "verification_submitted"
  | "intervention_ready"
  | "intervention_shown"
  | "retry_required"
  | "retry_submitted"
  | "reasoning_delta"
  | "transfer_presented"
  | "transfer_submitted"
  | "session_complete";

export type DemoMode = "compare" | "learner" | "pipeline";
export type LearnerId = "learner-a" | "learner-b";
export type DemoSpeed = "slow" | "normal" | "fast";

export interface DemoProblem {
  problemId: string;
  context: string;
  columns: readonly [string, string];
  rows: readonly { input: number; output: number }[];
  question: string;
  correctAnswer: string;
  rubricId: string;
  targetMisconceptionIds: readonly string[];
  transferProblemIds: readonly string[];
  interventionVisualizerConfig: {
    visualizerType: string;
    focus: string;
  };
}

export interface MockHypothesis {
  id: string;
  label: string;
  description: string;
}

export interface MockReasoningAnalysis {
  evidence: readonly string[];
  interpretation: readonly string[];
}

export interface MockVerification {
  question: string;
  response: string;
  focus: string;
}

export interface MockIntervention {
  title: string;
  summary: string;
  steps: readonly string[];
  bridge: string;
}

export interface MockReasoningDelta {
  before: string;
  conflict?: string;
  after: string;
}

export interface MockTransferResult {
  problemId: string;
  context: string;
  columns: readonly [string, string];
  rows: readonly { input: number; output: number }[];
  question: string;
  correctAnswer: string;
  explanation: string;
  rubricId: string;
}

export interface DemoLearner {
  id: LearnerId;
  name: string;
  primaryMisconceptionIds: readonly string[];
  rubricId: string;
  answer: string;
  explanation: string;
  selectedApproach: string;
  confidence: string;
  analysis: MockReasoningAnalysis;
  hypotheses: readonly [MockHypothesis, MockHypothesis];
  verification: MockVerification;
  confirmedLearningNeed: string;
  intervention: MockIntervention;
  revisedAnswer: string;
  revisedExplanation: string;
  reasoningDelta: MockReasoningDelta;
  report: {
    started: string;
    missingOrConflict: string;
    support: string;
    revised: string;
    transfer: string;
    remainingGap: string;
    nextConcept: string;
  };
}
