import type { InterventionEscalation, InterventionLevel } from "./schemas.ts";

export interface InterventionEscalationPolicy {
  next(input: {
    currentLevel: InterventionLevel;
    maximumPermittedLevel: InterventionLevel;
    previousInterventionId: string;
    reasonCode: InterventionEscalation["reasonCode"];
    triggerSource: InterventionEscalation["triggerSource"];
  }): InterventionEscalation;
}

export class DeterministicInterventionEscalationPolicy
  implements InterventionEscalationPolicy
{
  next(input: {
    currentLevel: InterventionLevel;
    maximumPermittedLevel: InterventionLevel;
    previousInterventionId: string;
    reasonCode: InterventionEscalation["reasonCode"];
    triggerSource: InterventionEscalation["triggerSource"];
  }) {
    const toLevel = Math.min(
      input.currentLevel + 1,
      input.maximumPermittedLevel,
    ) as InterventionLevel;
    return {
      fromLevel: input.currentLevel,
      toLevel,
      reasonCode: input.reasonCode,
      triggerSource: input.triggerSource,
      previousInterventionId: input.previousInterventionId,
      timestamp: new Date().toISOString(),
    };
  }
}
