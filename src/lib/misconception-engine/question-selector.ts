import type {
  VerificationQuestionOutput,
  VerificationQuestionSelectionInput,
} from "./schemas.ts";
import { adaptQuestion } from "./question-adapter.ts";
import { validateVerificationQuestionSafety } from "./safety.ts";

export interface VerificationQuestionSelector {
  select(input: VerificationQuestionSelectionInput): VerificationQuestionOutput;
}

export class DeterministicVerificationQuestionSelector
  implements VerificationQuestionSelector
{
  select(input: VerificationQuestionSelectionInput) {
    const targetIds = input.decision.targetHypothesisIds.length
      ? input.decision.targetHypothesisIds
      : input.ranking.hypotheses
          .slice(0, 1)
          .map((item) => item.misconceptionId);

    const templates = input.candidateRecords
      .filter((record) => targetIds.includes(record.misconceptionId))
      .flatMap((record) => record.verificationQuestionTemplates)
      .filter((template) => !template.revealsAnswer);

    const preferred =
      templates.find((template) =>
        input.decision.verificationGoal
          .toLowerCase()
          .includes(template.goal.toLowerCase().slice(0, 12)),
      ) ?? templates[0];

    if (!preferred) {
      return validateVerificationQuestionSafety({
        templateId: "verification_unavailable",
        question: "What table evidence did you use for your rule?",
        answerFormat: "short_text",
        verificationGoal: input.decision.verificationGoal,
        targetHypothesisIds: targetIds,
        revealsAnswer: false,
        adaptationSource: "deterministic",
      });
    }

    return validateVerificationQuestionSafety(
      adaptQuestion(preferred, input.problem, targetIds),
    );
  }
}
