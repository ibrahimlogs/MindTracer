import type {
  TransferEvaluationInput,
  TransferEvaluationOutput,
} from "./schemas.ts";

export interface TransferEvaluator {
  evaluate(input: TransferEvaluationInput): Promise<TransferEvaluationOutput>;
}
