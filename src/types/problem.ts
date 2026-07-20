export type ProblemDifficulty = "foundation" | "beginner" | "intermediate";
export type ProblemAnswerType = "number" | "text" | "equation" | "choice";
export type ProblemStatus = "active" | "experimental" | "archived";
export type ApproachId =
  | "consecutive_difference"
  | "pattern_extension"
  | "linear_equation"
  | "multiplication_rule"
  | "addition_rule"
  | "ratio_check"
  | "substitution"
  | "estimation";

export type DataRepresentation =
  | {
      type: "table";
      columns: readonly [string, string];
      rows: readonly { input: number; output: number }[];
    }
  | { type: "sequence"; label: string; values: readonly number[] }
  | { type: "equation"; equation: string; variables: readonly string[] }
  | { type: "short_context"; text: string }
  | {
      type: "comparison";
      claim: string;
      observed: string;
      predicted: string;
    };

export interface ProblemRecord {
  problemId: string;
  title: string;
  conceptFamilyId: string;
  requiredConceptIds: readonly string[];
  difficulty: ProblemDifficulty;
  context: string;
  dataRepresentation: DataRepresentation;
  question: string;
  answerType: ProblemAnswerType;
  correctAnswer: string;
  acceptedAnswerVariants: readonly string[];
  solutionModel: string;
  validApproaches: readonly ApproachId[];
  reasoningPrompts: readonly string[];
  targetMisconceptionIds: readonly string[];
  verificationContext: string;
  interventionVisualizerConfig: {
    visualizerType: string;
    focus: string;
  };
  transferProblemIds: readonly string[];
  rubricId: string;
  tags: readonly string[];
  status: ProblemStatus;
}
