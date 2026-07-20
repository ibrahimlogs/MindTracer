import type { LearningStage } from "@/types/demo-learning";

export const sessionStages = [
  "problem_presented",
  "initial_attempt",
  "reasoning_analysis",
  "hypothesis_ready",
  "verification_required",
  "verification_submitted",
  "intervention_ready",
  "intervention_shown",
  "retry_required",
  "retry_submitted",
  "reasoning_delta",
  "transfer_presented",
  "transfer_submitted",
  "session_complete",
] as const satisfies readonly LearningStage[];

export type SessionStage = (typeof sessionStages)[number];
export type SessionMode = "compare" | "learner" | "pipeline" | "judge";
export type SessionStatus = "active" | "completed" | "abandoned" | "expired";
export type AttemptType = "initial" | "retry" | "transfer";

export function isSessionStage(value: string): value is SessionStage {
  return sessionStages.includes(value as SessionStage);
}
