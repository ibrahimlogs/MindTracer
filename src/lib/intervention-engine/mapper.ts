import { getMisconceptionById, getProblemById } from "@/data/education";
import type {
  InterventionEngineInput,
  InterventionFamily,
  InterventionLevel,
  SupportUsageSummary,
} from "./schemas.ts";
import { interventionAdapterPromptVersion } from "./schemas.ts";
import type { SessionSnapshot } from "@/lib/session-engine/repository";

function familyMisconceptionId(
  family: InterventionFamily,
  session: SessionSnapshot,
) {
  const confirmed =
    session.verification?.hypothesisAfter?.confirmedMisconceptionId;
  if (confirmed) return confirmed;
  return session.hypotheses?.ranking.hypotheses[0]?.misconceptionId ?? null;
}

export function buildInterventionEngineInput(
  session: SessionSnapshot,
  previousInterventions: InterventionEngineInput["previousInterventions"],
  learnerRequestedMoreHelp = false,
): InterventionEngineInput {
  const attempt = session.attempts.find(
    (item) => item.attemptType === "initial",
  );
  if (!attempt)
    throw new Error("Intervention selection requires an initial attempt.");
  const problem = getProblemById(attempt.problemId);
  const verifiedState = session.verification?.hypothesisAfter ?? null;
  const recommendedFamily =
    verifiedState?.recommendedInterventionFamily ?? "evidence_comparison";
  const misconceptionId = familyMisconceptionId(recommendedFamily, session);
  const misconception = misconceptionId
    ? getMisconceptionById(misconceptionId)
    : null;
  return {
    sessionPublicId: session.publicId,
    problem,
    conceptIds: problem.requiredConceptIds,
    verifiedState,
    recommendedFamily,
    recommendedStartingLevel: Math.min(
      Math.max(verifiedState?.recommendedStartingLevel ?? 2, 1),
      4,
    ) as InterventionLevel,
    preservedUnderstanding:
      verifiedState?.safeLearnerSummary.preservedUnderstanding ??
      session.analysis?.summary.preservedUnderstanding ??
      [],
    learnerAttempt: attempt,
    previousInterventions,
    failedRetryCount: session.attempts.filter(
      (item) => item.attemptType === "retry",
    ).length,
    learnerRequestedMoreHelp,
    datasetLadder: misconception?.interventionLadder ?? [],
    misconceptionRecord: misconception,
    allowedVisualizerTypes: misconception?.interventionLadder.map(
      (record) => record.visualizerType,
    ) ?? ["none"],
    maximumPermittedLevel: learnerRequestedMoreHelp ? 5 : 4,
    promptVersion: interventionAdapterPromptVersion,
  };
}

export function summarizeSupportUsage(
  interventions: InterventionEngineInput["previousInterventions"],
): SupportUsageSummary {
  return {
    interventionCount: interventions.length,
    highestLevelUsed: interventions.reduce(
      (highest, item) => Math.max(highest, item.level),
      0,
    ),
    familiesUsed: [...new Set(interventions.map((item) => item.family))],
    visualizerTypesUsed: [
      ...new Set(interventions.map((item) => item.visualizerType)),
    ],
    learnerRequestedHelpCount: interventions.filter((item) =>
      item.selectionReason.includes("LEARNER_REQUESTED_MORE_HELP"),
    ).length,
    systemEscalationCount: interventions.filter((item) =>
      item.selectionReason.includes("RETRY_UNSUCCESSFUL"),
    ).length,
    replayCount: 0,
    partialAnswerRevealed: interventions.some(
      (item) => item.revealsPartialAnswer,
    ),
    fullAnswerRevealed: interventions.some((item) => item.revealsFullAnswer),
  };
}
