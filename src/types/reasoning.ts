export type ReasoningStage =
  | "problem"
  | "hypothesis"
  | "verification"
  | "intervention"
  | "transfer"
  | "report";

export interface SessionReference {
  id: string;
  stage: ReasoningStage;
}
