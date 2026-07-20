import { DeterministicInterventionSelector } from "./deterministic-selector.ts";
import type { InterventionSelector } from "./selector.ts";
import { getServerEnv } from "@/lib/validation/env";

export type InterventionSelectorMode = "deterministic" | "openai" | "fallback";
export type InterventionAdapterMode = "deterministic" | "openai" | "fallback";

export function getInterventionEngineConfig() {
  const env = getServerEnv();
  return {
    selectorMode: env.INTERVENTION_SELECTOR_MODE,
    adapterMode: env.INTERVENTION_ADAPTER_MODE,
    hasApiKey: Boolean(env.OPENAI_API_KEY),
  };
}

export function createInterventionSelector(): InterventionSelector {
  return new DeterministicInterventionSelector();
}
