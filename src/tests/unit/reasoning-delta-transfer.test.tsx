import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DeltaOverview } from "@/components/reasoning-delta";
import { getProblemById, getRubricById } from "@/data/education";
import { DeterministicReasoningAnalyzer } from "@/lib/ai/reasoning";
import {
  DeterministicReasoningDeltaEvaluator,
  reasoningDeltaPromptVersion,
  validateReasoningDeltaOutput,
  type ReasoningDeltaInput,
} from "@/lib/reasoning-delta";
import {
  CuratedTransferProblemSelector,
  DeterministicSupportFadingPolicy,
  DeterministicTransferEvaluator,
  transferEvaluatorPromptVersion,
  validateTransferEvaluationOutput,
} from "@/lib/transfer-engine";
import type { SessionSnapshot } from "@/lib/session-engine";

function attempt(
  answer: string,
  explanation: string,
  attemptType: "initial" | "retry",
) {
  return {
    id: `${attemptType}-attempt`,
    problemId: "ads_sales_001",
    attemptType,
    answer,
    explanation,
    confidence: "Somewhat confident",
    submissionKey: `${attemptType}-submission`,
    createdAt: new Date().toISOString(),
  };
}

async function analyze(item: ReturnType<typeof attempt>) {
  const problem = getProblemById(item.problemId);
  return (
    await new DeterministicReasoningAnalyzer().analyze({
      analysisId: `${item.attemptType}-analysis`,
      sessionPublicId: "session",
      problemId: problem.problemId,
      conceptIds: [...problem.requiredConceptIds],
      problemContext: problem.context,
      dataRepresentation: problem.dataRepresentation,
      question: problem.question,
      expectedAnswerType: problem.answerType,
      answerStatus:
        item.answer === problem.correctAnswer ? "correct" : "incorrect",
      answerCanBeParsed: true,
      explanationIsEmpty: item.explanation.length === 0,
      solutionModelConcepts: [problem.solutionModel],
      learnerAnswer: item.answer,
      learnerExplanation: item.explanation,
      selfReportedConfidence: item.confidence,
      attemptType: item.attemptType,
      allowedOperations: [
        "addition",
        "pattern_extension",
        "comparison",
        "unclear",
      ],
      promptVersion: "reasoning-extractor-v1",
    })
  ).result;
}

async function deltaInput(
  retryExplanation = "Advertising increases by 1 while sales increases by 2, so two more steps makes 11.",
): Promise<ReasoningDeltaInput> {
  const problem = getProblemById("ads_sales_001");
  const initialAttempt = attempt(
    "10",
    "The values keep increasing.",
    "initial",
  );
  const retryAttempt = attempt("11", retryExplanation, "retry");
  return {
    sessionPublicId: "session",
    problem,
    conceptIds: problem.requiredConceptIds,
    initialAttempt,
    initialAnalysis: await analyze(initialAttempt),
    verifiedLearningNeed: "Use the repeated change.",
    verification: null,
    interventions: [],
    supportUsage: {
      interventionCount: 1,
      highestLevelUsed: 3,
      familiesUsed: ["consecutive_difference"],
      visualizerTypesUsed: ["consecutive_difference"],
      learnerRequestedHelpCount: 0,
      systemEscalationCount: 0,
      replayCount: 0,
      partialAnswerRevealed: true,
      fullAnswerRevealed: false,
    },
    retryAttempt,
    retryAnalysis: await analyze(retryAttempt),
    rubric: getRubricById(problem.rubricId),
    promptVersion: reasoningDeltaPromptVersion,
  };
}

describe("reasoning delta and transfer engines", () => {
  it("creates learner A transfer-ready delta with visible remaining gap", async () => {
    const output = await new DeterministicReasoningDeltaEvaluator().evaluate(
      await deltaInput(),
    );
    expect(output.transferReady).toBe(true);
    expect(output.dimensions).toHaveLength(8);
    expect(output.remainingGaps.join(" ")).toContain("Formal representation");
  });

  it("rejects fake percentages in Delta output", async () => {
    const output = await new DeterministicReasoningDeltaEvaluator().evaluate(
      await deltaInput(),
    );
    expect(() =>
      validateReasoningDeltaOutput({
        ...output,
        learnerFacingSummary: "You have 90% mastery.",
      }),
    ).toThrow();
  });

  it("reduces independence for full-answer support", async () => {
    const input = await deltaInput();
    const output = await new DeterministicReasoningDeltaEvaluator().evaluate({
      ...input,
      supportUsage: {
        ...input.supportUsage,
        highestLevelUsed: 8,
        fullAnswerRevealed: true,
      },
    });
    expect(
      output.dimensions.find((item) => item.dimensionId === "independence")
        ?.afterState,
    ).toBe("developing");
  });

  it("selects curated transfer and applies independent support fading", () => {
    const snapshot = {
      currentProblemId: "ads_sales_001",
      transfer: null,
    } as SessionSnapshot;
    const selection = new CuratedTransferProblemSelector().select(snapshot);
    expect(selection.problemId).toBe("study_score_001");
    expect(new DeterministicSupportFadingPolicy().initialState()).toBe(
      "independent",
    );
  });

  it("distinguishes successful transfer from correct guessing", async () => {
    const transferProblem = getProblemById("study_score_001");
    const base = {
      sourceConceptIds: ["constant_difference"],
      transferProblem,
      initialLearningNeed: "Use repeated change.",
      reasoningDelta: await new DeterministicReasoningDeltaEvaluator().evaluate(
        await deltaInput(),
      ),
      supportSummary: (await deltaInput()).supportUsage,
      transferAnalysis: await analyze(
        attempt(
          "64",
          "It adds 3 each hour, so two more hours adds 6.",
          "retry",
        ),
      ),
      helpUsedDuringTransfer: false,
      transferSupportState: "independent" as const,
      transferRubric: getRubricById(transferProblem.rubricId),
      promptVersion: transferEvaluatorPromptVersion as "transfer-evaluator-v1",
    };
    const success = await new DeterministicTransferEvaluator().evaluate({
      ...base,
      transferAnswer: "64",
      transferExplanation:
        "It adds 3 each hour, so from 58 two more hours adds 6.",
    });
    const guess = await new DeterministicTransferEvaluator().evaluate({
      ...base,
      transferAnswer: "64",
      transferExplanation: "I guessed.",
    });
    expect(success.transferStatus).toBe("successful");
    expect(guess.transferStatus).toBe("inconclusive");
  });

  it("rejects unsupported successful transfer", () => {
    expect(() =>
      validateTransferEvaluationOutput({
        answerCorrect: true,
        conceptApplied: false,
        evidenceUse: "weak",
        explanationCompleteness: "minimal",
        independenceState: "insufficient_evidence",
        transferStatus: "successful",
        copiedStructureRisk: "medium",
        remainingGap: null,
        learnerFacingSummary: "Looks successful.",
        internalNotes: [],
      }),
    ).toThrow();
  });

  it("renders before, after, support and hides transfer evidence before completion", async () => {
    const delta = await new DeterministicReasoningDeltaEvaluator().evaluate(
      await deltaInput(),
    );
    render(
      <DeltaOverview
        report={{
          delta,
          startingMentalModel: "The values keep increasing.",
          preservedUnderstanding: delta.preservedUnderstanding,
          hypothesesConsidered: ["direction_without_rate"],
          verificationEvidence: "Sales increases by 2.",
          verifiedLearningNeed: "Use repeated change.",
          interventionFamily: "consecutive_difference",
          interventionLevel: 3,
          revisedMentalModel: "Use +2 twice.",
          transferChallenge: null,
          transferOutcome: null,
          supportUsed: (await deltaInput()).supportUsage,
          nextConcept: "Linear rate of change",
          learnerFacingSummary: delta.learnerFacingSummary,
          remainingGaps: delta.remainingGaps,
          createdAt: new Date().toISOString(),
        }}
      />,
    );
    expect(screen.getByText("Before mental model")).toBeVisible();
    expect(screen.getByText("Support used")).toBeVisible();
    expect(screen.getByText(/Transfer evidence appears after/)).toBeVisible();
    expect(screen.queryByText(/%/)).toBeNull();
  });
});
