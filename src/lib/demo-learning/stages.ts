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
  problem_presented: "Understand the problem",
  initial_attempt: "Explain your thinking",
  reasoning_analysis: "MindTrace is noticing patterns",
  hypothesis_ready: "Possible explanations",
  verification_required: "Check one small detail",
  verification_submitted: "Check complete",
  intervention_ready: "Ready for a visual clue",
  intervention_shown: "Use the visual clue",
  retry_required: "Try again",
  retry_submitted: "Revised reasoning",
  reasoning_delta: "Review what changed",
  transfer_presented: "Try independently",
  transfer_submitted: "Transfer checked",
  session_complete: "Learning reflection ready",
};

export const timelineStages = [
  { key: "problem_presented", label: "Understand" },
  { key: "initial_attempt", label: "Explain" },
  { key: "reasoning_analysis", label: "Explain" },
  { key: "verification_required", label: "Check" },
  { key: "intervention_shown", label: "Visualize" },
  { key: "retry_required", label: "Try again" },
  { key: "transfer_presented", label: "Transfer" },
  { key: "session_complete", label: "Review" },
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
