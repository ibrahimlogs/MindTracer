import { getProblemById } from "@/data/education";
import { reasoningPromptVersion } from "@/lib/ai/reasoning/schema";
import type { ReasoningAnalysisInput } from "@/lib/ai/reasoning/schema";
import type {
  PersistedAttempt,
  SessionSnapshot,
} from "@/lib/session-engine/repository";

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase();
}

function calculateAnswerStatus(answer: string, correctAnswer: unknown) {
  const trimmed = answer.trim();
  if (!trimmed) return "empty" as const;
  if (typeof correctAnswer === "number") {
    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) return "unparseable" as const;
    return parsed === correctAnswer
      ? ("correct" as const)
      : ("incorrect" as const);
  }
  if (typeof correctAnswer === "string") {
    return normalizeAnswer(trimmed) === normalizeAnswer(correctAnswer)
      ? ("correct" as const)
      : ("incorrect" as const);
  }
  return "unparseable" as const;
}

export function buildReasoningAnalysisInput(
  session: SessionSnapshot,
  attempt: PersistedAttempt,
  requestId: string,
): ReasoningAnalysisInput {
  const problem = getProblemById(attempt.problemId);
  const correctAnswer = problem.correctAnswer;
  const learnerAnswer = attempt.answer.slice(0, 500);
  const learnerExplanation = attempt.explanation.slice(0, 2000);

  return {
    analysisId: requestId,
    sessionPublicId: session.publicId,
    problemId: problem.problemId,
    conceptIds: [...problem.requiredConceptIds],
    problemContext: problem.context,
    dataRepresentation: problem.dataRepresentation,
    question: problem.question,
    expectedAnswerType: problem.answerType,
    answerStatus: calculateAnswerStatus(learnerAnswer, correctAnswer),
    answerCanBeParsed:
      learnerAnswer.trim().length > 0 &&
      (problem.answerType !== "number" ||
        !Number.isNaN(Number(learnerAnswer.trim()))),
    explanationIsEmpty: learnerExplanation.trim().length === 0,
    solutionModelConcepts: [problem.solutionModel],
    learnerAnswer,
    learnerExplanation,
    selectedApproach: attempt.selectedApproach,
    selfReportedConfidence: attempt.confidence,
    attemptType: attempt.attemptType,
    allowedOperations: [
      "addition",
      "subtraction",
      "multiplication",
      "division",
      "comparison",
      "pattern_extension",
      "substitution",
      "equation_formation",
      "estimation",
      "counting_steps",
      "none",
      "unclear",
    ],
    promptVersion: reasoningPromptVersion,
  };
}
