import type {
  HypothesisRankingInput,
  HypothesisRankingOutput,
} from "./schemas.ts";

export interface MisconceptionRanker {
  rank(input: HypothesisRankingInput): Promise<HypothesisRankingOutput>;
}
