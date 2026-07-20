import { describe, expect, it } from "vitest";

import {
  EducationRecordNotFoundError,
  getAllConcepts,
  getEvaluationCases,
  getMisconceptionsForProblem,
  getProblemById,
  getReviewedEvaluationCases,
  getTransferProblems,
  loadEducationDataset,
} from "@/data/education";
import { demoLearners } from "@/data/demo/demo-learners";
import { demoProblem } from "@/data/demo/demo-problem";
import { demoTransfer } from "@/data/demo/demo-transfer";
import type { ConceptRecord } from "@/types/education";

describe("education dataset validation", () => {
  const dataset = loadEducationDataset();

  it("validates every JSON dataset file as one aggregate dataset", () => {
    expect(dataset.concepts).toHaveLength(3);
    expect(dataset.problems.length).toBeGreaterThanOrEqual(12);
    expect(dataset.misconceptions.length).toBeGreaterThanOrEqual(12);
    expect(dataset.rubrics.length).toBeGreaterThanOrEqual(4);
    expect(dataset.evaluationCases.length).toBeGreaterThanOrEqual(30);
  });

  it("keeps all top-level IDs unique", () => {
    const idGroups = [
      dataset.concepts.map((record) => record.conceptId),
      dataset.problems.map((record) => record.problemId),
      dataset.misconceptions.map((record) => record.misconceptionId),
      dataset.rubrics.map((record) => record.rubricId),
      dataset.evaluationCases.map((record) => record.caseId),
    ];

    for (const ids of idGroups) {
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("resolves all concept references", () => {
    const conceptIds = new Set(
      dataset.concepts.map((concept) => concept.conceptId),
    );
    for (const problem of dataset.problems) {
      expect(problem.requiredConceptIds.every((id) => conceptIds.has(id))).toBe(
        true,
      );
    }
    for (const misconception of dataset.misconceptions) {
      expect(misconception.conceptIds.every((id) => conceptIds.has(id))).toBe(
        true,
      );
    }
  });

  it("resolves all problem references", () => {
    const problemIds = new Set(
      dataset.problems.map((problem) => problem.problemId),
    );
    for (const concept of dataset.concepts) {
      expect(
        concept.recommendedProblemIds.every((id) => problemIds.has(id)),
      ).toBe(true);
    }
    for (const problem of dataset.problems) {
      expect(problem.transferProblemIds.every((id) => problemIds.has(id))).toBe(
        true,
      );
    }
  });

  it("resolves all misconception references", () => {
    const misconceptionIds = new Set(
      dataset.misconceptions.map(
        (misconception) => misconception.misconceptionId,
      ),
    );
    for (const concept of dataset.concepts) {
      expect(
        concept.commonMisconceptionIds.every((id) => misconceptionIds.has(id)),
      ).toBe(true);
    }
    for (const problem of dataset.problems) {
      expect(
        problem.targetMisconceptionIds.every((id) => misconceptionIds.has(id)),
      ).toBe(true);
    }
  });

  it("gives every active primary problem at least one transfer problem", () => {
    for (const problem of dataset.problems.filter(
      (record) => record.status === "active",
    )) {
      expect(problem.transferProblemIds.length).toBeGreaterThan(0);
    }
  });

  it("does not let transfer problems reference themselves", () => {
    for (const problem of dataset.problems) {
      expect(problem.transferProblemIds).not.toContain(problem.problemId);
    }
  });

  it("gives every active problem at least one target misconception", () => {
    for (const problem of dataset.problems.filter(
      (record) => record.status === "active",
    )) {
      expect(problem.targetMisconceptionIds.length).toBeGreaterThan(0);
    }
  });

  it("gives every misconception signals and counter-signals", () => {
    for (const misconception of dataset.misconceptions) {
      expect(misconception.signals.length).toBeGreaterThanOrEqual(2);
      expect(misconception.counterSignals.length).toBeGreaterThan(0);
    }
  });

  it("gives every misconception verification templates", () => {
    for (const misconception of dataset.misconceptions) {
      expect(
        misconception.verificationQuestionTemplates.length,
      ).toBeGreaterThan(0);
    }
  });

  it("gives every misconception an ordered intervention ladder", () => {
    for (const misconception of dataset.misconceptions) {
      const levels = misconception.interventionLadder.map(
        (intervention) => intervention.level,
      );
      expect(levels.length).toBeGreaterThanOrEqual(3);
      expect(levels[0]).toBeLessThanOrEqual(3);
      expect([...levels].sort((a, b) => a - b)).toEqual(levels);
    }
  });

  it("reveals the full answer only at level 8", () => {
    for (const misconception of dataset.misconceptions) {
      for (const intervention of misconception.interventionLadder) {
        if (intervention.revealsFullAnswer) {
          expect(intervention.level).toBe(8);
        }
      }
    }
  });

  it("has active problems referencing active rubrics", () => {
    const rubricIds = new Set(dataset.rubrics.map((rubric) => rubric.rubricId));
    for (const problem of dataset.problems.filter(
      (record) => record.status === "active",
    )) {
      expect(rubricIds.has(problem.rubricId)).toBe(true);
    }
  });

  it("contains the required evaluation-case volume", () => {
    expect(getEvaluationCases()).toHaveLength(30);
    expect(getReviewedEvaluationCases().length).toBeGreaterThanOrEqual(25);
  });

  it("loads the demo problem from the education dataset", () => {
    expect(demoProblem.problemId).toBe("ads_sales_001");
    expect(demoProblem.correctAnswer).toBe("11");
    expect(demoProblem.targetMisconceptionIds).toContain(
      "direction_without_rate",
    );
  });

  it("loads the demo transfer problem from the education dataset", () => {
    expect(demoTransfer.problemId).toBe("study_score_001");
    expect(demoTransfer.correctAnswer).toBe("64");
    expect(
      getTransferProblems(demoProblem.problemId).map(
        (problem) => problem.problemId,
      ),
    ).toContain(demoTransfer.problemId);
  });

  it("keeps Learner A misconception references valid", () => {
    expect(demoLearners[0].primaryMisconceptionIds).toEqual([
      "direction_without_rate",
      "approximate_pattern_guess",
    ]);
    expect(
      getMisconceptionsForProblem(demoProblem.problemId).map(
        (record) => record.misconceptionId,
      ),
    ).toEqual(
      expect.arrayContaining([...demoLearners[0].primaryMisconceptionIds]),
    );
  });

  it("keeps Learner B misconception references valid", () => {
    expect(demoLearners[1].primaryMisconceptionIds).toEqual([
      "additive_as_multiplicative",
      "intercept_ignored",
    ]);
    expect(
      getMisconceptionsForProblem(demoProblem.problemId).map(
        (record) => record.misconceptionId,
      ),
    ).toEqual(
      expect.arrayContaining([...demoLearners[1].primaryMisconceptionIds]),
    );
  });

  it("returns readonly-safe loader values", () => {
    const concepts = getAllConcepts();
    const mutableCopy = concepts as ConceptRecord[];
    mutableCopy.pop();

    expect(getAllConcepts()).toHaveLength(dataset.concepts.length);
    expect(Object.isFrozen(getAllConcepts()[0])).toBe(true);
  });

  it("throws clear missing ID errors", () => {
    expect(() => getProblemById("missing_problem")).toThrow(
      EducationRecordNotFoundError,
    );
    expect(() => getProblemById("missing_problem")).toThrow(
      "Problem record not found: missing_problem",
    );
  });
});
