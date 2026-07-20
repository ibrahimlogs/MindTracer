import { getProblemById } from "@/data/education";
import type { MockTransferResult } from "@/types/demo-learning";

export const demoTransferProblemRecord = getProblemById("study_score_001");

if (demoTransferProblemRecord.dataRepresentation.type !== "table") {
  throw new Error(
    `Demo transfer problem must use a table representation: ${demoTransferProblemRecord.problemId}`,
  );
}

export const demoTransfer: MockTransferResult = {
  problemId: demoTransferProblemRecord.problemId,
  context: demoTransferProblemRecord.context,
  columns: demoTransferProblemRecord.dataRepresentation.columns,
  rows: demoTransferProblemRecord.dataRepresentation.rows,
  question: demoTransferProblemRecord.question,
  correctAnswer: demoTransferProblemRecord.correctAnswer,
  explanation: demoTransferProblemRecord.solutionModel,
  rubricId: demoTransferProblemRecord.rubricId,
};
