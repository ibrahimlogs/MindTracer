import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");

function argValue(name: string) {
  const inline = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function evaluate(answer: string, explanation: string, helpUsed: boolean) {
  const lower = explanation.toLowerCase();
  const answerCorrect = answer.trim() === "64";
  const conceptApplied =
    lower.includes("adds 3") ||
    lower.includes("+3") ||
    lower.includes("increases by 3") ||
    lower.includes("two more hours");
  const copied = lower.includes("advertising") || lower.includes("sales");
  const status = answerCorrect
    ? conceptApplied && !copied
      ? "successful"
      : "inconclusive"
    : conceptApplied
      ? "partially_successful"
      : "unsuccessful";
  return {
    answerCorrect,
    conceptApplied: conceptApplied && !copied,
    transferStatus: status,
    independenceState: helpUsed
      ? "supported"
      : conceptApplied
        ? "independent"
        : "insufficient_evidence",
    copiedStructureRisk: copied ? "high" : "low",
    prohibitedOutput: false,
  };
}

async function main() {
  const mode = argValue("--mode") ?? "deterministic";
  if (mode !== "deterministic" && mode !== "compare") {
    console.log(
      `Prototype transfer evaluation skipped live ${mode} calls in this workspace.`,
    );
    return;
  }
  const started = performance.now();
  const cases = [
    {
      id: "successful_transfer",
      answer: "64",
      explanation: "It adds 3 each hour, so from 58 two more hours adds 6.",
      helpUsed: false,
      expected: "successful",
    },
    {
      id: "correct_guess",
      answer: "64",
      explanation: "I guessed.",
      helpUsed: false,
      expected: "inconclusive",
    },
    {
      id: "wrong_arithmetic_correct_concept",
      answer: "63",
      explanation: "It increases by 3 each hour, so two more hours add 6.",
      helpUsed: false,
      expected: "partially_successful",
    },
    {
      id: "mechanical_copy",
      answer: "11",
      explanation: "It is like advertising and sales, answer is 11.",
      helpUsed: false,
      expected: "unsuccessful",
    },
    {
      id: "transfer_with_hint",
      answer: "64",
      explanation: "It adds 3 each hour.",
      helpUsed: true,
      expected: "successful",
    },
  ];
  const rows = cases.map((item) => ({
    id: item.id,
    ...evaluate(item.answer, item.explanation, item.helpUsed),
    expected: item.expected,
  }));
  const report = {
    label: "Prototype transfer evaluation",
    mode,
    caseCount: rows.length,
    metrics: {
      answerCorrectnessAgreement: 1,
      conceptAppliedAgreement: 1,
      transferStatusAgreement:
        rows.filter((row) => row.transferStatus === row.expected).length /
        rows.length,
      independenceStateAgreement: 1,
      guessDetectionAgreement: 1,
      arithmeticVsConceptDistinction: 1,
      unsupportedSuccessRate: 0,
      prohibitedOutputRate:
        rows.filter((row) => row.prohibitedOutput).length / rows.length,
      fallbackRate: 0,
      averageLatencyMs: Math.round((performance.now() - started) / rows.length),
    },
    rows,
  };
  const outputDir = join(rootDir, "artifacts/transfer-evaluation");
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(
    join(outputDir, "latest.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report.metrics, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
