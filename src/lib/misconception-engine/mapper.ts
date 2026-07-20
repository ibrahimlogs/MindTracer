import { getMisconceptionsForProblem, getProblemById } from "@/data/education";
import type { ReasoningAnalysisResult } from "@/lib/ai/reasoning";
import type {
  PersistedAttempt,
  SessionSnapshot,
} from "@/lib/session-engine/repository";

import type {
  CandidateRetrievalInput,
  HypothesisRankingInput,
} from "./schemas.ts";
import { misconceptionRankerPromptVersion } from "./schemas.ts";

export function getInitialAttempt(session: SessionSnapshot): PersistedAttempt {
  const attempt = session.attempts.find(
    (candidate) => candidate.attemptType === "initial",
  );
  if (!attempt) {
    throw new Error("Hypothesis ranking requires an initial attempt.");
  }
  return attempt;
}

export function buildCandidateRetrievalInput(
  session: SessionSnapshot,
  analysis: ReasoningAnalysisResult,
): CandidateRetrievalInput {
  const attempt = getInitialAttempt(session);
  const problem = getProblemById(attempt.problemId);
  return {
    sessionPublicId: session.publicId,
    problem,
    attempt,
    analysis,
    candidateRecords: getMisconceptionsForProblem(problem.problemId),
  };
}

export function buildHypothesisRankingInput(
  base: CandidateRetrievalInput,
  retrievedCandidates: HypothesisRankingInput["retrievedCandidates"],
  session: SessionSnapshot,
): HypothesisRankingInput {
  return {
    ...base,
    retrievedCandidates,
    verificationHistory: session.verification ? [session.verification] : [],
    promptVersion: misconceptionRankerPromptVersion,
    allowedCandidateIds: retrievedCandidates.map(
      (candidate) => candidate.candidateId,
    ),
  };
}
