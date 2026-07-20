import type { ReasoningAnalysisResult } from "@/lib/ai/reasoning";

import type { ReasoningComparator } from "./evaluator.ts";
import type {
  ChangeStatus,
  ReasoningDeltaDimension,
  ReasoningDeltaInput,
  RubricDimensionId,
  RubricState,
} from "./schemas.ts";

function includesAny(text: string, terms: readonly string[]) {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

function stateForRelationship(analysis: ReasoningAnalysisResult): RubricState {
  if (analysis.relationshipClaimed === "additive_linear") return "strong";
  if (analysis.relationshipClaimed === "constant_difference")
    return "developing";
  if (analysis.relationshipClaimed === "direct_multiplication")
    return "incorrect";
  if (analysis.relationshipClaimed === "unclear")
    return "insufficient_evidence";
  return "developing";
}

function change(before: RubricState, after: RubricState): ChangeStatus {
  if (before === "insufficient_evidence" || after === "insufficient_evidence") {
    return "insufficient_evidence";
  }
  if (before === after && after === "strong") return "preserved";
  if (before === after) return "unchanged";
  if (before === "incorrect" && ["developing", "strong"].includes(after)) {
    return "corrected";
  }
  if (["missing", "incorrect"].includes(before) && after === "developing") {
    return "improved";
  }
  if (before === "strong" && after !== "strong") return "regressed";
  return "improved";
}

function dimension(
  dimensionId: RubricDimensionId,
  beforeState: RubricState,
  afterState: RubricState,
  beforeEvidence: string,
  afterEvidence: string,
  conciseReason: string,
): ReasoningDeltaDimension {
  return {
    dimensionId,
    beforeState,
    afterState,
    changeStatus: change(beforeState, afterState),
    beforeEvidence,
    afterEvidence,
    conciseReason,
  };
}

export class DeterministicReasoningComparator implements ReasoningComparator {
  compare(input: ReasoningDeltaInput) {
    const beforeText = input.initialAttempt.explanation;
    const afterText = input.retryAttempt.explanation;
    const afterHasConsecutive = includesAny(afterText, [
      "increases by 2",
      "+2",
      "two more steps",
      "changes by 2",
    ]);
    const afterHasEquation = includesAny(afterText, ["2x + 1", "2x+1"]);
    const afterHasEvidence = afterHasConsecutive || afterHasEquation;
    const answerCorrect =
      input.retryAttempt.answer.trim() === input.problem.correctAnswer;
    const highSupport = input.supportUsage.highestLevelUsed >= 8;
    const independenceAfter: RubricState = highSupport
      ? "developing"
      : afterHasEvidence
        ? "strong"
        : "insufficient_evidence";

    return [
      dimension(
        "observation_accuracy",
        input.initialAnalysis.correctObservations.length > 0
          ? "developing"
          : "insufficient_evidence",
        afterHasEvidence ? "strong" : "developing",
        beforeText.slice(0, 180) ||
          "Initial explanation gave limited evidence.",
        afterText.slice(0, 180),
        "The retry uses table values more directly.",
      ),
      dimension(
        "relationship_type",
        stateForRelationship(input.initialAnalysis),
        afterHasEquation
          ? "strong"
          : afterHasConsecutive
            ? "developing"
            : "missing",
        input.initialAnalysis.relationshipClaimed,
        afterHasEquation
          ? "Uses rate and offset."
          : afterHasConsecutive
            ? "Uses repeated difference."
            : "No relationship evidence in retry.",
        "The retry shifts from the verified gap toward the target relationship.",
      ),
      dimension(
        "evidence_use",
        input.initialAnalysis.evidenceReferenced.some(
          (item) => item.supportStrength === "strong",
        )
          ? "strong"
          : "missing",
        afterHasEvidence ? "strong" : "missing",
        "Initial evidence was incomplete or untested.",
        afterText.slice(0, 180),
        "The retry cites row-to-row or rule evidence.",
      ),
      dimension(
        "rule_formation",
        input.initialAnalysis.reasoningCompleteness === "partial"
          ? "developing"
          : "missing",
        answerCorrect && afterHasEvidence ? "strong" : "developing",
        input.initialAnalysis.reasoningCompleteness,
        afterText.slice(0, 180),
        "The retry can generate the target value from a repeatable rule.",
      ),
      dimension(
        "formal_representation",
        includesAny(input.initialAttempt.explanation, ["y =", "2x"])
          ? "incorrect"
          : "missing",
        afterHasEquation
          ? "strong"
          : afterHasConsecutive
            ? "developing"
            : "missing",
        "Initial formal notation was absent or unsupported.",
        afterHasEquation ? "Uses y = 2x + 1." : "Uses a verbal rule.",
        "Formal notation is considered separately from conceptual improvement.",
      ),
      dimension(
        "uncertainty_awareness",
        input.initialAnalysis.explanationQuality === "vague"
          ? "developing"
          : "insufficient_evidence",
        afterHasEvidence ? "developing" : "insufficient_evidence",
        input.initialAttempt.confidence ?? "No initial confidence.",
        input.retryAttempt.confidence ?? "No retry confidence.",
        "Confidence alone is not treated as evidence of understanding.",
      ),
      dimension(
        "independence",
        "insufficient_evidence",
        independenceAfter,
        "No retry evidence before support.",
        input.supportUsage.fullAnswerRevealed
          ? "Full answer support limits independence claims."
          : "Retry follows bounded support.",
        "Support level influences independence without labeling the learner.",
      ),
      dimension(
        "remaining_gap",
        "missing",
        afterHasEquation ? "developing" : "strong",
        input.verifiedLearningNeed,
        afterHasEquation
          ? "No major gap detected in this retry."
          : "Formal representation is still developing.",
        "Remaining gaps stay visible even when retry improves.",
      ),
    ];
  }
}
