import type { SessionStage } from "@/lib/session-engine/stages";

export const allowedTransitions = {
  problem_presented: ["initial_attempt"],
  initial_attempt: ["reasoning_analysis"],
  reasoning_analysis: ["hypothesis_ready"],
  hypothesis_ready: ["verification_required", "intervention_ready"],
  verification_required: ["verification_submitted"],
  verification_submitted: ["verification_required", "intervention_ready"],
  intervention_ready: ["intervention_shown"],
  intervention_shown: ["retry_required"],
  retry_required: ["retry_submitted"],
  retry_submitted: ["reasoning_delta"],
  reasoning_delta: ["transfer_presented"],
  transfer_presented: ["transfer_submitted"],
  transfer_submitted: ["session_complete"],
  session_complete: [],
} as const satisfies Record<SessionStage, readonly SessionStage[]>;

export function canTransitionSession(from: SessionStage, to: SessionStage) {
  return (allowedTransitions[from] as readonly SessionStage[]).includes(to);
}

export function assertTransition(from: SessionStage, to: SessionStage) {
  if (!canTransitionSession(from, to)) {
    throw new Error(`The session cannot move from ${from} to ${to}.`);
  }
}
