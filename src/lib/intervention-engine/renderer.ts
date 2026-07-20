import type { InterventionFamily } from "./schemas.ts";
import type { ProblemRecord } from "@/types/education";

export interface InterventionRenderer {
  visualizerConfig(input: {
    family: InterventionFamily;
    level: number;
    problem: ProblemRecord;
  }): {
    visualizerType:
      | "none"
      | "highlighted_table"
      | "consecutive_difference"
      | "additive_multiplicative_contrast"
      | "slope_intercept_bridge"
      | "variable_role_map"
      | "arithmetic_check"
      | "evidence_comparison";
    problemId: string;
    rows: { input: number; output: number }[];
    inputLabel: string;
    outputLabel: string;
    claim: string | null;
    predictedValue: string | null;
    observedValue: string | null;
    showOffset: boolean;
    showFinalEquation: boolean;
    caption: string;
    reducedMotionSummary: string;
  };
}

function table(problem: ProblemRecord) {
  if (problem.dataRepresentation.type !== "table") {
    return {
      rows: [] as { input: number; output: number }[],
      inputLabel: "Input",
      outputLabel: "Output",
    };
  }
  const [inputLabel, outputLabel] = problem.dataRepresentation.columns;
  return {
    rows: [...problem.dataRepresentation.rows],
    inputLabel,
    outputLabel,
  };
}

export class DeterministicInterventionRenderer implements InterventionRenderer {
  visualizerConfig(input: {
    family: InterventionFamily;
    level: number;
    problem: ProblemRecord;
  }) {
    const data = table(input.problem);
    const typeByFamily = {
      consecutive_difference: "consecutive_difference",
      additive_multiplicative_contrast: "additive_multiplicative_contrast",
      slope_intercept_bridge: "slope_intercept_bridge",
      variable_role_check: "variable_role_map",
      arithmetic_check: "arithmetic_check",
      evidence_comparison: "evidence_comparison",
      none: "evidence_comparison",
    } as const;
    const second = data.rows[1];
    return {
      visualizerType: typeByFamily[input.family],
      problemId: input.problem.problemId,
      rows: data.rows,
      inputLabel: data.inputLabel,
      outputLabel: data.outputLabel,
      claim:
        input.family === "additive_multiplicative_contrast"
          ? `${data.outputLabel} = ${data.inputLabel} × 2`
          : null,
      predictedValue:
        input.family === "additive_multiplicative_contrast" && second
          ? String(second.input * 2)
          : null,
      observedValue:
        input.family === "additive_multiplicative_contrast" && second
          ? String(second.output)
          : null,
      showOffset: input.level >= 5,
      showFinalEquation: input.level >= 8,
      caption:
        input.family === "additive_multiplicative_contrast"
          ? "Compare the claim prediction with the observed table value."
          : input.family === "consecutive_difference"
            ? "The input changes by 1 each time, while the output changes by 2."
            : "Compare the evidence before choosing the next reasoning step.",
      reducedMotionSummary:
        "Reduced-motion view shows all evidence labels at once in the same comparison order.",
    };
  }
}
