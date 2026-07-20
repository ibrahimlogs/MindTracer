import { SessionEngineError } from "@/lib/session-engine";

import type { RubricEngine } from "./evaluator.ts";
import type { ReasoningDeltaInput, RubricDimensionId } from "./schemas.ts";

const expectedDimensions: readonly RubricDimensionId[] = [
  "observation_accuracy",
  "relationship_type",
  "evidence_use",
  "rule_formation",
  "formal_representation",
  "uncertainty_awareness",
  "independence",
  "remaining_gap",
];

const datasetDimensionMap: Record<string, RubricDimensionId> = {
  observationAccuracy: "observation_accuracy",
  relationshipType: "relationship_type",
  evidenceUse: "evidence_use",
  ruleFormation: "rule_formation",
  formalRepresentation: "formal_representation",
  uncertaintyAwareness: "uncertainty_awareness",
  supportDependence: "independence",
  transfer: "remaining_gap",
};

export class FixedRubricEngine implements RubricEngine {
  validateRubric(input: ReasoningDeltaInput) {
    const available = new Set(
      input.rubric.dimensions.map(
        (dimension) => datasetDimensionMap[dimension.dimensionId],
      ),
    );
    const missing = expectedDimensions.filter(
      (dimensionId) => !available.has(dimensionId),
    );
    if (missing.length > 0) {
      throw new SessionEngineError(
        "INVALID_STATE_TRANSITION",
        `Rubric ${input.rubric.rubricId} is missing fixed dimensions: ${missing.join(", ")}.`,
      );
    }
  }
}
