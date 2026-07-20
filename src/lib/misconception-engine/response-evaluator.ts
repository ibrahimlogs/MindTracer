import type {
  RankedHypothesis,
  VerificationEvaluationOutput,
  VerificationResponseEvaluationInput,
} from "./schemas.ts";
import { maximumAutomaticVerificationQuestions } from "./schemas.ts";
import { validateVerificationEvaluationOutput } from "./safety.ts";

export interface VerificationResponseEvaluator {
  evaluate(
    input: VerificationResponseEvaluationInput,
  ): VerificationEvaluationOutput;
}

function includesAny(text: string, terms: readonly string[]) {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}

function familyFor(
  id: string,
): VerificationEvaluationOutput["recommendedInterventionFamily"] {
  if (id === "direction_without_rate" || id === "approximate_pattern_guess") {
    return "consecutive_difference";
  }
  if (id === "additive_as_multiplicative" || id === "intercept_ignored") {
    return "additive_multiplicative_contrast";
  }
  if (id === "slope_found_intercept_missing") return "slope_intercept_bridge";
  if (id === "x_y_reversed") return "variable_role_check";
  if (id === "arithmetic_only_error") return "arithmetic_check";
  return "evidence_comparison";
}

function strengthen(
  hypotheses: readonly RankedHypothesis[],
  supportedIds: readonly string[],
): RankedHypothesis[] {
  return hypotheses.map((hypothesis, index) => ({
    ...hypothesis,
    rank: index + 1,
    confidenceBand: supportedIds.includes(hypothesis.misconceptionId)
      ? "high"
      : hypothesis.confidenceBand === "high"
        ? "medium"
        : hypothesis.confidenceBand,
    verificationNeeded: false,
  }));
}

export class DeterministicVerificationResponseEvaluator
  implements VerificationResponseEvaluator
{
  evaluate(input: VerificationResponseEvaluationInput) {
    const response = input.learnerResponse.trim();
    const vague =
      response.length < 3 ||
      includesAny(response, ["idk", "not sure", "maybe", "guess"]);
    const mentionsTwo = includesAny(response, ["2", "two", "+2"]);
    const mentionsFourMismatch = includesAny(response, [
      "4",
      "table shows 5",
      "shows 5",
      "doesn't match",
      "does not match",
      "not match",
    ]);
    const selfCorrection = includesAny(response, [
      "but",
      "actually",
      "doesn't match",
      "does not match",
      "i see",
    ]);

    let supportedHypothesisIds: string[] = [];
    let weakenedHypothesisIds: string[] = [];
    let rejectedHypothesisIds: string[] = [];
    let status: VerificationEvaluationOutput["status"] = "uncertain";
    let resolution: VerificationEvaluationOutput["resolution"] = "unresolved";
    let confirmedMisconceptionId: string | null = null;

    if (
      input.targetHypothesisIds.includes("direction_without_rate") &&
      mentionsTwo
    ) {
      supportedHypothesisIds = ["direction_without_rate"];
      weakenedHypothesisIds = ["approximate_pattern_guess"];
      status = "confirmed";
      resolution = "resolved";
      confirmedMisconceptionId = "direction_without_rate";
    } else if (
      input.targetHypothesisIds.some((id) =>
        ["additive_as_multiplicative", "intercept_ignored"].includes(id),
      ) &&
      mentionsFourMismatch
    ) {
      supportedHypothesisIds = input.targetHypothesisIds.filter((id) =>
        ["additive_as_multiplicative", "intercept_ignored"].includes(id),
      );
      weakenedHypothesisIds = input.rankedHypotheses.some(
        (hypothesis) => hypothesis.misconceptionId === "one_row_equation_guess",
      )
        ? ["one_row_equation_guess"]
        : [];
      status = selfCorrection ? "confirmed" : "probable";
      resolution = "resolved";
      confirmedMisconceptionId = supportedHypothesisIds[0] ?? null;
    } else if (
      input.targetHypothesisIds.includes("arithmetic_only_error") &&
      includesAny(response, ["slip", "mistake", "calculation", "arithmetic"])
    ) {
      supportedHypothesisIds = ["arithmetic_only_error"];
      status = "arithmetic_only";
      resolution = "resolved";
      confirmedMisconceptionId = "arithmetic_only_error";
    } else if (vague) {
      status = "uncertain";
      resolution = "unresolved";
    } else if (
      includesAny(response, ["no misconception", "i tested every row"])
    ) {
      status = "not_detected";
      resolution = "partially_resolved";
      rejectedHypothesisIds = [...input.targetHypothesisIds];
    } else {
      status = "probable";
      resolution = "partially_resolved";
      supportedHypothesisIds = input.targetHypothesisIds.slice(0, 1);
      confirmedMisconceptionId = supportedHypothesisIds[0] ?? null;
    }

    const requiresAdditionalVerification =
      resolution === "unresolved" &&
      input.verificationHistoryCount < maximumAutomaticVerificationQuestions;
    const conservativeId =
      confirmedMisconceptionId ??
      input.rankedHypotheses[0]?.misconceptionId ??
      "arithmetic_only_error";

    const output: VerificationEvaluationOutput = {
      status:
        resolution === "unresolved" &&
        input.verificationHistoryCount >= maximumAutomaticVerificationQuestions
          ? "uncertain"
          : status,
      confirmedMisconceptionId,
      remainingHypotheses: strengthen(
        input.rankedHypotheses,
        supportedHypothesisIds,
      ),
      supportedHypothesisIds,
      weakenedHypothesisIds,
      rejectedHypothesisIds,
      resolution:
        resolution === "unresolved" &&
        input.verificationHistoryCount >= maximumAutomaticVerificationQuestions
          ? "unresolved"
          : resolution,
      evidenceSummary:
        response.length > 0
          ? [`Verification response: ${response.slice(0, 160)}`]
          : ["No usable verification evidence was provided."],
      requiresAdditionalVerification,
      additionalVerificationGoal: requiresAdditionalVerification
        ? "Ask one more targeted evidence check."
        : null,
      recommendedInterventionFamily:
        resolution === "unresolved" &&
        input.verificationHistoryCount >= maximumAutomaticVerificationQuestions
          ? "evidence_comparison"
          : familyFor(conservativeId),
      recommendedStartingLevel:
        resolution === "resolved"
          ? 2
          : resolution === "partially_resolved"
            ? 3
            : 1,
      safeLearnerSummary: {
        preservedUnderstanding:
          input.originalReasoningAnalysis.safeLearnerSummary
            .preservedUnderstanding,
        verifiedLearningNeed:
          resolution === "resolved"
            ? "The check identified which small support path fits this reasoning."
            : "The check did not fully settle the distinction yet.",
        nextSystemAction:
          resolution === "unresolved"
            ? "MindTrace will choose a conservative support path."
            : "MindTrace will now prepare the smallest useful support.",
      },
    };

    return validateVerificationEvaluationOutput(
      output,
      input.targetHypothesisIds,
    );
  }
}
