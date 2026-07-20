export type JudgeExecutionSource =
  | "live_openai"
  | "deterministic"
  | "cached_demo"
  | "fallback";

export type JudgeDemoMode = "guided" | "interactive";

export type JudgeLearnerKey = "learner-a" | "learner-b" | "both";

export type JudgeSceneKind =
  | "intro"
  | "problem"
  | "learner"
  | "verification"
  | "intervention"
  | "transfer"
  | "delta"
  | "closing";

export interface JudgeDemoProblem {
  title: string;
  table: ReadonlyArray<Readonly<[string, string]>>;
  question: string;
  correctAnswer: string;
}

export interface JudgeDemoScene {
  id: string;
  kind: JudgeSceneKind;
  title: string;
  timeRange: string;
  durationMs: number;
  learner: JudgeLearnerKey;
  source: JudgeExecutionSource;
  narration: string;
  evidence: readonly string[];
  primaryText?: string;
  secondaryText?: string;
}

export interface CachedJudgeResponse {
  id: string;
  learner: Exclude<JudgeLearnerKey, "both">;
  artifact:
    | "reasoning_extraction"
    | "hypotheses"
    | "verification"
    | "intervention"
    | "delta"
    | "transfer";
  source: "cached_demo";
  schemaVersion: "judge-demo-v1";
  reviewedAt: string;
  summary: string;
  safety: {
    prohibitedLanguage: false;
    answerLeakedBeforeIntervention: false;
  };
}
