export type ConceptStatus = "active" | "experimental" | "archived";

export interface ConceptRecord {
  conceptId: string;
  familyId: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  prerequisites: readonly string[];
  relatedConcepts: readonly string[];
  careerConnections: readonly string[];
  learningObjectives: readonly string[];
  intuitiveExplanation: string;
  visualExplanation: string;
  verbalExplanation: string;
  formalExplanation: string;
  programmingConnection: string;
  commonMisconceptionIds: readonly string[];
  recommendedProblemIds: readonly string[];
  nextConceptIds: readonly string[];
  status: ConceptStatus;
}
