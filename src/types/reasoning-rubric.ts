export type RubricState =
  | "strong"
  | "developing"
  | "missing"
  | "incorrect"
  | "insufficient_evidence";

export interface RubricDimension {
  dimensionId:
    | "observationAccuracy"
    | "relationshipType"
    | "evidenceUse"
    | "ruleFormation"
    | "formalRepresentation"
    | "uncertaintyAwareness"
    | "transfer"
    | "supportDependence";
  title: string;
  description: string;
  allowedStates: readonly RubricState[];
  evaluationGuidance: string;
  positiveEvidence: readonly string[];
  negativeEvidence: readonly string[];
}

export interface ReasoningRubric {
  rubricId: string;
  title: string;
  description: string;
  dimensions: readonly RubricDimension[];
}
