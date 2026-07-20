import { DeterministicReasoningComparator } from "./comparator.ts";
import type { ReasoningDeltaEvaluator } from "./evaluator.ts";
import { FixedRubricEngine } from "./rubric-engine.ts";
import type { ReasoningDeltaInput, OverallChange } from "./schemas.ts";
import { validateReasoningDeltaOutput } from "./safety.ts";

export class DeterministicReasoningDeltaEvaluator
  implements ReasoningDeltaEvaluator
{
  async evaluate(input: ReasoningDeltaInput) {
    new FixedRubricEngine().validateRubric(input);
    const dimensions = new DeterministicReasoningComparator().compare(input);
    const improvedCount = dimensions.filter((dimension) =>
      ["improved", "corrected", "preserved"].includes(dimension.changeStatus),
    ).length;
    const regressed = dimensions.some(
      (dimension) => dimension.changeStatus === "regressed",
    );
    const overallChange: OverallChange = regressed
      ? "regressed"
      : improvedCount >= 5
        ? "improved"
        : improvedCount >= 3
          ? "partially_improved"
          : "unchanged";
    const remainingGaps = dimensions
      .filter((dimension) => dimension.dimensionId === "remaining_gap")
      .map((dimension) => dimension.afterEvidence);

    return validateReasoningDeltaOutput({
      preservedUnderstanding:
        input.initialAnalysis.safeLearnerSummary.preservedUnderstanding,
      correctedReasoning: dimensions
        .filter((dimension) => dimension.changeStatus === "corrected")
        .map((dimension) => dimension.conciseReason),
      newUnderstanding: dimensions
        .filter((dimension) => dimension.changeStatus === "improved")
        .slice(0, 3)
        .map((dimension) => dimension.afterEvidence),
      remainingGaps:
        remainingGaps.length > 0
          ? remainingGaps
          : ["More problems are needed before broad claims are made."],
      dimensions,
      overallChange,
      supportSummary: {
        interventionCount: input.supportUsage.interventionCount,
        highestLevelUsed: input.supportUsage.highestLevelUsed,
        supportLabel:
          input.interventions.at(-1)?.supportLabel ??
          "No intervention recorded",
        independenceAdjustment: input.supportUsage.fullAnswerRevealed
          ? "Full reconstruction reduces independence claims."
          : "Support was bounded before retry.",
      },
      transferReady:
        overallChange !== "unchanged" && overallChange !== "regressed",
      transferReadinessReason:
        "The retry includes better evidence and a repeatable rule, so a different context can be tried without hints.",
      learnerFacingSummary:
        "Your retry shows a clearer use of evidence than the first attempt. MindTrace will now check whether the idea transfers to a new context.",
      internalNotes: ["Deterministic prototype reasoning-delta evaluation."],
    });
  }
}
