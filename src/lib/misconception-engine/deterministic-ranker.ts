import type { MisconceptionRanker } from "./ranker.ts";
import type {
  HypothesisRankingInput,
  HypothesisRankingOutput,
  RankedHypothesis,
  RetrievedCandidate,
} from "./schemas.ts";
import { misconceptionRankerPromptVersion } from "./schemas.ts";
import { validateRankingOutput } from "./safety.ts";

function confidenceFor(
  candidate: RetrievedCandidate,
): RankedHypothesis["confidenceBand"] {
  if (candidate.retrievalScoreBand === "strong") return "high";
  if (candidate.retrievalScoreBand === "moderate") return "medium";
  return "low";
}

function overallUncertainty(
  hypotheses: readonly RankedHypothesis[],
): HypothesisRankingOutput["overallUncertainty"] {
  if (hypotheses.length === 0) return "insufficient_evidence";
  if (hypotheses.length > 1) return "medium";
  return hypotheses[0]?.confidenceBand === "high" ? "low" : "high";
}

export class DeterministicMisconceptionRanker implements MisconceptionRanker {
  async rank(input: HypothesisRankingInput): Promise<HypothesisRankingOutput> {
    const ranked = input.retrievedCandidates
      .slice(0, 3)
      .map((candidate, index) => {
        const confidenceBand = confidenceFor(candidate);
        return {
          misconceptionId: candidate.candidateId,
          rank: index + 1,
          confidenceBand,
          supportingEvidence: [
            ...candidate.matchedSignals,
            ...input.analysis.observedClaims
              .slice(0, 2)
              .map((claim) => claim.claim),
          ].slice(0, 8),
          conflictingEvidence: candidate.matchedCounterSignals,
          unresolvedDistinctions: [
            input.analysis.clarificationGoal ??
              "One small check is needed before choosing support.",
          ],
          verificationNeeded:
            candidate.requiresVerification || confidenceBand !== "high",
          verificationGoal:
            input.analysis.clarificationGoal ??
            "Check which explanation best matches the learner's reasoning.",
        } satisfies RankedHypothesis;
      });

    const output: HypothesisRankingOutput = {
      hypotheses: ranked,
      overallUncertainty: overallUncertainty(ranked),
      verificationRecommended:
        ranked.length > 1 ||
        ranked.some((hypothesis) => hypothesis.verificationNeeded),
      verificationReason:
        ranked.length > 1
          ? "Multiple curated misconceptions remain plausible from the same first answer."
          : "The current evidence still needs a small check before support is chosen.",
      safeLearnerMessage:
        ranked.length > 1
          ? "I see more than one possible idea behind your answer, so MindTrace will check one small detail."
          : "MindTrace will check one small detail before choosing support.",
      rankerSource: "deterministic",
      fallbackErrorCategory: null,
    };

    return validateRankingOutput(output, input.allowedCandidateIds);
  }
}

export const deterministicRankerMetadata = {
  promptVersion: misconceptionRankerPromptVersion,
};
