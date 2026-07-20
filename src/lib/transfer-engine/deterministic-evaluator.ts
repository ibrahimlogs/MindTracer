import type { TransferEvaluator } from "./evaluator.ts";
import type { TransferEvaluationInput } from "./schemas.ts";
import { validateTransferEvaluationOutput } from "./safety.ts";

function includesAny(text: string, terms: readonly string[]) {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

export class DeterministicTransferEvaluator implements TransferEvaluator {
  async evaluate(input: TransferEvaluationInput) {
    const explanation = input.transferExplanation;
    const answerCorrect =
      input.transferAnswer.trim() === input.transferProblem.correctAnswer;
    const usesTransferValues = includesAny(explanation, [
      "52",
      "55",
      "58",
      "+3",
      "adds 3",
      "increases by 3",
      "goes up by 3",
      "two more hours",
      "new context",
    ]);
    const copiedOldStructure = includesAny(explanation, [
      "sales",
      "advertising",
      "2x + 1",
      "answer is 11",
    ]);
    const conceptApplied = usesTransferValues && !copiedOldStructure;
    const helpUsed =
      input.helpUsedDuringTransfer ||
      input.transferSupportState === "hint_requested" ||
      input.transferSupportState === "supported";
    const transferStatus = answerCorrect
      ? conceptApplied
        ? "successful"
        : "inconclusive"
      : conceptApplied
        ? "partially_successful"
        : "unsuccessful";

    return validateTransferEvaluationOutput({
      answerCorrect,
      conceptApplied,
      evidenceUse: conceptApplied
        ? "strong"
        : answerCorrect
          ? "weak"
          : "missing",
      explanationCompleteness: explanation.trim()
        ? conceptApplied
          ? "complete"
          : "minimal"
        : "absent",
      independenceState: helpUsed
        ? "supported"
        : conceptApplied
          ? "independent"
          : "insufficient_evidence",
      transferStatus,
      copiedStructureRisk: copiedOldStructure
        ? "high"
        : answerCorrect && !conceptApplied
          ? "medium"
          : "low",
      remainingGap:
        transferStatus === "successful"
          ? null
          : "More evidence is needed that the learner used the new context rather than the previous problem structure.",
      learnerFacingSummary:
        transferStatus === "successful"
          ? "You used the same repeated-change idea in a new context without a hint."
          : "MindTrace found some remaining uncertainty in how the idea transferred to the new context.",
      internalNotes: ["Deterministic prototype transfer evaluation."],
    });
  }
}
