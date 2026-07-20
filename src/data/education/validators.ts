import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const stringArray = z.array(nonEmptyString).min(1);
const optionalStringArray = z.array(nonEmptyString);

export const conceptSchema = z.object({
  conceptId: nonEmptyString,
  familyId: nonEmptyString,
  title: nonEmptyString,
  shortDescription: nonEmptyString,
  fullDescription: nonEmptyString,
  prerequisites: optionalStringArray,
  relatedConcepts: optionalStringArray,
  careerConnections: stringArray,
  learningObjectives: stringArray,
  intuitiveExplanation: nonEmptyString,
  visualExplanation: nonEmptyString,
  verbalExplanation: nonEmptyString,
  formalExplanation: nonEmptyString,
  programmingConnection: nonEmptyString,
  commonMisconceptionIds: stringArray,
  recommendedProblemIds: stringArray,
  nextConceptIds: optionalStringArray,
  status: z.enum(["active", "experimental", "archived"]),
});

const dataRepresentationSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("table"),
    columns: z.tuple([nonEmptyString, nonEmptyString]),
    rows: z.array(z.object({ input: z.number(), output: z.number() })).min(2),
  }),
  z.object({
    type: z.literal("sequence"),
    label: nonEmptyString,
    values: z.array(z.number()).min(2),
  }),
  z.object({
    type: z.literal("equation"),
    equation: nonEmptyString,
    variables: stringArray,
  }),
  z.object({ type: z.literal("short_context"), text: nonEmptyString }),
  z.object({
    type: z.literal("comparison"),
    claim: nonEmptyString,
    observed: nonEmptyString,
    predicted: nonEmptyString,
  }),
]);

export const approachIdSchema = z.enum([
  "consecutive_difference",
  "pattern_extension",
  "linear_equation",
  "multiplication_rule",
  "addition_rule",
  "ratio_check",
  "substitution",
  "estimation",
]);

export const visualizerTypeSchema = z.enum([
  "none",
  "highlighted_table",
  "consecutive_difference",
  "additive_multiplicative_contrast",
  "slope_intercept_bridge",
  "variable_role_map",
  "arithmetic_check",
  "transfer_comparison",
]);

export const problemSchema = z.object({
  problemId: nonEmptyString,
  title: nonEmptyString,
  conceptFamilyId: nonEmptyString,
  requiredConceptIds: stringArray,
  difficulty: z.enum(["foundation", "beginner", "intermediate"]),
  context: nonEmptyString,
  dataRepresentation: dataRepresentationSchema,
  question: nonEmptyString,
  answerType: z.enum(["number", "text", "equation", "choice"]),
  correctAnswer: nonEmptyString,
  acceptedAnswerVariants: stringArray,
  solutionModel: nonEmptyString,
  validApproaches: z.array(approachIdSchema).min(1),
  reasoningPrompts: stringArray,
  targetMisconceptionIds: stringArray,
  verificationContext: nonEmptyString,
  interventionVisualizerConfig: z.object({
    visualizerType: visualizerTypeSchema,
    focus: nonEmptyString,
  }),
  transferProblemIds: stringArray,
  rubricId: nonEmptyString,
  tags: stringArray,
  status: z.enum(["active", "experimental", "archived"]),
});

export const verificationTemplateSchema = z.object({
  templateId: nonEmptyString,
  misconceptionId: nonEmptyString,
  type: z.enum([
    "counterexample_check",
    "consecutive_comparison",
    "rule_test",
    "evidence_selection",
    "explanation_check",
    "variable_role_check",
    "arithmetic_check",
    "prediction_check",
  ]),
  goal: nonEmptyString,
  promptTemplate: nonEmptyString,
  expectedEvidence: nonEmptyString,
  disconfirmingEvidence: nonEmptyString,
  answerFormat: z.enum([
    "number",
    "short_text",
    "choice",
    "yes_no_with_reason",
  ]),
  difficulty: z.enum(["foundation", "beginner", "intermediate"]),
  revealsAnswer: z.boolean(),
  reusableAcrossProblems: z.boolean(),
});

export const interventionSchema = z.object({
  interventionId: nonEmptyString,
  level: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
    z.literal(7),
    z.literal(8),
  ]),
  type: nonEmptyString,
  title: nonEmptyString,
  learnerFacingTemplate: nonEmptyString,
  instructionalGoal: nonEmptyString,
  visualizerType: visualizerTypeSchema,
  allowedWhen: stringArray,
  escalationCondition: nonEmptyString,
  revealsPartialAnswer: z.boolean(),
  revealsFullAnswer: z.boolean(),
});

export const misconceptionSchema = z.object({
  misconceptionId: nonEmptyString,
  conceptIds: stringArray,
  title: nonEmptyString,
  shortDescription: nonEmptyString,
  fullDescription: nonEmptyString,
  signals: z.array(nonEmptyString).min(2),
  counterSignals: stringArray,
  possibleAlternativeExplanations: stringArray,
  verificationQuestionTemplates: z.array(verificationTemplateSchema).min(1),
  interventionLadder: z.array(interventionSchema).min(3),
  escalationRules: stringArray,
  allowedNextActions: stringArray,
  severity: z.enum(["low", "medium", "high"]),
  status: z.enum(["active", "experimental", "archived"]),
});

const rubricStates = z.array(
  z.enum([
    "strong",
    "developing",
    "missing",
    "incorrect",
    "insufficient_evidence",
  ]),
);

export const rubricSchema = z.object({
  rubricId: nonEmptyString,
  title: nonEmptyString,
  description: nonEmptyString,
  dimensions: z
    .array(
      z.object({
        dimensionId: z.enum([
          "observationAccuracy",
          "relationshipType",
          "evidenceUse",
          "ruleFormation",
          "formalRepresentation",
          "uncertaintyAwareness",
          "transfer",
          "supportDependence",
        ]),
        title: nonEmptyString,
        description: nonEmptyString,
        allowedStates: rubricStates,
        evaluationGuidance: nonEmptyString,
        positiveEvidence: stringArray,
        negativeEvidence: stringArray,
      }),
    )
    .min(8),
});

export const evaluationCaseSchema = z.object({
  caseId: nonEmptyString,
  problemId: nonEmptyString,
  learnerAnswer: z.string(),
  learnerExplanation: z.string(),
  selectedApproach: nonEmptyString,
  selfReportedConfidence: nonEmptyString,
  expectedReasoningSignals: stringArray,
  expectedTopMisconceptionIds: stringArray,
  acceptableVerificationTypes: z
    .array(verificationTemplateSchema.shape.type)
    .min(1),
  acceptableInterventionLevels: z.array(interventionSchema.shape.level).min(1),
  expectedAnswerCorrectness: z.enum([
    "correct",
    "incorrect",
    "partially_correct",
  ]),
  notes: nonEmptyString,
  reviewStatus: z.enum(["reviewed", "needs_review"]),
});

export const educationDatasetSchema = z.object({
  concepts: z.array(conceptSchema).min(3),
  problems: z.array(problemSchema).min(12),
  misconceptions: z.array(misconceptionSchema).min(12),
  rubrics: z.array(rubricSchema).min(4),
  evaluationCases: z.array(evaluationCaseSchema).min(30),
});

export interface EducationValidationSummary {
  conceptCount: number;
  problemCount: number;
  misconceptionCount: number;
  verificationTemplateCount: number;
  interventionCount: number;
  rubricCount: number;
  evaluationCaseCount: number;
  reviewedEvaluationCaseCount: number;
}

export class EducationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EducationValidationError";
  }
}

interface RawEducationDataset {
  concepts: unknown[];
  problems: unknown[];
  misconceptions: unknown[];
  rubrics: unknown[];
  evaluationCases: unknown[];
}

function assertUniqueIds(
  records: readonly { [key: string]: unknown }[],
  key: string,
) {
  const seen = new Set<string>();
  for (const record of records) {
    const id = record[key];
    if (typeof id !== "string") {
      throw new EducationValidationError(`Missing string id field ${key}.`);
    }
    if (seen.has(id)) {
      throw new EducationValidationError(`Duplicate ${key}: ${id}`);
    }
    seen.add(id);
  }
}

function assertMinimumCount(count: number, minimum: number, label: string) {
  if (count < minimum) {
    throw new EducationValidationError(
      `Expected at least ${minimum} ${label}; found ${count}.`,
    );
  }
}

function assertReference(
  value: string,
  validIds: ReadonlySet<string>,
  message: string,
) {
  if (!validIds.has(value)) {
    throw new EducationValidationError(`${message}: ${value}`);
  }
}

export function validateEducationDataset(rawDataset: RawEducationDataset) {
  const dataset = educationDatasetSchema.parse(rawDataset);
  const { concepts, problems, misconceptions, rubrics, evaluationCases } =
    dataset;

  assertUniqueIds(concepts, "conceptId");
  assertUniqueIds(problems, "problemId");
  assertUniqueIds(misconceptions, "misconceptionId");
  assertUniqueIds(rubrics, "rubricId");
  assertUniqueIds(evaluationCases, "caseId");
  assertUniqueIds(
    misconceptions.flatMap((misconception) =>
      misconception.verificationQuestionTemplates.map((template) => ({
        templateId: template.templateId,
      })),
    ),
    "templateId",
  );
  assertUniqueIds(
    misconceptions.flatMap((misconception) =>
      misconception.interventionLadder.map((intervention) => ({
        interventionId: intervention.interventionId,
      })),
    ),
    "interventionId",
  );

  const conceptIds = new Set(concepts.map((concept) => concept.conceptId));
  const activeConceptIds = new Set(
    concepts
      .filter((concept) => concept.status === "active")
      .map((concept) => concept.conceptId),
  );
  const problemIds = new Set(problems.map((problem) => problem.problemId));
  const activeProblemIds = new Set(
    problems
      .filter((problem) => problem.status === "active")
      .map((problem) => problem.problemId),
  );
  const misconceptionIds = new Set(
    misconceptions.map((misconception) => misconception.misconceptionId),
  );
  const activeMisconceptionIds = new Set(
    misconceptions
      .filter((misconception) => misconception.status === "active")
      .map((misconception) => misconception.misconceptionId),
  );
  const rubricIds = new Set(rubrics.map((rubric) => rubric.rubricId));
  const activeRubricIds = rubricIds;
  const verificationTemplateCount = misconceptions.reduce(
    (total, misconception) =>
      total + misconception.verificationQuestionTemplates.length,
    0,
  );
  const interventionCount = misconceptions.reduce(
    (total, misconception) => total + misconception.interventionLadder.length,
    0,
  );

  assertMinimumCount(verificationTemplateCount, 20, "verification templates");
  assertMinimumCount(interventionCount, 30, "interventions");

  for (const concept of concepts) {
    for (const misconceptionId of concept.commonMisconceptionIds) {
      assertReference(
        misconceptionId,
        misconceptionIds,
        `Concept ${concept.conceptId} references missing misconception`,
      );
      if (
        concept.status === "active" &&
        !activeMisconceptionIds.has(misconceptionId)
      ) {
        throw new EducationValidationError(
          `Active concept ${concept.conceptId} references archived misconception: ${misconceptionId}`,
        );
      }
    }
    for (const problemId of concept.recommendedProblemIds) {
      assertReference(
        problemId,
        problemIds,
        `Concept ${concept.conceptId} references missing problem`,
      );
      if (concept.status === "active" && !activeProblemIds.has(problemId)) {
        throw new EducationValidationError(
          `Active concept ${concept.conceptId} references archived problem: ${problemId}`,
        );
      }
    }
    for (const relatedConceptId of [
      ...concept.relatedConcepts,
      ...concept.nextConceptIds,
    ]) {
      if (conceptIds.has(relatedConceptId)) continue;
      if (relatedConceptId.startsWith("external:")) continue;
      throw new EducationValidationError(
        `Concept ${concept.conceptId} references missing concept: ${relatedConceptId}`,
      );
    }
  }

  for (const problem of problems) {
    if (problem.targetMisconceptionIds.length === 0) {
      throw new EducationValidationError(
        `Problem ${problem.problemId} has no target misconceptions.`,
      );
    }
    if (problem.transferProblemIds.length === 0) {
      throw new EducationValidationError(
        `Problem ${problem.problemId} has no transfer problems.`,
      );
    }
    for (const conceptId of problem.requiredConceptIds) {
      assertReference(
        conceptId,
        conceptIds,
        `Problem ${problem.problemId} references missing concept`,
      );
      if (problem.status === "active" && !activeConceptIds.has(conceptId)) {
        throw new EducationValidationError(
          `Active problem ${problem.problemId} references archived concept: ${conceptId}`,
        );
      }
    }
    for (const misconceptionId of problem.targetMisconceptionIds) {
      assertReference(
        misconceptionId,
        misconceptionIds,
        `Problem ${problem.problemId} references missing misconception`,
      );
      if (
        problem.status === "active" &&
        !activeMisconceptionIds.has(misconceptionId)
      ) {
        throw new EducationValidationError(
          `Active problem ${problem.problemId} references archived misconception: ${misconceptionId}`,
        );
      }
    }
    assertReference(
      problem.rubricId,
      activeRubricIds,
      `Problem ${problem.problemId} references missing rubric`,
    );
    for (const transferProblemId of problem.transferProblemIds) {
      if (transferProblemId === problem.problemId) {
        throw new EducationValidationError(
          `Problem ${problem.problemId} references itself as transfer.`,
        );
      }
      assertReference(
        transferProblemId,
        problemIds,
        `Problem ${problem.problemId} references missing transfer problem`,
      );
      const transferProblem = problems.find(
        (candidate) => candidate.problemId === transferProblemId,
      );
      if (!transferProblem) continue;
      const overlaps = transferProblem.requiredConceptIds.some((conceptId) =>
        problem.requiredConceptIds.includes(conceptId),
      );
      if (!overlaps) {
        throw new EducationValidationError(
          `Problem ${problem.problemId} transfer ${transferProblemId} has no meaningful concept overlap.`,
        );
      }
      if (transferProblem.transferProblemIds.includes(problem.problemId)) {
        throw new EducationValidationError(
          `Problem ${problem.problemId} and ${transferProblemId} form an unapproved circular transfer loop.`,
        );
      }
    }
  }

  for (const misconception of misconceptions) {
    for (const conceptId of misconception.conceptIds) {
      assertReference(
        conceptId,
        conceptIds,
        `Misconception ${misconception.misconceptionId} references missing concept`,
      );
    }
    for (const template of misconception.verificationQuestionTemplates) {
      if (template.misconceptionId !== misconception.misconceptionId) {
        throw new EducationValidationError(
          `Template ${template.templateId} is nested under the wrong misconception.`,
        );
      }
      if (template.revealsAnswer) {
        const highLevelReveal = misconception.interventionLadder.some(
          (intervention) =>
            intervention.level === 8 && intervention.revealsFullAnswer,
        );
        if (!highLevelReveal) {
          throw new EducationValidationError(
            `Template ${template.templateId} reveals an answer without level 8 reconstruction.`,
          );
        }
      }
    }
    const levels = misconception.interventionLadder.map(
      (intervention) => intervention.level,
    );
    const firstLevel = levels[0];
    if (firstLevel === undefined || firstLevel > 3) {
      throw new EducationValidationError(
        `Misconception ${misconception.misconceptionId} ladder does not begin with low support.`,
      );
    }
    for (let index = 1; index < levels.length; index += 1) {
      const previousLevel = levels[index - 1];
      const currentLevel = levels[index];
      if (previousLevel === undefined || currentLevel === undefined) continue;
      if (currentLevel < previousLevel) {
        throw new EducationValidationError(
          `Misconception ${misconception.misconceptionId} ladder levels are not ordered.`,
        );
      }
    }
    for (const intervention of misconception.interventionLadder) {
      if (intervention.level === 1 && intervention.revealsPartialAnswer) {
        throw new EducationValidationError(
          `Level 1 intervention ${intervention.interventionId} reveals a partial answer.`,
        );
      }
      if (intervention.level < 8 && intervention.revealsFullAnswer) {
        throw new EducationValidationError(
          `Intervention ${intervention.interventionId} reveals full answer below level 8.`,
        );
      }
      if (intervention.revealsFullAnswer && intervention.level !== 8) {
        throw new EducationValidationError(
          `Full reconstruction must be level 8: ${intervention.interventionId}`,
        );
      }
    }
  }

  const requiredDimensionIds = [
    "observationAccuracy",
    "relationshipType",
    "evidenceUse",
    "ruleFormation",
    "formalRepresentation",
    "uncertaintyAwareness",
    "transfer",
    "supportDependence",
  ] as const;
  for (const rubric of rubrics) {
    for (const dimensionId of requiredDimensionIds) {
      if (
        !rubric.dimensions.some(
          (dimension) => dimension.dimensionId === dimensionId,
        )
      ) {
        throw new EducationValidationError(
          `Rubric ${rubric.rubricId} missing dimension ${dimensionId}.`,
        );
      }
    }
  }

  for (const evaluationCase of evaluationCases) {
    assertReference(
      evaluationCase.problemId,
      problemIds,
      `Evaluation case ${evaluationCase.caseId} references missing problem`,
    );
    for (const misconceptionId of evaluationCase.expectedTopMisconceptionIds) {
      assertReference(
        misconceptionId,
        misconceptionIds,
        `Evaluation case ${evaluationCase.caseId} references missing misconception`,
      );
    }
    if (!approachIdSchema.safeParse(evaluationCase.selectedApproach).success) {
      throw new EducationValidationError(
        `Evaluation case ${evaluationCase.caseId} references unknown approach: ${evaluationCase.selectedApproach}`,
      );
    }
  }

  const reviewedEvaluationCaseCount = evaluationCases.filter(
    (evaluationCase) => evaluationCase.reviewStatus === "reviewed",
  ).length;
  if (reviewedEvaluationCaseCount < 25) {
    throw new EducationValidationError(
      `Expected at least 25 reviewed evaluation cases; found ${reviewedEvaluationCaseCount}.`,
    );
  }

  return {
    dataset,
    summary: {
      conceptCount: concepts.length,
      problemCount: problems.length,
      misconceptionCount: misconceptions.length,
      verificationTemplateCount: misconceptions.reduce(
        (total, misconception) =>
          total + misconception.verificationQuestionTemplates.length,
        0,
      ),
      interventionCount: misconceptions.reduce(
        (total, misconception) =>
          total + misconception.interventionLadder.length,
        0,
      ),
      rubricCount: rubrics.length,
      evaluationCaseCount: evaluationCases.length,
      reviewedEvaluationCaseCount,
    } satisfies EducationValidationSummary,
  };
}
