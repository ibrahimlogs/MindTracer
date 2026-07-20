import type {
  HypothesisRankingOutput,
  RankedHypothesis,
  VerificationDecision,
} from "./schemas.ts";

export interface VerificationPolicy {
  decide(input: {
    ranking: HypothesisRankingOutput;
    answerReasoningAlignment: string;
    explanationQuality: string;
    needsClarification: boolean;
    verificationHistoryCount: number;
  }): VerificationDecision;
}

function meaningfulSupport(hypothesis: RankedHypothesis) {
  return (
    hypothesis.confidenceBand === "high" ||
    hypothesis.confidenceBand === "medium"
  );
}

export class DeterministicVerificationPolicy implements VerificationPolicy {
  decide(input: {
    ranking: HypothesisRankingOutput;
    answerReasoningAlignment: string;
    explanationQuality: string;
    needsClarification: boolean;
    verificationHistoryCount: number;
  }): VerificationDecision {
    const hypotheses = input.ranking.hypotheses;
    const targetHypothesisIds = hypotheses
      .filter(meaningfulSupport)
      .slice(0, 2)
      .map((hypothesis) => hypothesis.misconceptionId);
    const top = hypotheses[0];

    if (hypotheses.length === 0) {
      return {
        required: false,
        reasonCode: "NO_MEANINGFUL_HYPOTHESIS",
        reason: "No curated misconception has meaningful support.",
        targetHypothesisIds: [],
        verificationGoal: "No verification check is needed.",
        riskIfSkipped: "low",
      };
    }

    if (!top) {
      return {
        required: false,
        reasonCode: "NO_MEANINGFUL_HYPOTHESIS",
        reason: "No curated misconception has meaningful support.",
        targetHypothesisIds: [],
        verificationGoal: "No verification check is needed.",
        riskIfSkipped: "low",
      };
    }

    if (hypotheses.filter(meaningfulSupport).length > 1) {
      return {
        required: true,
        reasonCode: "COMPETING_HYPOTHESES",
        reason: "More than one curated explanation remains plausible.",
        targetHypothesisIds,
        verificationGoal: top.verificationGoal,
        riskIfSkipped: "medium",
      };
    }

    if (!top || top.confidenceBand !== "high") {
      return {
        required: true,
        reasonCode: "MEDIUM_OR_LOW_CONFIDENCE",
        reason: "The top hypothesis is not strongly supported yet.",
        targetHypothesisIds,
        verificationGoal:
          top?.verificationGoal ?? "Clarify the learner's rule.",
        riskIfSkipped: "medium",
      };
    }

    if (input.needsClarification) {
      return {
        required: true,
        reasonCode: "ANALYSIS_NEEDS_CLARIFICATION",
        reason: "The structured analysis requested one clarifying check.",
        targetHypothesisIds,
        verificationGoal: top.verificationGoal,
        riskIfSkipped: "medium",
      };
    }

    if (input.answerReasoningAlignment === "answer_and_reasoning_conflict") {
      return {
        required: true,
        reasonCode: "ANSWER_REASONING_CONFLICT",
        reason: "The answer and explanation point in different directions.",
        targetHypothesisIds,
        verificationGoal:
          "Separate arithmetic evidence from conceptual evidence.",
        riskIfSkipped: "high",
      };
    }

    if (top.conflictingEvidence.length > 0) {
      return {
        required: true,
        reasonCode: "COUNTERSIGNAL_PRESENT",
        reason: "The top hypothesis has matched counter-evidence.",
        targetHypothesisIds,
        verificationGoal: top.verificationGoal,
        riskIfSkipped: "medium",
      };
    }

    if (
      input.answerReasoningAlignment ===
      "incorrect_answer_with_partially_correct_reasoning"
    ) {
      return {
        required: true,
        reasonCode: "ARITHMETIC_VS_CONCEPTUAL_UNCLEAR",
        reason:
          "The system must distinguish arithmetic-only error from conceptual support.",
        targetHypothesisIds,
        verificationGoal:
          "Check whether the method or arithmetic caused the mismatch.",
        riskIfSkipped: "medium",
      };
    }

    return {
      required: false,
      reasonCode: "VERIFICATION_NOT_NEEDED",
      reason:
        "One low-risk hypothesis is strongly supported by current evidence.",
      targetHypothesisIds: [top.misconceptionId],
      verificationGoal: top.verificationGoal,
      riskIfSkipped: "low",
    };
  }
}
