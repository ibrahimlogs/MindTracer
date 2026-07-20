import { getProblemById, getRubricById } from "@/data/education";
import { transferEvaluatorPromptVersion } from "@/lib/transfer-engine/schemas";
import type { SessionSnapshot } from "@/lib/session-engine";
import { SessionEngineError } from "@/lib/session-engine";

import type { TransferEvaluationInput } from "./schemas.ts";

export function buildTransferEvaluationInput(
  session: SessionSnapshot,
): TransferEvaluationInput {
  if (!session.report?.delta || !session.transfer?.analysis) {
    throw new SessionEngineError(
      "TRANSFER_NOT_READY",
      "Transfer evaluation requires Reasoning Delta and transfer analysis.",
    );
  }
  const transferProblem = getProblemById(session.transfer.problemId);
  return {
    sourceConceptIds: getProblemById(session.currentProblemId)
      .requiredConceptIds,
    transferProblem,
    initialLearningNeed:
      session.verification?.hypothesisAfter?.safeLearnerSummary
        .verifiedLearningNeed ?? "Verified learning need unavailable.",
    reasoningDelta: session.report.delta,
    supportSummary: session.supportUsage,
    transferAnswer: session.transfer.answer,
    transferExplanation: session.transfer.explanation,
    transferAnalysis: session.transfer.analysis.result,
    helpUsedDuringTransfer: session.transfer.supportUsed,
    transferSupportState: session.transfer.supportState,
    transferRubric: getRubricById(transferProblem.rubricId),
    promptVersion: transferEvaluatorPromptVersion,
  };
}
