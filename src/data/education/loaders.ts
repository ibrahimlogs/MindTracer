import conceptsJson from "./concepts.json";
import evaluationCasesJson from "./evaluation-cases.json";
import misconceptionsJson from "./misconceptions.json";
import problemsJson from "./problems.json";
import rubricsJson from "./rubrics.json";
import { validateEducationDataset } from "./validators";

import type {
  ConceptRecord,
  EvaluationCase,
  MisconceptionRecord,
  ProblemRecord,
  ReasoningRubric,
} from "@/types/education";

interface EducationDataset {
  concepts: readonly ConceptRecord[];
  problems: readonly ProblemRecord[];
  misconceptions: readonly MisconceptionRecord[];
  rubrics: readonly ReasoningRubric[];
  evaluationCases: readonly EvaluationCase[];
}

export class EducationRecordNotFoundError extends Error {
  constructor(recordType: string, id: string) {
    super(`${recordType} record not found: ${id}`);
    this.name = "EducationRecordNotFoundError";
  }
}

function deepFreeze<T>(value: T): Readonly<T> {
  if (typeof value !== "object" || value === null) return value;

  for (const property of Object.getOwnPropertyNames(value)) {
    const child = (value as Record<string, unknown>)[property];
    if (typeof child === "object" && child !== null) {
      deepFreeze(child);
    }
  }

  return Object.freeze(value);
}

let cachedDataset: EducationDataset | undefined;

export function loadEducationDataset() {
  if (!cachedDataset) {
    const { dataset } = validateEducationDataset({
      concepts: conceptsJson as unknown[],
      problems: problemsJson as unknown[],
      misconceptions: misconceptionsJson as unknown[],
      rubrics: rubricsJson as unknown[],
      evaluationCases: evaluationCasesJson as unknown[],
    });

    cachedDataset = deepFreeze(structuredClone(dataset)) as EducationDataset;
  }

  return cachedDataset;
}

export function getEducationValidationSummary() {
  return validateEducationDataset({
    concepts: conceptsJson as unknown[],
    problems: problemsJson as unknown[],
    misconceptions: misconceptionsJson as unknown[],
    rubrics: rubricsJson as unknown[],
    evaluationCases: evaluationCasesJson as unknown[],
  }).summary;
}

export function getAllConcepts() {
  return [...loadEducationDataset().concepts] as readonly ConceptRecord[];
}

export function getConceptById(conceptId: string) {
  const concept = loadEducationDataset().concepts.find(
    (record) => record.conceptId === conceptId,
  );
  if (!concept) throw new EducationRecordNotFoundError("Concept", conceptId);
  return concept;
}

export function getAllProblems() {
  return [...loadEducationDataset().problems] as readonly ProblemRecord[];
}

export function getProblemById(problemId: string) {
  const problem = loadEducationDataset().problems.find(
    (record) => record.problemId === problemId,
  );
  if (!problem) throw new EducationRecordNotFoundError("Problem", problemId);
  return problem;
}

export function getProblemsByConcept(conceptId: string) {
  getConceptById(conceptId);
  return loadEducationDataset().problems.filter((problem) =>
    problem.requiredConceptIds.includes(conceptId),
  );
}

export function getTransferProblems(problemId: string) {
  const problem = getProblemById(problemId);
  return problem.transferProblemIds.map((transferProblemId) =>
    getProblemById(transferProblemId),
  );
}

export function getAllMisconceptions() {
  return [
    ...loadEducationDataset().misconceptions,
  ] as readonly MisconceptionRecord[];
}

export function getMisconceptionById(misconceptionId: string) {
  const misconception = loadEducationDataset().misconceptions.find(
    (record) => record.misconceptionId === misconceptionId,
  );
  if (!misconception) {
    throw new EducationRecordNotFoundError("Misconception", misconceptionId);
  }
  return misconception;
}

export function getMisconceptionsForProblem(problemId: string) {
  const problem = getProblemById(problemId);
  return problem.targetMisconceptionIds.map((misconceptionId) =>
    getMisconceptionById(misconceptionId),
  );
}

export function getRubricById(rubricId: string) {
  const rubric = loadEducationDataset().rubrics.find(
    (record) => record.rubricId === rubricId,
  );
  if (!rubric) throw new EducationRecordNotFoundError("Rubric", rubricId);
  return rubric;
}

export function getEvaluationCases() {
  return [
    ...loadEducationDataset().evaluationCases,
  ] as readonly EvaluationCase[];
}

export function getReviewedEvaluationCases() {
  return loadEducationDataset().evaluationCases.filter(
    (evaluationCase) => evaluationCase.reviewStatus === "reviewed",
  );
}
