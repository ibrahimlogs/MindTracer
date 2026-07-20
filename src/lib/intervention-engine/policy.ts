import type {
  InterventionEngineInput,
  InterventionFamily,
  InterventionLevel,
} from "./schemas.ts";

export interface InterventionPolicy {
  resolveFamily(input: {
    misconceptionId: string | null;
    recommendedFamily: InterventionFamily;
  }): InterventionFamily;
  startingLevel(input: InterventionEngineInput): InterventionLevel;
}

export function familyForMisconception(
  misconceptionId: string | null,
  fallback: InterventionFamily,
): InterventionFamily {
  if (!misconceptionId)
    return fallback === "none" ? "evidence_comparison" : fallback;
  if (
    [
      "direction_without_rate",
      "approximate_pattern_guess",
      "total_vs_change",
    ].includes(misconceptionId)
  ) {
    return "consecutive_difference";
  }
  if (
    [
      "additive_as_multiplicative",
      "intercept_ignored",
      "one_row_equation_guess",
    ].includes(misconceptionId)
  ) {
    return "additive_multiplicative_contrast";
  }
  if (
    [
      "slope_found_intercept_missing",
      "equation_memorized_without_meaning",
    ].includes(misconceptionId)
  ) {
    return "slope_intercept_bridge";
  }
  if (misconceptionId === "x_y_reversed") return "variable_role_check";
  if (misconceptionId === "arithmetic_only_error") return "arithmetic_check";
  return fallback === "none" ? "evidence_comparison" : fallback;
}

export class DeterministicInterventionPolicy implements InterventionPolicy {
  resolveFamily(input: {
    misconceptionId: string | null;
    recommendedFamily: InterventionFamily;
  }) {
    return familyForMisconception(
      input.misconceptionId,
      input.recommendedFamily,
    );
  }

  startingLevel(input: InterventionEngineInput) {
    if (input.verifiedState?.status === "arithmetic_only") return 1;
    if (input.verifiedState?.resolution === "unresolved") return 2;
    return Math.min(
      Math.max(input.recommendedStartingLevel, 2),
      input.maximumPermittedLevel,
    ) as InterventionLevel;
  }
}
