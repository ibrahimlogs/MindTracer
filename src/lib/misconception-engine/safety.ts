import { MisconceptionEngineError } from "./errors.ts";
import type {
  HypothesisRankingOutput,
  VerificationEvaluationOutput,
  VerificationQuestionOutput,
} from "./schemas.ts";
import {
  hypothesisRankingOutputSchema,
  maximumRankedHypotheses,
  verificationEvaluationOutputSchema,
  verificationQuestionOutputSchema,
} from "./schemas.ts";

const prohibitedLearnerLabels = [
  "weak",
  "bad at",
  "not smart",
  "lazy",
  "careless",
  "learning style",
  "you have misconception",
  "diagnosed",
];

function containsProhibitedText(value: string) {
  const lower = value.toLowerCase();
  return prohibitedLearnerLabels.some((label) => lower.includes(label));
}

export function validateRankingOutput(
  output: HypothesisRankingOutput,
  allowedCandidateIds: readonly string[],
  source: HypothesisRankingOutput["rankerSource"] = output.rankerSource,
) {
  const parsed = hypothesisRankingOutputSchema.parse({
    ...output,
    rankerSource: source,
  });
  if (parsed.hypotheses.length > maximumRankedHypotheses) {
    throw new MisconceptionEngineError(
      "INVALID_RANKING_OUTPUT",
      "Ranking returned more than three hypotheses.",
    );
  }
  const seen = new Set<string>();
  for (const hypothesis of parsed.hypotheses) {
    if (!allowedCandidateIds.includes(hypothesis.misconceptionId)) {
      throw new MisconceptionEngineError(
        "UNKNOWN_MISCONCEPTION_ID",
        "Ranking returned an unknown misconception ID.",
        { misconceptionId: hypothesis.misconceptionId },
      );
    }
    if (seen.has(hypothesis.misconceptionId)) {
      throw new MisconceptionEngineError(
        "DUPLICATE_HYPOTHESIS_ID",
        "Ranking returned a duplicate misconception ID.",
        { misconceptionId: hypothesis.misconceptionId },
      );
    }
    seen.add(hypothesis.misconceptionId);
  }
  if (containsProhibitedText(parsed.safeLearnerMessage)) {
    throw new MisconceptionEngineError(
      "INVALID_RANKING_OUTPUT",
      "Ranking output contained prohibited learner-facing wording.",
    );
  }
  return parsed;
}

export function validateVerificationQuestionSafety(
  output: VerificationQuestionOutput,
) {
  const parsed = verificationQuestionOutputSchema.parse(output);
  if (parsed.revealsAnswer) {
    throw new MisconceptionEngineError(
      "INVALID_VERIFICATION_QUESTION",
      "Verification question reveals the final answer.",
    );
  }
  if (parsed.question.length > 300) {
    throw new MisconceptionEngineError(
      "INVALID_VERIFICATION_QUESTION",
      "Verification question is too long.",
    );
  }
  const questionMarks = [...parsed.question].filter(
    (char) => char === "?",
  ).length;
  if (questionMarks > 2) {
    throw new MisconceptionEngineError(
      "INVALID_VERIFICATION_QUESTION",
      "Verification question asks too many independent questions.",
    );
  }
  if (
    containsProhibitedText(parsed.question) ||
    /y\s*=\s*2x\s*\+\s*1/i.test(parsed.question)
  ) {
    throw new MisconceptionEngineError(
      "INVALID_VERIFICATION_QUESTION",
      "Verification question contains prohibited wording or answer leakage.",
    );
  }
  return parsed;
}

export function validateVerificationEvaluationOutput(
  output: VerificationEvaluationOutput,
  allowedTargetIds: readonly string[],
) {
  const parsed = verificationEvaluationOutputSchema.parse(output);
  const ids = [
    ...parsed.supportedHypothesisIds,
    ...parsed.weakenedHypothesisIds,
    ...parsed.rejectedHypothesisIds,
  ];
  for (const id of ids) {
    if (
      !allowedTargetIds.includes(id) &&
      !parsed.remainingHypotheses.some(
        (hypothesis) => hypothesis.misconceptionId === id,
      )
    ) {
      throw new MisconceptionEngineError(
        "UNKNOWN_MISCONCEPTION_ID",
        "Verification output referenced an unknown hypothesis ID.",
        { misconceptionId: id },
      );
    }
  }
  if (
    containsProhibitedText(parsed.safeLearnerSummary.verifiedLearningNeed) ||
    containsProhibitedText(parsed.safeLearnerSummary.nextSystemAction)
  ) {
    throw new MisconceptionEngineError(
      "INVALID_RANKING_OUTPUT",
      "Verification output contained prohibited learner-facing wording.",
    );
  }
  return parsed;
}
