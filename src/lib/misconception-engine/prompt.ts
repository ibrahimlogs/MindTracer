import type { HypothesisRankingInput } from "./schemas.ts";
import { misconceptionRankerPromptVersion } from "./schemas.ts";

export const misconceptionRankerSystemPrompt = `You rank possible misconception hypotheses from a supplied curated candidate set.
You do not diagnose the learner.
You may not create new misconception IDs.
Distinguish evidence supporting a candidate, evidence conflicting with a candidate, and evidence still missing.
When multiple candidates remain plausible, recommend verification.
Do not teach. Do not correct. Do not reveal the correct answer. Do not write a verification question in this step.
Do not infer intelligence, personality, motivation or learning style. Do not punish broken English.
Return only the required structured output.`;

export function buildRankerPrompt(input: HypothesisRankingInput) {
  return JSON.stringify({
    promptVersion: misconceptionRankerPromptVersion,
    task: "Rank only these curated misconception candidates.",
    sessionPublicId: input.sessionPublicId,
    problemId: input.problem.problemId,
    conceptIds: input.problem.requiredConceptIds,
    learnerAttemptSummary: {
      answer: input.attempt.answer,
      explanation: input.attempt.explanation,
      selectedApproach: input.attempt.selectedApproach,
      confidenceProvided: Boolean(input.attempt.confidence),
    },
    structuredReasoningAnalysis: {
      observedClaims: input.analysis.observedClaims,
      relationshipClaimed: input.analysis.relationshipClaimed,
      operationsUsed: input.analysis.operationsUsed,
      evidenceReferenced: input.analysis.evidenceReferenced,
      evidenceIgnored: input.analysis.evidenceIgnored,
      unsupportedClaims: input.analysis.unsupportedClaims,
      contradictionSignals: input.analysis.contradictionSignals,
      answerReasoningAlignment: input.analysis.answerReasoningAlignment,
      explanationQuality: input.analysis.explanationQuality,
      clarificationGoal: input.analysis.clarificationGoal,
    },
    retrievedCandidates: input.retrievedCandidates,
    allowedCandidateIds: input.allowedCandidateIds,
    verificationHistory: input.verificationHistory,
  });
}
