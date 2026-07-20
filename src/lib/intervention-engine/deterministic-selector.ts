import type { InterventionSelector } from "./selector.ts";
import { DeterministicInterventionEscalationPolicy } from "./escalation.ts";
import { DeterministicInterventionPolicy } from "./policy.ts";
import { DeterministicInterventionRenderer } from "./renderer.ts";
import {
  interventionAdapterPromptVersion,
  type InterventionEngineInput,
  type InterventionLevel,
  type InterventionSelection,
} from "./schemas.ts";
import { validateInterventionSelection } from "./safety.ts";
import type { InterventionRecord } from "@/types/education";

const labelByLevel: Record<InterventionLevel, string> = {
  1: "Small prompt",
  2: "Focused comparison",
  3: "Focused comparison",
  4: "Visual clue",
  5: "Concept reminder",
  6: "Worked example",
  7: "Worked example",
  8: "Full reconstruction",
};

function nearestRecord(
  ladder: readonly InterventionRecord[],
  level: InterventionLevel,
) {
  return (
    ladder.find((record) => record.level === level) ??
    [...ladder]
      .filter((record) => record.level <= level)
      .sort((left, right) => right.level - left.level)[0] ??
    ladder[0]
  );
}

function contentFor(
  input: InterventionEngineInput,
  record: InterventionRecord,
) {
  if (input.recommendedFamily === "consecutive_difference") {
    return "You correctly noticed that both values increase. Now compare how much each value changes from one row to the next.";
  }
  if (input.recommendedFamily === "additive_multiplicative_contrast") {
    return "You correctly noticed a strong relationship. Now test whether ‘double’ matches every row.";
  }
  if (input.recommendedFamily === "arithmetic_check") {
    return "Your reasoning idea can stay local here. Recheck the arithmetic step that connects your last two values.";
  }
  return record.learnerFacingTemplate;
}

export class DeterministicInterventionSelector implements InterventionSelector {
  async select(input: InterventionEngineInput): Promise<InterventionSelection> {
    const policy = new DeterministicInterventionPolicy();
    const family = policy.resolveFamily({
      misconceptionId: input.verifiedState?.confirmedMisconceptionId ?? null,
      recommendedFamily: input.recommendedFamily,
    });
    const familyInput = { ...input, recommendedFamily: family };
    const level = policy.startingLevel(familyInput);
    const record = nearestRecord(input.datasetLadder, level);
    if (!record) {
      throw new Error("No intervention record is available for this family.");
    }
    const renderer = new DeterministicInterventionRenderer();
    const visualizerConfig = renderer.visualizerConfig({
      family,
      level,
      problem: input.problem,
    });
    const previousHighest = input.previousInterventions.reduce(
      (current, item) => Math.max(current, item.level),
      0,
    );
    const escalation = input.learnerRequestedMoreHelp
      ? new DeterministicInterventionEscalationPolicy().next({
          currentLevel: previousHighest as InterventionLevel,
          maximumPermittedLevel: input.maximumPermittedLevel,
          previousInterventionId:
            input.previousInterventions.at(-1)?.id ??
            input.previousInterventions.at(-1)?.interventionRecordId ??
            record.interventionId,
          reasonCode: "LEARNER_REQUESTED_MORE_HELP",
          triggerSource: "learner",
        })
      : null;
    const selectedLevel = escalation?.toLevel ?? level;
    const escalated = escalation !== null && selectedLevel > level;
    const selection: InterventionSelection = {
      interventionRecordId:
        selectedLevel === record.level
          ? record.interventionId
          : `${record.interventionId}_level_${selectedLevel}`,
      family,
      level: selectedLevel,
      type:
        selectedLevel === 2
          ? "contrast_question"
          : selectedLevel === 4
            ? "animated_visual_clue"
            : record.type,
      title:
        family === "additive_multiplicative_contrast"
          ? "Check the multiplication claim"
          : family === "consecutive_difference"
            ? "Consecutive differences"
            : record.title,
      instructionalGoal: record.instructionalGoal,
      preservedUnderstanding:
        input.preservedUnderstanding.length > 0
          ? [...input.preservedUnderstanding].slice(0, 4)
          : ["You used evidence that MindTrace can compare."],
      learnerFacingContent: contentFor(input, record),
      visualizerType: visualizerConfig.visualizerType,
      visualizerConfig: {
        ...visualizerConfig,
        showOffset:
          family === "additive_multiplicative_contrast" && selectedLevel >= 5,
        showFinalEquation: selectedLevel >= 8,
      },
      revealsPartialAnswer: selectedLevel >= 3 || record.revealsPartialAnswer,
      revealsFullAnswer: selectedLevel >= 8 && record.revealsFullAnswer,
      escalationAvailable: selectedLevel < input.maximumPermittedLevel,
      nextAllowedLevel:
        selectedLevel < input.maximumPermittedLevel
          ? ((selectedLevel + 1) as InterventionLevel)
          : null,
      selectionSource: "deterministic",
      selectionReason: escalated
        ? `Escalated one level because ${escalation.reasonCode}.`
        : "Selected the lowest useful intervention after verification.",
      supportLabel: labelByLevel[selectedLevel],
      safetyValidation: {
        answerLeakageChecked: true,
        passed: true,
        notes: ["Problem-aware answer leakage guard passed."],
      },
    };
    return validateInterventionSelection(selection, input.problem);
  }
}

export const deterministicInterventionMetadata = {
  promptVersion: interventionAdapterPromptVersion,
};
