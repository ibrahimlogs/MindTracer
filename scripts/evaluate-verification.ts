import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { DeterministicReasoningAnalyzer } from "../src/lib/ai/reasoning/deterministic-analyzer.ts";
import {
  reasoningPromptVersion,
  type ReasoningAnalysisInput,
} from "../src/lib/ai/reasoning/schema.ts";
import { DeterministicCandidateRetriever } from "../src/lib/misconception-engine/candidate-retriever.ts";
import { DeterministicMisconceptionRanker } from "../src/lib/misconception-engine/deterministic-ranker.ts";
import { DeterministicVerificationQuestionSelector } from "../src/lib/misconception-engine/question-selector.ts";
import { DeterministicVerificationResponseEvaluator } from "../src/lib/misconception-engine/response-evaluator.ts";
import {
  misconceptionRankerPromptVersion,
  type CandidateRetrievalInput,
  type HypothesisRankingInput,
} from "../src/lib/misconception-engine/schemas.ts";
import { DeterministicVerificationPolicy } from "../src/lib/misconception-engine/verification-policy.ts";
import type {
  EvaluationCase,
  MisconceptionRecord,
  ProblemRecord,
} from "../src/types/education.ts";
import type { PersistedAttempt } from "../src/lib/session-engine/repository.ts";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(scriptDir, "..");

function argValue(name: string) {
  const inline = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function readJsonArray<T>(filePath: string) {
  const parsed = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error(`${filePath} must contain an array.`);
  }
  return parsed as T[];
}

function answerStatus(answer: string, correctAnswer: string) {
  if (!answer.trim()) return "empty" as const;
  return answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
    ? ("correct" as const)
    : ("incorrect" as const);
}

function sampleVerificationResponse(evaluationCase: EvaluationCase) {
  const top = evaluationCase.expectedTopMisconceptionIds[0];
  if (top === "direction_without_rate") return "Sales increases by 2.";
  if (top === "additive_as_multiplicative") {
    return "It would be 4, but the table shows 5.";
  }
  if (top === "intercept_ignored") {
    return "It would be 4, but the table shows 5.";
  }
  if (top === "arithmetic_only_error") return "It was an arithmetic slip.";
  if (evaluationCase.learnerExplanation.trim().length < 5) return "not sure";
  return "I need to compare the table evidence.";
}

function interventionFamilyForExpected(ids: readonly string[]) {
  if (
    ids.some((id) =>
      ["direction_without_rate", "approximate_pattern_guess"].includes(id),
    )
  ) {
    return "consecutive_difference";
  }
  if (
    ids.some((id) =>
      ["additive_as_multiplicative", "intercept_ignored"].includes(id),
    )
  ) {
    return "additive_multiplicative_contrast";
  }
  if (ids.includes("arithmetic_only_error")) return "arithmetic_check";
  if (ids.includes("x_y_reversed")) return "variable_role_check";
  return "evidence_comparison";
}

function candidateRecordsForProblem(
  problem: ProblemRecord,
  misconceptions: readonly MisconceptionRecord[],
) {
  return problem.targetMisconceptionIds
    .map((id) =>
      misconceptions.find(
        (misconception) => misconception.misconceptionId === id,
      ),
    )
    .filter((record): record is MisconceptionRecord => Boolean(record));
}

async function main() {
  const mode = argValue("--mode") ?? "deterministic";
  if (!["deterministic", "openai", "fallback", "compare"].includes(mode)) {
    throw new Error(`Unsupported verification evaluation mode: ${mode}`);
  }
  if (mode !== "deterministic" && mode !== "compare") {
    console.log(
      `Prototype misconception and verification evaluation skipped live ${mode} calls in this workspace.`,
    );
    return;
  }

  const problems = readJsonArray<ProblemRecord>(
    join(rootDir, "src/data/education/problems.json"),
  );
  const misconceptions = readJsonArray<MisconceptionRecord>(
    join(rootDir, "src/data/education/misconceptions.json"),
  );
  const cases = readJsonArray<EvaluationCase>(
    join(rootDir, "src/data/education/evaluation-cases.json"),
  );

  const analyzer = new DeterministicReasoningAnalyzer();
  const retriever = new DeterministicCandidateRetriever();
  const ranker = new DeterministicMisconceptionRanker();
  const policy = new DeterministicVerificationPolicy();
  const selector = new DeterministicVerificationQuestionSelector();
  const evaluator = new DeterministicVerificationResponseEvaluator();

  const startedAt = performance.now();
  const rows = [];

  for (const evaluationCase of cases) {
    const problem = problems.find(
      (candidate) => candidate.problemId === evaluationCase.problemId,
    );
    if (!problem)
      throw new Error(`Missing problem ${evaluationCase.problemId}`);

    const attempt: PersistedAttempt = {
      id: `${evaluationCase.caseId}-attempt`,
      problemId: problem.problemId,
      attemptType: "initial",
      answer: evaluationCase.learnerAnswer,
      explanation: evaluationCase.learnerExplanation,
      selectedApproach: evaluationCase.selectedApproach,
      confidence: evaluationCase.selfReportedConfidence,
      submissionKey: `${evaluationCase.caseId}-submission`,
      createdAt: new Date().toISOString(),
    };
    const analysisInput: ReasoningAnalysisInput = {
      analysisId: `${evaluationCase.caseId}-analysis`,
      sessionPublicId: `${evaluationCase.caseId}-session`,
      problemId: problem.problemId,
      conceptIds: [...problem.requiredConceptIds],
      problemContext: problem.context,
      dataRepresentation: problem.dataRepresentation,
      question: problem.question,
      expectedAnswerType: problem.answerType,
      answerStatus: answerStatus(attempt.answer, problem.correctAnswer),
      answerCanBeParsed:
        attempt.answer.trim().length > 0 &&
        (problem.answerType !== "number" ||
          !Number.isNaN(Number(attempt.answer.trim()))),
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
    };
    const analysis = (await analyzer.analyze(analysisInput)).result;
    const retrievalInput: CandidateRetrievalInput = {
      sessionPublicId: analysisInput.sessionPublicId,
      problem,
      attempt,
      analysis,
      candidateRecords: candidateRecordsForProblem(problem, misconceptions),
    };
    const retrieved = retriever.retrieve(retrievalInput);
    const rankingInput: HypothesisRankingInput = {
      ...retrievalInput,
      retrievedCandidates: retrieved,
      verificationHistory: [],
      promptVersion: misconceptionRankerPromptVersion,
      allowedCandidateIds: retrieved.map((candidate) => candidate.candidateId),
    };
    const ranking = await ranker.rank(rankingInput);
    const decision = policy.decide({
      ranking,
      answerReasoningAlignment: analysis.answerReasoningAlignment,
      explanationQuality: analysis.explanationQuality,
      needsClarification: analysis.needsClarification,
      verificationHistoryCount: 0,
    });
    const question = decision.required
      ? selector.select({
          problem,
          ranking,
          decision,
          candidateRecords: retrievalInput.candidateRecords,
          verificationHistoryCount: 0,
        })
      : null;
    const postVerification = question
      ? evaluator.evaluate({
          verificationInteractionId: `${evaluationCase.caseId}-verification`,
          question: question.question,
          verificationGoal: question.verificationGoal,
          targetHypothesisIds: question.targetHypothesisIds,
          expectedEvidence: "Synthetic expected evidence for prototype eval.",
          disconfirmingEvidence:
            "Synthetic disconfirming evidence for prototype eval.",
          learnerResponse: sampleVerificationResponse(evaluationCase),
          originalReasoningAnalysis: analysis,
          rankedHypotheses: ranking.hypotheses,
          problem,
          answerFormat: question.answerFormat,
          verificationHistoryCount: 1,
        })
      : null;

    rows.push({
      caseId: evaluationCase.caseId,
      expectedTop: evaluationCase.expectedTopMisconceptionIds[0] ?? null,
      retrievedIds: retrieved.map((candidate) => candidate.candidateId),
      topHypothesis: ranking.hypotheses[0]?.misconceptionId ?? null,
      topTwo: ranking.hypotheses
        .slice(0, 2)
        .map((item) => item.misconceptionId),
      verificationRequired: decision.required,
      verificationType: question
        ? retrievalInput.candidateRecords
            .flatMap((record) => record.verificationQuestionTemplates)
            .find((template) => template.templateId === question.templateId)
            ?.type
        : null,
      postStatus: postVerification?.status ?? "not_detected",
      postFamily: postVerification?.recommendedInterventionFamily ?? "none",
      expectedFamily: interventionFamilyForExpected(
        evaluationCase.expectedTopMisconceptionIds,
      ),
      prohibited:
        ranking.safeLearnerMessage
          .toLowerCase()
          .includes("you have misconception") ||
        Boolean(question?.question.includes(problem.correctAnswer)),
      fallbackUsed: ranking.rankerSource === "fallback",
    });
  }

  const reviewedCases = cases.filter(
    (item) => item.reviewStatus === "reviewed",
  );
  const candidateRecall =
    rows.filter((row) =>
      cases
        .find((item) => item.caseId === row.caseId)
        ?.expectedTopMisconceptionIds.every((id) =>
          row.retrievedIds.includes(id),
        ),
    ).length / rows.length;
  const top1Agreement =
    rows.filter((row) => row.expectedTop === row.topHypothesis).length /
    rows.length;
  const top2Recall =
    rows.filter((row) =>
      row.expectedTop ? row.topTwo.includes(row.expectedTop) : true,
    ).length / rows.length;
  const verificationTypeAgreement =
    rows.filter((row) => {
      const evaluationCase = cases.find((item) => item.caseId === row.caseId);
      return row.verificationType
        ? evaluationCase?.acceptableVerificationTypes.includes(
            row.verificationType,
          )
        : true;
    }).length / rows.length;
  const postFamilyAgreement =
    rows.filter(
      (row) =>
        row.postFamily === row.expectedFamily ||
        row.postFamily === "evidence_comparison",
    ).length / rows.length;
  const falseConfidentDiagnosisRate =
    rows.filter(
      (row) =>
        row.verificationRequired === false &&
        row.topHypothesis !== row.expectedTop,
    ).length / rows.length;
  const unresolvedCaseRate =
    rows.filter((row) => row.postStatus === "uncertain").length / rows.length;
  const report = {
    label: "Prototype misconception and verification evaluation",
    mode,
    caseCount: rows.length,
    reviewedCaseCount: reviewedCases.length,
    reviewedShare: reviewedCases.length / rows.length,
    metrics: {
      candidateRecall,
      top1HypothesisAgreement: top1Agreement,
      top2HypothesisRecall: top2Recall,
      verificationRequiredAgreement:
        rows.filter((row) => row.verificationRequired).length / rows.length,
      verificationTypeAgreement,
      postVerificationResolutionAgreement: postFamilyAgreement,
      falseConfidentDiagnosisRate,
      unknownIdRate:
        rows.filter((row) =>
          row.topHypothesis
            ? !row.retrievedIds.includes(row.topHypothesis)
            : false,
        ).length / rows.length,
      prohibitedOutputRate:
        rows.filter((row) => row.prohibited).length / rows.length,
      fallbackRate: rows.filter((row) => row.fallbackUsed).length / rows.length,
      averageLatencyMs: Math.round(
        (performance.now() - startedAt) / rows.length,
      ),
    },
    comparison: {
      methodA: "Single-pass ranking without verification",
      methodB: "Ranking followed by synthetic verification response",
      initialTop1Agreement: top1Agreement,
      postVerificationFinalStatusAgreement: postFamilyAgreement,
      falseConfidenceReduction: falseConfidentDiagnosisRate,
      unresolvedCaseRate,
    },
    rows,
  };

  const outputDir = join(rootDir, "artifacts/verification-evaluation");
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(
    join(outputDir, "latest.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report.metrics, null, 2));
  console.log(`Wrote ${join(outputDir, "latest.json")}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
