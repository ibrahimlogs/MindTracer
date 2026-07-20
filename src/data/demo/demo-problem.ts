import { getProblemById } from "@/data/education";
import type { DemoProblem } from "@/types/demo-learning";
import type { ProblemRecord } from "@/types/problem";

export const demoProblemRecord = getProblemById("ads_sales_001");

function tableProblemToDemoProblem(problem: ProblemRecord): DemoProblem {
  if (problem.dataRepresentation.type !== "table") {
    throw new Error(
      `Demo problem must use a table representation: ${problem.problemId}`,
    );
  }

  return {
    problemId: problem.problemId,
    context: problem.context,
    columns: problem.dataRepresentation.columns,
    rows: problem.dataRepresentation.rows,
    question: problem.question,
    correctAnswer: problem.correctAnswer,
    rubricId: problem.rubricId,
    targetMisconceptionIds: problem.targetMisconceptionIds,
    transferProblemIds: problem.transferProblemIds,
    interventionVisualizerConfig: problem.interventionVisualizerConfig,
  };
}

export const demoProblem: DemoProblem =
  tableProblemToDemoProblem(demoProblemRecord);
