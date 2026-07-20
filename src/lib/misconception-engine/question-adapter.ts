import type {
  ProblemRecord,
  VerificationQuestionTemplate,
} from "@/types/education";
import type { VerificationQuestionOutput } from "./schemas.ts";

function tableValues(problem: ProblemRecord) {
  if (problem.dataRepresentation.type !== "table") {
    return {
      inputColumn: "input",
      outputColumn: "output",
      inputA: "1",
      inputB: "2",
      inputValue: "2",
      rowA: "the first row",
      rowB: "the second row",
    };
  }

  const [inputColumn, outputColumn] = problem.dataRepresentation.columns;
  const first = problem.dataRepresentation.rows[0];
  const second = problem.dataRepresentation.rows[1];
  return {
    inputColumn,
    outputColumn,
    inputA: String(first?.input ?? 1),
    inputB: String(second?.input ?? 2),
    inputValue: String(second?.input ?? 2),
    rowA: `${inputColumn} = ${first?.input ?? 1}`,
    rowB: `${inputColumn} = ${second?.input ?? 2}`,
  };
}

export function adaptQuestion(
  template: VerificationQuestionTemplate,
  problem: ProblemRecord,
  targetHypothesisIds: readonly string[],
): VerificationQuestionOutput {
  const values = tableValues(problem);
  let question = template.promptTemplate;
  for (const [key, value] of Object.entries(values)) {
    question = question.replaceAll(`{${key}}`, value);
  }

  if (
    problem.problemId === "ads_sales_001" &&
    template.templateId === "vq_direction_without_rate_1"
  ) {
    question =
      "When advertising increases from 1 to 2, how much does sales increase?";
  }
  if (
    problem.problemId === "ads_sales_001" &&
    template.templateId === "vq_additive_as_multiplicative_1"
  ) {
    question =
      "If sales were exactly double advertising, what should sales be when advertising is 2? Does that match the table?";
  }

  return {
    templateId: template.templateId,
    question,
    answerFormat: template.answerFormat,
    verificationGoal: template.goal,
    targetHypothesisIds: [...targetHypothesisIds],
    revealsAnswer: template.revealsAnswer,
    adaptationSource: "deterministic",
  };
}
