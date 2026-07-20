import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { validateEducationDataset } from "./validators.ts";

const educationDirectory = dirname(fileURLToPath(import.meta.url));

function readJsonFile(fileName: string) {
  return JSON.parse(
    readFileSync(join(educationDirectory, fileName), "utf8"),
  ) as unknown[];
}

try {
  const { summary } = validateEducationDataset({
    concepts: readJsonFile("concepts.json"),
    problems: readJsonFile("problems.json"),
    misconceptions: readJsonFile("misconceptions.json"),
    rubrics: readJsonFile("rubrics.json"),
    evaluationCases: readJsonFile("evaluation-cases.json"),
  });
  console.log("MindTrace education dataset validation passed.");
  console.table(summary);
} catch (error) {
  console.error("MindTrace education dataset validation failed.");
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
}
