import { getProblemById, getRubricById } from "@/data/education";
import type { SessionSnapshot } from "@/lib/session-engine";
import { SessionEngineError } from "@/lib/session-engine";

import {
  reasoningDeltaPromptVersion,
  type ReasoningDeltaInput,
} from "./schemas.ts";

export function buildReasoningDeltaInput(
  session: SessionSnapshot,
): ReasoningDeltaInput {
  const initialAttempt = session.attempts.find(
    (attempt) => attempt.attemptType === "initial",
  );
  const retryAttempt = session.attempts.find(
    (attempt) => attempt.attemptType === "retry",
  );
  if (
    !initialAttempt ||
    !retryAttempt ||
    !session.analysis ||
    !session.retryAnalysis
  ) {
    throw new SessionEngineError(
      "INVALID_STATE_TRANSITION",
      "Reasoning Delta requires initial and retry attempts with separate analyses.",
    );
  }
  const problem = getProblemById(session.currentProblemId);
  return {
    sessionPublicId: session.publicId,
    problem,
    conceptIds: problem.requiredConceptIds,
    initialAttempt,
    initialAnalysis: session.analysis.result,
    verifiedLearningNeed:
      session.verification?.hypothesisAfter?.safeLearnerSummary
        .verifiedLearningNeed ?? "Verified learning need was not available.",
    verification: session.verification,
    interventions: session.interventionHistory,
    supportUsage: session.supportUsage,
    retryAttempt,
    retryAnalysis: session.retryAnalysis.result,
    rubric: getRubricById(problem.rubricId),
    promptVersion: reasoningDeltaPromptVersion,
  };
}
