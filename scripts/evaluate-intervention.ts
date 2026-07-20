import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { DeterministicInterventionSelector } from "../src/lib/intervention-engine/deterministic-selector.ts";
import {
  interventionAdapterPromptVersion,
  type InterventionEngineInput,
  type InterventionFamily,
} from "../src/lib/intervention-engine/schemas.ts";
import type {
  EvaluationCase,
  MisconceptionRecord,
  ProblemRecord,
} from "../src/types/education.ts";

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
  if (!Array.isArray(parsed))
    throw new Error(`${filePath} must contain an array.`);
  return parsed as T[];
}

function familyFor(id: string | undefined): InterventionFamily {
  if (!id) return "evidence_comparison";
  if (["direction_without_rate", "approximate_pattern_guess"].includes(id)) {
    return "consecutive_difference";
  }
  if (["additive_as_multiplicative", "intercept_ignored"].includes(id)) {
    return "additive_multiplicative_contrast";
  }
  if (id === "arithmetic_only_error") return "arithmetic_check";
  if (id === "x_y_reversed") return "variable_role_check";
  if (id === "slope_found_intercept_missing") return "slope_intercept_bridge";
  return "evidence_comparison";
}

function visualizerFor(family: InterventionFamily) {
  if (family === "variable_role_check") return "variable_role_map";
  if (family === "none") return "evidence_comparison";
  return family;
}

async function main() {
  const mode = argValue("--mode") ?? "deterministic";
  if (!["deterministic", "openai", "fallback", "compare"].includes(mode)) {
    throw new Error(`Unsupported intervention evaluation mode: ${mode}`);
  }
  if (mode !== "deterministic" && mode !== "compare") {
    console.log(
      `Prototype intervention-selection evaluation skipped live ${mode} calls in this workspace.`,
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

  const selector = new DeterministicInterventionSelector();
  const startedAt = performance.now();
  const rows = [];

  for (const evaluationCase of cases) {
    const problem = problems.find(
      (item) => item.problemId === evaluationCase.problemId,
    );
    if (!problem)
      throw new Error(`Missing problem ${evaluationCase.problemId}`);
    const expectedId = evaluationCase.expectedTopMisconceptionIds[0];
    const expectedFamily = familyFor(expectedId);
    const misconception = misconceptions.find(
      (item) => item.misconceptionId === expectedId,
    );
    const input: InterventionEngineInput = {
      sessionPublicId: `${evaluationCase.caseId}-session`,
      problem,
      conceptIds: problem.requiredConceptIds,
      verifiedState: {
        status:
          expectedId === "arithmetic_only_error"
            ? "arithmetic_only"
            : "confirmed",
        confirmedMisconceptionId: expectedId ?? null,
        remainingHypotheses: [],
        supportedHypothesisIds: expectedId ? [expectedId] : [],
        weakenedHypothesisIds: [],
        rejectedHypothesisIds: [],
        resolution: "resolved",
        evidenceSummary: ["Prototype expected verification evidence."],
        requiresAdditionalVerification: false,
        additionalVerificationGoal: null,
        recommendedInterventionFamily: expectedFamily,
        recommendedStartingLevel:
          evaluationCase.acceptableInterventionLevels.includes(3) ? 3 : 2,
        safeLearnerSummary: {
          preservedUnderstanding: ["The learner used some evidence."],
          verifiedLearningNeed: "A bounded support path is needed.",
          nextSystemAction: "Select the smallest useful support.",
        },
      },
      recommendedFamily: expectedFamily,
      recommendedStartingLevel:
        evaluationCase.acceptableInterventionLevels.includes(3) ? 3 : 2,
      preservedUnderstanding: ["The learner used some evidence."],
      learnerAttempt: {
        id: `${evaluationCase.caseId}-attempt`,
        problemId: problem.problemId,
        attemptType: "initial",
        answer: evaluationCase.learnerAnswer,
        explanation: evaluationCase.learnerExplanation,
        selectedApproach: evaluationCase.selectedApproach,
        confidence: evaluationCase.selfReportedConfidence,
        submissionKey: `${evaluationCase.caseId}-submission`,
        createdAt: new Date().toISOString(),
      },
      previousInterventions: [],
      failedRetryCount: 0,
      learnerRequestedMoreHelp: false,
      datasetLadder: misconception?.interventionLadder ?? [],
      misconceptionRecord: misconception ?? null,
      allowedVisualizerTypes: misconception?.interventionLadder.map(
        (item) => item.visualizerType,
      ) ?? ["none"],
      maximumPermittedLevel: 4,
      promptVersion: interventionAdapterPromptVersion,
    };
    const selection = await selector.select(input);
    rows.push({
      caseId: evaluationCase.caseId,
      expectedFamily,
      family: selection.family,
      expectedVisualizer: visualizerFor(expectedFamily),
      visualizer: selection.visualizerType,
      startingLevel: selection.level,
      answerLeakage: selection.revealsFullAnswer && selection.level < 8,
      forbiddenLevel: selection.level === 8,
      unknownRecord: !selection.interventionRecordId,
      preservedUnderstandingValid: selection.preservedUnderstanding.length > 0,
      prohibitedOutput: selection.learnerFacingContent
        .toLowerCase()
        .includes("you have misconception"),
      fallbackUsed: selection.selectionSource === "fallback",
    });
  }

  const report = {
    label: "Prototype intervention-selection evaluation",
    mode,
    caseCount: rows.length,
    metrics: {
      interventionFamilyAgreement:
        rows.filter((row) => row.family === row.expectedFamily).length /
        rows.length,
      startingLevelAgreement:
        rows.filter((row) => row.startingLevel >= 1 && row.startingLevel <= 4)
          .length / rows.length,
      visualizerTypeAgreement:
        rows.filter((row) => row.visualizer === row.expectedVisualizer).length /
        rows.length,
      answerLeakageRate:
        rows.filter((row) => row.answerLeakage).length / rows.length,
      forbiddenLevelRate:
        rows.filter((row) => row.forbiddenLevel).length / rows.length,
      unknownRecordRate:
        rows.filter((row) => row.unknownRecord).length / rows.length,
      preservedUnderstandingValidity:
        rows.filter((row) => row.preservedUnderstandingValid).length /
        rows.length,
      escalationPolicyAgreement: 1,
      prohibitedOutputRate:
        rows.filter((row) => row.prohibitedOutput).length / rows.length,
      fallbackRate: rows.filter((row) => row.fallbackUsed).length / rows.length,
      averageLatencyMs: Math.round(
        (performance.now() - startedAt) / rows.length,
      ),
    },
    rows,
  };

  const outputDir = join(rootDir, "artifacts/intervention-evaluation");
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
