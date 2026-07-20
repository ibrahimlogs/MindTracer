import { AiReasoningError } from "@/lib/ai/reasoning";
import type {
  InterventionAdapterOutput,
  InterventionSelection,
} from "./schemas.ts";

export interface InterventionContentAdapter {
  adapt(selection: InterventionSelection): Promise<InterventionAdapterOutput>;
}

export class OpenAIInterventionAdapter implements InterventionContentAdapter {
  constructor(private readonly hasApiKey: boolean) {}

  async adapt(selection: InterventionSelection) {
    if (!this.hasApiKey) {
      throw new AiReasoningError(
        "AI_NOT_CONFIGURED",
        "OpenAI intervention adaptation requires OPENAI_API_KEY.",
        false,
      );
    }
    return {
      interventionRecordId: selection.interventionRecordId,
      title: selection.title,
      preservedUnderstanding: selection.preservedUnderstanding,
      learnerFacingContent: selection.learnerFacingContent,
      visualCaption: selection.visualizerConfig.caption,
      adaptationSource: "openai",
    } satisfies InterventionAdapterOutput;
  }
}
