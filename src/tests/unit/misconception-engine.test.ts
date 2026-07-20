import { describe, expect, it } from "vitest";

import { getMisconceptionsForProblem, getProblemById } from "@/data/education";
import {
  DeterministicReasoningAnalyzer,
  reasoningPromptVersion,
} from "@/lib/ai/reasoning";
import {
  buildCandidateRetrievalInput,
  buildHypothesisRankingInput,
  DeterministicCandidateRetriever,
  DeterministicMisconceptionRanker,
  DeterministicVerificationPolicy,
  DeterministicVerificationQuestionSelector,
  DeterministicVerificationResponseEvaluator,
  maximumAutomaticVerificationQuestions,
  validateRankingOutput,
  validateVerificationEvaluationOutput,
  validateVerificationQuestionSafety,
  verificationEvaluatorPromptVersion,
  misconceptionRankerPromptVersion,
  type HypothesisRankingOutput,
} from "@/lib/misconception-engine";
import type {
  PersistedAttempt,
  SessionSnapshot,
} from "@/lib/session-engine/repository";

function createAttempt(overrides: Partial<PersistedAttempt>): PersistedAttempt {
  return {
    id: "attempt-test",
    problemId: "ads_sales_001",
    attemptType: "initial",
    answer: "10",
    explanation:
      "The values keep increasing, so sales should probably reach around 10.",
    selectedApproach: "pattern_extension",
    confidence: "Unsure",
    submissionKey: "submission-test",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function createSession(attempt: PersistedAttempt): SessionSnapshot {
  return {
    sessionId: "session-internal",
    publicId: "mt_test",
    mode: "pipeline",
    currentProblemId: attempt.problemId,
    currentLearnerKey: "learner-a",
    currentStage: "hypothesis_ready",
    status: "active",
    educationalDataVersion: "step-04-prototype-v1",
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    fallbackMode: true,
    completedStages: [],
    attempts: [attempt],
    analysis: null,
    hypotheses: null,
    verification: null,
    intervention: null,
    transfer: null,
    report: null,
    events: [],
  };
}

async function analyzeAttempt(attempt: PersistedAttempt) {
  const problem = getProblemById(attempt.problemId);
  const output = await new DeterministicReasoningAnalyzer().analyze({
    analysisId: "analysis-test",
    sessionPublicId: "mt_test",
    problemId: problem.problemId,
    conceptIds: [...problem.requiredConceptIds],
    problemContext: problem.context,
    dataRepresentation: problem.dataRepresentation,
    question: problem.question,
    expectedAnswerType: problem.answerType,
    answerStatus:
      attempt.answer === problem.correctAnswer ? "correct" : "incorrect",
    answerCanBeParsed: true,
    explanationIsEmpty: attempt.explanation.trim().length === 0,
    solutionModelConcepts: [problem.solutionModel],
    learnerAnswer: attempt.answer,
    learnerExplanation: attempt.explanation,
    selectedApproach: attempt.selectedApproach,
    selfReportedConfidence: attempt.confidence,
    attemptType: "initial",
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
  });
  return output.result;
}

async function rankFor(attempt: PersistedAttempt) {
  const session = createSession(attempt);
  const analysis = await analyzeAttempt(attempt);
  const retrievalInput = buildCandidateRetrievalInput(session, analysis);
  const retrieved = new DeterministicCandidateRetriever().retrieve(
    retrievalInput,
  );
  const rankingInput = buildHypothesisRankingInput(
    retrievalInput,
    retrieved,
    session,
  );
  const ranking = await new DeterministicMisconceptionRanker().rank(
    rankingInput,
  );
  return { session, analysis, retrievalInput, retrieved, ranking };
}

describe("misconception verification engine", () => {
  it("uses versioned prompts for ranking and verification evaluation", () => {
    expect(misconceptionRankerPromptVersion).toBe("misconception-ranker-v1");
    expect(verificationEvaluatorPromptVersion).toBe(
      "verification-evaluator-v1",
    );
  });

  it("retrieves at most six deterministic curated candidates", async () => {
    const { retrieved } = await rankFor(createAttempt({}));
    expect(retrieved.length).toBeLessThanOrEqual(6);
    expect(retrieved.map((candidate) => candidate.candidateId)).toContain(
      "direction_without_rate",
    );
  });

  it("retrieves Learner A candidates without diagnosing immediately", async () => {
    const { retrieved, ranking } = await rankFor(createAttempt({}));
    expect(
      retrieved.slice(0, 3).map((candidate) => candidate.candidateId),
    ).toEqual(
      expect.arrayContaining([
        "direction_without_rate",
        "approximate_pattern_guess",
      ]),
    );
    expect(ranking.safeLearnerMessage).toContain("possible");
  });

  it("retrieves Learner B candidates from multiplication reasoning", async () => {
    const { retrieved } = await rankFor(
      createAttempt({
        explanation:
          "Sales appears to be double the advertising cost, so 5 times 2 is 10.",
        selectedApproach: "multiplication_rule",
        confidence: "Somewhat confident",
      }),
    );
    expect(
      retrieved.slice(0, 3).map((candidate) => candidate.candidateId),
    ).toEqual(
      expect.arrayContaining([
        "additive_as_multiplicative",
        "intercept_ignored",
      ]),
    );
  });

  it("ranks only allowed IDs and no more than three hypotheses", async () => {
    const { retrieved, ranking } = await rankFor(createAttempt({}));
    const allowed = retrieved.map((candidate) => candidate.candidateId);
    expect(ranking.hypotheses.length).toBeLessThanOrEqual(3);
    expect(
      ranking.hypotheses.every((hypothesis) =>
        allowed.includes(hypothesis.misconceptionId),
      ),
    ).toBe(true);
  });

  it("rejects unknown and duplicate hypothesis IDs", async () => {
    const { ranking, retrieved } = await rankFor(createAttempt({}));
    const allowed = retrieved.map((candidate) => candidate.candidateId);
    expect(() =>
      validateRankingOutput(
        {
          ...ranking,
          hypotheses: [
            { ...ranking.hypotheses[0]!, misconceptionId: "unknown_id" },
          ],
        },
        allowed,
      ),
    ).toThrow();
    expect(() =>
      validateRankingOutput(
        {
          ...ranking,
          hypotheses: [
            ranking.hypotheses[0]!,
            { ...ranking.hypotheses[0]!, rank: 2 },
          ],
        },
        allowed,
      ),
    ).toThrow();
  });

  it("preserves supporting and conflicting evidence arrays", async () => {
    const { ranking } = await rankFor(createAttempt({}));
    expect(ranking.hypotheses[0]?.supportingEvidence.length).toBeGreaterThan(0);
    expect(Array.isArray(ranking.hypotheses[0]?.conflictingEvidence)).toBe(
      true,
    );
  });

  it("requires verification for competing hypotheses and weak reasoning", async () => {
    const { ranking, analysis } = await rankFor(createAttempt({}));
    const decision = new DeterministicVerificationPolicy().decide({
      ranking,
      answerReasoningAlignment: analysis.answerReasoningAlignment,
      explanationQuality: analysis.explanationQuality,
      needsClarification: analysis.needsClarification,
      verificationHistoryCount: 0,
    });
    expect(decision.required).toBe(true);
    expect(decision.reasonCode).toBe("COMPETING_HYPOTHESES");
  });

  it("can skip verification for a single strong low-risk hypothesis", () => {
    const ranking: HypothesisRankingOutput = {
      hypotheses: [
        {
          misconceptionId: "arithmetic_only_error",
          rank: 1,
          confidenceBand: "high",
          supportingEvidence: ["Method evidence is complete."],
          conflictingEvidence: [],
          unresolvedDistinctions: ["No major distinction remains."],
          verificationNeeded: false,
          verificationGoal: "No check needed.",
        },
      ],
      overallUncertainty: "low",
      verificationRecommended: false,
      verificationReason: "Low-risk arithmetic support.",
      safeLearnerMessage:
        "MindTrace has enough evidence for a small arithmetic check.",
      rankerSource: "deterministic",
      fallbackErrorCategory: null,
    };
    const decision = new DeterministicVerificationPolicy().decide({
      ranking,
      answerReasoningAlignment: "correct_answer_supported_by_reasoning",
      explanationQuality: "clear_and_evidenced",
      needsClarification: false,
      verificationHistoryCount: 0,
    });
    expect(decision.required).toBe(false);
  });

  it("selects different safe questions for Learner A and Learner B", async () => {
    const learnerA = await rankFor(createAttempt({}));
    const learnerB = await rankFor(
      createAttempt({
        explanation:
          "Sales appears to be double the advertising cost, so 5 times 2 is 10.",
        selectedApproach: "multiplication_rule",
      }),
    );
    const selector = new DeterministicVerificationQuestionSelector();
    const questionA = selector.select({
      problem: learnerA.retrievalInput.problem,
      ranking: learnerA.ranking,
      decision: new DeterministicVerificationPolicy().decide({
        ranking: learnerA.ranking,
        answerReasoningAlignment: learnerA.analysis.answerReasoningAlignment,
        explanationQuality: learnerA.analysis.explanationQuality,
        needsClarification: learnerA.analysis.needsClarification,
        verificationHistoryCount: 0,
      }),
      candidateRecords: learnerA.retrievalInput.candidateRecords,
      verificationHistoryCount: 0,
    });
    const questionB = selector.select({
      problem: learnerB.retrievalInput.problem,
      ranking: learnerB.ranking,
      decision: new DeterministicVerificationPolicy().decide({
        ranking: learnerB.ranking,
        answerReasoningAlignment: learnerB.analysis.answerReasoningAlignment,
        explanationQuality: learnerB.analysis.explanationQuality,
        needsClarification: learnerB.analysis.needsClarification,
        verificationHistoryCount: 0,
      }),
      candidateRecords: learnerB.retrievalInput.candidateRecords,
      verificationHistoryCount: 0,
    });
    expect(questionA.question).toContain("increases from 1 to 2");
    expect(questionB.question).toContain("exactly double");
    expect(questionA.question).not.toBe(questionB.question);
  });

  it("rejects unsafe verification questions", () => {
    expect(() =>
      validateVerificationQuestionSafety({
        templateId: "unsafe",
        question: "The answer is y = 2x + 1, right?",
        answerFormat: "short_text",
        verificationGoal: "Leak answer.",
        targetHypothesisIds: ["direction_without_rate"],
        revealsAnswer: false,
        adaptationSource: "deterministic",
      }),
    ).toThrow();
    expect(() =>
      validateVerificationQuestionSafety({
        templateId: "unsafe-long",
        question: "x".repeat(301),
        answerFormat: "short_text",
        verificationGoal: "Too long.",
        targetHypothesisIds: ["direction_without_rate"],
        revealsAnswer: false,
        adaptationSource: "deterministic",
      }),
    ).toThrow();
  });

  it("evaluates confirmed, probable, uncertain, not_detected and arithmetic_only responses", async () => {
    const { ranking, analysis, retrievalInput } = await rankFor(
      createAttempt({}),
    );
    const evaluator = new DeterministicVerificationResponseEvaluator();
    const base = {
      verificationInteractionId: "verify-test",
      question:
        "When advertising increases from 1 to 2, how much does sales increase?",
      verificationGoal: "Check rate.",
      targetHypothesisIds: ["direction_without_rate"],
      expectedEvidence: "Names +2.",
      disconfirmingEvidence: "Only says increases.",
      originalReasoningAnalysis: analysis,
      rankedHypotheses: ranking.hypotheses,
      problem: retrievalInput.problem,
      answerFormat: "short_text" as const,
      verificationHistoryCount: 1,
    };
    expect(
      evaluator.evaluate({ ...base, learnerResponse: "Sales increases by 2." })
        .status,
    ).toBe("confirmed");
    expect(
      evaluator.evaluate({
        ...base,
        learnerResponse: "I tested every row, no misconception.",
      }).status,
    ).toBe("not_detected");
    expect(evaluator.evaluate({ ...base, learnerResponse: "idk" }).status).toBe(
      "uncertain",
    );
    expect(
      evaluator.evaluate({
        ...base,
        targetHypothesisIds: ["arithmetic_only_error"],
        learnerResponse: "It was an arithmetic slip.",
      }).status,
    ).toBe("arithmetic_only");
    expect(
      evaluator.evaluate({ ...base, learnerResponse: "I used the first row." })
        .status,
    ).toBe("probable");
  });

  it("supports self-correction and verification limits", async () => {
    const { ranking, analysis, retrievalInput } = await rankFor(
      createAttempt({
        explanation:
          "Sales appears to be double the advertising cost, so 5 times 2 is 10.",
        selectedApproach: "multiplication_rule",
      }),
    );
    const evaluator = new DeterministicVerificationResponseEvaluator();
    const selfCorrection = evaluator.evaluate({
      verificationInteractionId: "verify-b",
      question:
        "If sales were exactly double advertising, what should sales be when advertising is 2? Does that match the table?",
      verificationGoal: "Test exact multiplication.",
      targetHypothesisIds: ["additive_as_multiplicative", "intercept_ignored"],
      expectedEvidence: "Finds mismatch.",
      disconfirmingEvidence: "Does not compare.",
      learnerResponse: "It would be 4, but the table shows 5.",
      originalReasoningAnalysis: analysis,
      rankedHypotheses: ranking.hypotheses,
      problem: retrievalInput.problem,
      answerFormat: "yes_no_with_reason",
      verificationHistoryCount: 1,
    });
    expect(selfCorrection.status).toBe("confirmed");
    const limited = evaluator.evaluate({
      ...selfCorrection,
      verificationInteractionId: "verify-limit",
      question: "What evidence did you use?",
      verificationGoal: "One more check.",
      targetHypothesisIds: ["direction_without_rate"],
      expectedEvidence: "Specific evidence.",
      disconfirmingEvidence: "Vague.",
      learnerResponse: "maybe",
      originalReasoningAnalysis: analysis,
      rankedHypotheses: ranking.hypotheses,
      problem: retrievalInput.problem,
      answerFormat: "short_text",
      verificationHistoryCount: maximumAutomaticVerificationQuestions,
    });
    expect(limited.requiresAdditionalVerification).toBe(false);
    expect(limited.recommendedInterventionFamily).toBe("evidence_comparison");
  });

  it("rejects verification output with unknown IDs and prohibited labels", async () => {
    const { ranking, analysis, retrievalInput } = await rankFor(
      createAttempt({}),
    );
    const output = new DeterministicVerificationResponseEvaluator().evaluate({
      verificationInteractionId: "verify-safe",
      question: "What changed?",
      verificationGoal: "Check rate.",
      targetHypothesisIds: ["direction_without_rate"],
      expectedEvidence: "Names +2.",
      disconfirmingEvidence: "Vague.",
      learnerResponse: "Sales increases by 2.",
      originalReasoningAnalysis: analysis,
      rankedHypotheses: ranking.hypotheses,
      problem: retrievalInput.problem,
      answerFormat: "short_text",
      verificationHistoryCount: 1,
    });
    expect(() =>
      validateVerificationEvaluationOutput(
        { ...output, supportedHypothesisIds: ["unknown"] },
        ["direction_without_rate"],
      ),
    ).toThrow();
    expect(() =>
      validateVerificationEvaluationOutput(
        {
          ...output,
          safeLearnerSummary: {
            ...output.safeLearnerSummary,
            verifiedLearningNeed: "You are weak at this.",
          },
        },
        ["direction_without_rate"],
      ),
    ).toThrow();
  });

  it("uses only curated misconception records for the problem", () => {
    const records = getMisconceptionsForProblem("ads_sales_001");
    expect(records.every((record) => record.status === "active")).toBe(true);
  });
});
