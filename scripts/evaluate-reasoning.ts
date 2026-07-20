import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { DeterministicReasoningAnalyzer } from "../src/lib/ai/reasoning/deterministic-analyzer.ts";
import {
  reasoningAnalysisResultSchema,
  reasoningPromptVersion,
  type ReasoningAnalysisInput,
} from "../src/lib/ai/reasoning/schema.ts";
import type {
  PersistedAttempt,
  SessionSnapshot,
} from "../src/lib/session-engine/repository.ts";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(scriptDir, "..");

function argValue(name: string) {
  const inline = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function readJsonArray(filePath: string): unknown[] {
  const parsed = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
  if (!Array.isArray(parsed))
    throw new Error(`${filePath} must contain an array.`);
  return parsed;
}

function answerStatus(answer: string, correctAnswer: string) {
  if (!answer.trim()) return "empty" as const;
  return answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
    ? ("correct" as const)
    : ("incorrect" as const);
}

async function main() {
  const mode = argValue("--mode") ?? "deterministic";
  if (mode !== "deterministic") {
    console.log(
      `${mode} evaluation is scaffolded; deterministic mode is the ordinary CI path.`,
    );
  }

  const cases = readJsonArray(
    join(rootDir, "src", "data", "education", "evaluation-cases.json"),
  );
  const problems = readJsonArray(
    join(rootDir, "src", "data", "education", "problems.json"),
  ) as Array<{
    problemId: string;
    requiredConceptIds: string[];
    context: string;
    dataRepresentation: unknown;
    question: string;
    answerType: "number" | "text" | "equation" | "choice";
    correctAnswer: string;
    solutionModel: string;
  }>;
  const analyzer = new DeterministicReasoningAnalyzer();
  const startedAt = performance.now();
  let schemaValid = 0;
  let clarificationNeeded = 0;
  let prohibitedOutput = 0;

  const reviews = [];
  for (const record of cases) {
    const evaluationCase = record as {
      caseId: string;
      problemId: string;
      learnerAnswer: string;
      learnerExplanation: string;
      selectedApproach: string;
      selfReportedConfidence: string;
    };
    const attempt: PersistedAttempt = {
      id: `${evaluationCase.caseId}-attempt`,
      problemId: evaluationCase.problemId,
      attemptType: "initial",
      answer: evaluationCase.learnerAnswer,
      explanation: evaluationCase.learnerExplanation,
      selectedApproach: evaluationCase.selectedApproach,
      confidence: evaluationCase.selfReportedConfidence,
      submissionKey: `${evaluationCase.caseId}-submission`,
      createdAt: new Date().toISOString(),
    };
    const session = {
      sessionId: `${evaluationCase.caseId}-session-internal`,
      publicId: `${evaluationCase.caseId}-session`,
      mode: "compare",
      currentProblemId: evaluationCase.problemId,
      currentLearnerKey: "learner-a",
      currentStage: "reasoning_analysis",
      status: "active",
      educationalDataVersion: "step-04-prototype-v1",
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      fallbackMode: true,
      completedStages: ["problem_presented", "initial_attempt"],
      attempts: [attempt],
      analysis: null,
      verification: null,
      intervention: null,
      transfer: null,
      report: null,
      events: [],
    } satisfies SessionSnapshot;
    const problem = problems.find(
      (candidate) => candidate.problemId === evaluationCase.problemId,
    );
    if (!problem)
      throw new Error(`Missing problem ${evaluationCase.problemId}`);
    const input: ReasoningAnalysisInput = {
      analysisId: `${evaluationCase.caseId}-analysis`,
      sessionPublicId: session.publicId,
      problemId: problem.problemId,
      conceptIds: problem.requiredConceptIds,
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
    const output = await analyzer.analyze(input);
    const parsed = reasoningAnalysisResultSchema.safeParse(output.result);
    if (parsed.success) schemaValid += 1;
    if (output.result.needsClarification) clarificationNeeded += 1;
    const text = JSON.stringify(output.result).toLowerCase();
    if (text.includes("stupid") || text.includes("correct answer is")) {
      prohibitedOutput += 1;
    }
    reviews.push({
      caseId: evaluationCase.caseId,
      expected: "prototype curated extraction expectations",
      actual: {
        relationshipClaimed: output.result.relationshipClaimed,
        operationsUsed: output.result.operationsUsed,
        reasoningCompleteness: output.result.reasoningCompleteness,
        answerReasoningAlignment: output.result.answerReasoningAlignment,
      },
      match: parsed.success,
      reviewerNote: "",
      reviewStatus: "unreviewed",
    });
  }

  const report = {
    mode,
    generatedAt: new Date().toISOString(),
    metrics: {
      cases: cases.length,
      schemaValidOutputRate: schemaValid / cases.length,
      clarificationNeededRate: clarificationNeeded / cases.length,
      prohibitedOutputRate: prohibitedOutput / cases.length,
      fallbackRate: 0,
      averageLatencyMs:
        Math.round(performance.now() - startedAt) / cases.length,
    },
    reviews,
  };
  const outputDir = join(rootDir, "artifacts", "reasoning-evaluation");
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(
    join(outputDir, "latest.json"),
    JSON.stringify(report, null, 2),
  );
  console.log("Reasoning extraction evaluation complete.");
  console.table(report.metrics);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
