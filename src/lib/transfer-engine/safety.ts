import {
  transferEvaluationOutputSchema,
  type TransferEvaluationOutput,
} from "./schemas.ts";

const prohibited = ["iq", "weak learner", "bad at math", "%", "mastery"];

export function validateTransferEvaluationOutput(
  output: TransferEvaluationOutput,
) {
  const parsed = transferEvaluationOutputSchema.parse(output);
  const text = JSON.stringify(parsed).toLowerCase();
  const blocked = prohibited.find((term) => text.includes(term));
  if (blocked) {
    throw new Error(`Transfer output contains prohibited language: ${blocked}`);
  }
  if (
    parsed.transferStatus === "successful" &&
    (!parsed.answerCorrect || !parsed.conceptApplied)
  ) {
    throw new Error(
      "Successful transfer requires answer and concept evidence.",
    );
  }
  return parsed;
}
