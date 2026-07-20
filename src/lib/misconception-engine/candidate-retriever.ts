import type { CandidateRetrievalInput, RetrievedCandidate } from "./schemas.ts";
import { maximumRetrievedCandidates } from "./schemas.ts";

export interface CandidateRetriever {
  retrieve(input: CandidateRetrievalInput): readonly RetrievedCandidate[];
}

function includesAny(text: string, phrases: readonly string[]) {
  const lower = text.toLowerCase();
  return phrases.some((phrase) => lower.includes(phrase.toLowerCase()));
}

function bandForScore(score: number): RetrievedCandidate["retrievalScoreBand"] {
  if (score >= 5) return "strong";
  if (score >= 3) return "moderate";
  return "weak";
}

function addSignal(collection: string[], condition: boolean, signal: string) {
  if (condition) collection.push(signal);
}

export class DeterministicCandidateRetriever implements CandidateRetriever {
  retrieve(input: CandidateRetrievalInput) {
    const text = [
      input.attempt.answer,
      input.attempt.explanation,
      input.attempt.selectedApproach,
      input.analysis.relationshipClaimed,
      ...input.analysis.operationsUsed,
      ...input.analysis.observedClaims.map((claim) => claim.claim),
      ...input.analysis.unsupportedClaims,
      ...input.analysis.evidenceIgnored.map((item) => item.description),
      input.analysis.clarificationGoal ?? "",
      input.analysis.answerReasoningAlignment,
      input.analysis.explanationQuality,
    ]
      .filter(Boolean)
      .join(" ");

    const candidates = input.candidateRecords.map((record) => {
      const matchedSignals: string[] = [];
      const matchedCounterSignals: string[] = [];
      const sourceReasons: string[] = [];
      let score = input.problem.targetMisconceptionIds.includes(
        record.misconceptionId,
      )
        ? 2
        : 0;

      if (
        input.problem.targetMisconceptionIds.includes(record.misconceptionId)
      ) {
        sourceReasons.push(
          "Problem lists this misconception as an allowed target.",
        );
      }

      for (const conceptId of record.conceptIds) {
        if (input.problem.requiredConceptIds.includes(conceptId)) {
          score += 1;
          sourceReasons.push(`Required concept match: ${conceptId}.`);
          break;
        }
      }

      for (const signal of record.signals) {
        if (
          includesAny(
            text,
            signal.split(/\s+/).filter((word) => word.length > 3),
          )
        ) {
          score += 2;
          matchedSignals.push(signal);
        }
      }

      for (const counterSignal of record.counterSignals) {
        if (
          includesAny(
            text,
            counterSignal.split(/\s+/).filter((word) => word.length > 3),
          )
        ) {
          score -= 1;
          matchedCounterSignals.push(counterSignal);
        }
      }

      addSignal(
        matchedSignals,
        record.misconceptionId === "direction_without_rate" &&
          input.analysis.relationshipClaimed === "constant_difference" &&
          !input.analysis.evidenceReferenced.some(
            (item) => item.evidenceType === "consecutive_change",
          ),
        "Notices increasing values without explicit consecutive-change evidence.",
      );
      addSignal(
        matchedSignals,
        record.misconceptionId === "approximate_pattern_guess" &&
          (input.analysis.operationsUsed.includes("estimation") ||
            input.analysis.explanationQuality === "vague" ||
            input.analysis.explanationQuality === "minimal"),
        "Uses approximate or sparse pattern language.",
      );
      addSignal(
        matchedSignals,
        record.misconceptionId === "additive_as_multiplicative" &&
          input.analysis.relationshipClaimed === "direct_multiplication",
        "Claims a direct multiplication rule.",
      );
      if (
        record.misconceptionId === "additive_as_multiplicative" &&
        input.analysis.relationshipClaimed === "direct_multiplication"
      ) {
        score += 4;
      }
      addSignal(
        matchedSignals,
        record.misconceptionId === "intercept_ignored" &&
          input.analysis.relationshipClaimed === "direct_multiplication",
        "Uses a rate-like rule without accounting for offset evidence.",
      );
      if (
        record.misconceptionId === "intercept_ignored" &&
        input.analysis.relationshipClaimed === "direct_multiplication"
      ) {
        score += 3;
      }
      addSignal(
        matchedSignals,
        record.misconceptionId === "arithmetic_only_error" &&
          input.analysis.answerReasoningAlignment ===
            "incorrect_answer_with_partially_correct_reasoning",
        "Reasoning appears partly correct while the answer is incorrect.",
      );

      score += matchedSignals.length * 2;
      score -= matchedCounterSignals.length;

      return {
        candidateId: record.misconceptionId,
        retrievalScoreBand: bandForScore(score),
        matchedSignals: matchedSignals.slice(0, 8),
        matchedCounterSignals: matchedCounterSignals.slice(0, 8),
        sourceReasons:
          sourceReasons.length > 0
            ? sourceReasons.slice(0, 8)
            : ["Weak lexical or concept-family association."],
        requiresVerification:
          matchedCounterSignals.length > 0 ||
          input.analysis.needsClarification ||
          input.analysis.explanationQuality !== "clear_and_evidenced",
      } satisfies RetrievedCandidate;
    });

    return candidates
      .filter(
        (candidate) =>
          candidate.retrievalScoreBand !== "weak" ||
          input.problem.targetMisconceptionIds.includes(candidate.candidateId),
      )
      .sort((left, right) => {
        const order = { strong: 0, moderate: 1, weak: 2 };
        const bandDifference =
          order[left.retrievalScoreBand] - order[right.retrievalScoreBand];
        if (bandDifference !== 0) return bandDifference;
        const directMultiplicationPriority = (candidate: RetrievedCandidate) =>
          input.analysis.relationshipClaimed === "direct_multiplication" &&
          ["additive_as_multiplicative", "intercept_ignored"].includes(
            candidate.candidateId,
          )
            ? -2
            : 0;
        const directionPriority = (candidate: RetrievedCandidate) =>
          input.analysis.relationshipClaimed === "constant_difference" &&
          ["direction_without_rate", "approximate_pattern_guess"].includes(
            candidate.candidateId,
          )
            ? -1
            : 0;
        return (
          directMultiplicationPriority(left) -
            directMultiplicationPriority(right) ||
          directionPriority(left) - directionPriority(right) ||
          right.matchedSignals.length - left.matchedSignals.length
        );
      })
      .slice(0, maximumRetrievedCandidates);
  }
}
