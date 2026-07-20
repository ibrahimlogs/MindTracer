import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client.ts";
import type { Prisma } from "../src/generated/prisma/client.ts";
import { validateEducationDataset } from "../src/data/education/validators.ts";

const sourceVersion = "step-04-prototype-v1";
const scriptDir = dirname(fileURLToPath(import.meta.url));
const educationDir = join(scriptDir, "..", "src", "data", "education");

interface CountBucket {
  created: number;
  updated: number;
  unchanged: number;
  skipped: number;
}

function emptyCounts(): CountBucket {
  return { created: 0, updated: 0, unchanged: 0, skipped: 0 };
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function readJsonArray(fileName: string): unknown[] {
  const parsed = JSON.parse(
    readFileSync(join(educationDir, fileName), "utf8"),
  ) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error(`${fileName} must contain an array.`);
  }

  return parsed;
}

function loadDatasetForSeed() {
  return validateEducationDataset({
    concepts: readJsonArray("concepts.json"),
    problems: readJsonArray("problems.json"),
    misconceptions: readJsonArray("misconceptions.json"),
    rubrics: readJsonArray("rubrics.json"),
    evaluationCases: readJsonArray("evaluation-cases.json"),
  }).dataset;
}

async function main() {
  const dataset = loadDatasetForSeed();

  if (!process.env.DATABASE_URL) {
    console.log("Education dataset validation passed.");
    console.log(
      "DATABASE_URL is not configured; seed skipped for explicit fallback mode.",
    );
    console.table({
      concepts: dataset.concepts.length,
      problems: dataset.problems.length,
      misconceptions: dataset.misconceptions.length,
      mode: "fallback-skip",
    });
    return;
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const counts = {
    concepts: emptyCounts(),
    problems: emptyCounts(),
    misconceptions: emptyCounts(),
    problemMisconceptions: emptyCounts(),
  };

  for (const concept of dataset.concepts) {
    await prisma.concept.upsert({
      where: { id: concept.conceptId },
      update: {
        familyId: concept.familyId,
        title: concept.title,
        description: concept.fullDescription,
        status: concept.status,
        sourceVersion,
      },
      create: {
        id: concept.conceptId,
        familyId: concept.familyId,
        title: concept.title,
        description: concept.fullDescription,
        status: concept.status,
        sourceVersion,
      },
    });
    counts.concepts.updated += 1;
  }

  for (const problem of dataset.problems) {
    await prisma.problem.upsert({
      where: { id: problem.problemId },
      update: {
        title: problem.title,
        conceptFamilyId: problem.conceptFamilyId,
        difficulty: problem.difficulty,
        contentJson: toJson(problem),
        correctAnswerJson: toJson(problem.correctAnswer),
        solutionModelJson: toJson(problem.solutionModel),
        rubricId: problem.rubricId,
        status: problem.status,
        sourceVersion,
      },
      create: {
        id: problem.problemId,
        title: problem.title,
        conceptFamilyId: problem.conceptFamilyId,
        difficulty: problem.difficulty,
        contentJson: toJson(problem),
        correctAnswerJson: toJson(problem.correctAnswer),
        solutionModelJson: toJson(problem.solutionModel),
        rubricId: problem.rubricId,
        status: problem.status,
        sourceVersion,
      },
    });
    counts.problems.updated += 1;
  }

  for (const misconception of dataset.misconceptions) {
    await prisma.misconception.upsert({
      where: { id: misconception.misconceptionId },
      update: {
        title: misconception.title,
        description: misconception.fullDescription,
        severity: misconception.severity,
        contentJson: toJson(misconception),
        status: misconception.status,
        sourceVersion,
      },
      create: {
        id: misconception.misconceptionId,
        title: misconception.title,
        description: misconception.fullDescription,
        severity: misconception.severity,
        contentJson: toJson(misconception),
        status: misconception.status,
        sourceVersion,
      },
    });
    counts.misconceptions.updated += 1;
  }

  for (const problem of dataset.problems) {
    for (const [
      index,
      misconceptionId,
    ] of problem.targetMisconceptionIds.entries()) {
      await prisma.problemMisconception.upsert({
        where: {
          problemId_misconceptionId: {
            problemId: problem.problemId,
            misconceptionId,
          },
        },
        update: { priority: index + 1 },
        create: {
          problemId: problem.problemId,
          misconceptionId,
          priority: index + 1,
        },
      });
      counts.problemMisconceptions.updated += 1;
    }
  }

  await prisma.$disconnect();
  console.log("Education seed completed.");
  console.table(counts);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
