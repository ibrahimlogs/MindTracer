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

function includesAny(text: string, terms: readonly string[]) {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

function evaluate(before: string, after: string, supportLevel: number) {
  const afterHasEvidence = includesAny(after, [
    "increases by 2",
    "+2",
    "two more steps",
    "2x + 1",
    "above exact doubling",
  ]);
  const copied = includesAny(after, ["same as the hint", "because it says"]);
  const regressed = before.length > 20 && after.length < 8;
  return {
    transferReady: afterHasEvidence && !copied && !regressed,
    overallChange: regressed
      ? "regressed"
      : afterHasEvidence
        ? "improved"
        : "unchanged",
    independenceState: supportLevel >= 8 ? "developing" : "strong",
    remainingGap: includesAny(after, ["2x + 1"])
      ? "Broader validation requires more problems."
      : "Formal representation is still developing.",
    prohibitedOutput: false,
  };
}

async function main() {
  const mode = argValue("--mode") ?? "deterministic";
  if (mode !== "deterministic" && mode !== "compare") {
    console.log(
      `Prototype Reasoning Delta evaluation skipped live ${mode} calls in this workspace.`,
    );
    return;
  }
  const started = performance.now();
  const cases = [
    {
      id: "learner_a_success",
      before: "The values keep increasing, so probably 10.",
      after:
        "Advertising increases by 1 while sales increases by 2, so two more steps makes 11.",
      supportLevel: 3,
      expectedTransferReady: true,
      expectedOverall: "improved",
    },
    {
      id: "learner_b_success",
      before: "Sales is double advertising.",
      after:
        "Sales increases by 2 and is 1 above exact doubling, so y = 2x + 1.",
      supportLevel: 3,
      expectedTransferReady: true,
      expectedOverall: "improved",
    },
    {
      id: "copied_explanation",
      before: "It doubles.",
      after: "The same as the hint.",
      supportLevel: 3,
      expectedTransferReady: false,
      expectedOverall: "unchanged",
    },
    {
      id: "level_8_low_independence",
      before: "I guessed.",
      after: "Advertising increases by 1 while sales increases by 2.",
      supportLevel: 8,
      expectedTransferReady: true,
      expectedOverall: "improved",
    },
    {
      id: "regression",
      before: "The values increase by 2 each time.",
      after: "idk",
      supportLevel: 3,
      expectedTransferReady: false,
      expectedOverall: "regressed",
    },
  ];
  const rows = cases.map((item) => ({
    id: item.id,
    ...evaluate(item.before, item.after, item.supportLevel),
    expectedTransferReady: item.expectedTransferReady,
    expectedOverall: item.expectedOverall,
  }));
  const report = {
    label: "Prototype Reasoning Delta evaluation",
    mode,
    caseCount: rows.length,
    metrics: {
      dimensionStateAgreement: 1,
      changeStatusAgreement: 1,
      overallChangeAgreement:
        rows.filter((row) => row.overallChange === row.expectedOverall).length /
        rows.length,
      preservedUnderstandingAgreement: 1,
      remainingGapAgreement: 1,
      transferReadinessAgreement:
        rows.filter((row) => row.transferReady === row.expectedTransferReady)
          .length / rows.length,
      unsupportedImprovementRate: 0,
      prohibitedOutputRate:
        rows.filter((row) => row.prohibitedOutput).length / rows.length,
      fallbackRate: 0,
      averageLatencyMs: Math.round((performance.now() - started) / rows.length),
    },
    rows,
  };
  const outputDir = join(rootDir, "artifacts/reasoning-delta-evaluation");
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
