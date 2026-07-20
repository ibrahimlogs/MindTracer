import type {
  InterventionEngineInput,
  InterventionSelection,
} from "./schemas.ts";

export interface InterventionSelector {
  select(input: InterventionEngineInput): Promise<InterventionSelection>;
}
