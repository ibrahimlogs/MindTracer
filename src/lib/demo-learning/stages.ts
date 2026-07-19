import type { LearningStage } from "@/types/demo-learning";

export const learningStages: readonly LearningStage[] = [
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
] as const;

export const stageLabels: Record<LearningStage, string> = {
  problem_presented: "Problem",
  initial_attempt: "Initial attempt",
  reasoning_analysis: "Analysis",
  hypothesis_ready: "Hypotheses",
  verification_required: "Verification",
  verification_submitted: "Evidence",
  intervention_ready: "Intervention",
  intervention_shown: "Bridge",
  retry_required: "Retry",
  retry_submitted: "Revised model",
  reasoning_delta: "Reasoning Delta",
  transfer_presented: "Transfer",
  transfer_submitted: "Transfer evidence",
  session_complete: "Complete",
};

export const timelineStages = [
  { key: "problem_presented", label: "Observe" },
  { key: "initial_attempt", label: "Predict" },
  { key: "reasoning_analysis", label: "Explain" },
  { key: "verification_required", label: "Check" },
  { key: "intervention_shown", label: "Repair" },
  { key: "retry_required", label: "Retry" },
  { key: "transfer_presented", label: "Transfer" },
] as const satisfies readonly { key: LearningStage; label: string }[];

export function getStageIndex(stage: LearningStage) {
  return learningStages.indexOf(stage);
}

export function canTransition(from: LearningStage, to: LearningStage) {
  const fromIndex = getStageIndex(from);
  const toIndex = getStageIndex(to);

  return toIndex >= 0 && Math.abs(toIndex - fromIndex) === 1;
}

export function getNextStage(stage: LearningStage) {
  const nextStage =
    learningStages[
      Math.min(getStageIndex(stage) + 1, learningStages.length - 1)
    ];

  return nextStage ?? stage;
}

export function getPreviousStage(stage: LearningStage) {
  const previousStage = learningStages[Math.max(getStageIndex(stage) - 1, 0)];

  return previousStage ?? stage;
}

export function evaluateTransferAnswer(answer: string) {
  return answer.trim() === "64";
}
