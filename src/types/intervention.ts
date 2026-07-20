export type InterventionLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type VisualizerType =
  | "none"
  | "highlighted_table"
  | "consecutive_difference"
  | "additive_multiplicative_contrast"
  | "slope_intercept_bridge"
  | "variable_role_map"
  | "arithmetic_check"
  | "transfer_comparison";

export interface InterventionRecord {
  interventionId: string;
  level: InterventionLevel;
  type: string;
  title: string;
  learnerFacingTemplate: string;
  instructionalGoal: string;
  visualizerType: VisualizerType;
  allowedWhen: readonly string[];
  escalationCondition: string;
  revealsPartialAnswer: boolean;
  revealsFullAnswer: boolean;
}
