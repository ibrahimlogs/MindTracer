import type { ReasoningDeltaInput, ReasoningDeltaOutput } from "./schemas.ts";

export interface ReasoningDeltaEvaluator {
  evaluate(input: ReasoningDeltaInput): Promise<ReasoningDeltaOutput>;
}

export interface ReasoningComparator {
  compare(input: ReasoningDeltaInput): ReasoningDeltaOutput["dimensions"];
}

export interface RubricEngine {
  validateRubric(input: ReasoningDeltaInput): void;
}
