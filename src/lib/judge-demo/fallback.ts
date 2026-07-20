import type { CachedJudgeResponse } from "./contracts";

const cachedJudgeResponseSeeds = [
  {
    learner: "learner-a",
    artifact: "reasoning_extraction",
    summary: "Approximate growth noticed.",
  },
  {
    learner: "learner-a",
    artifact: "hypotheses",
    summary: "Direction without rate ranked first.",
  },
  {
    learner: "learner-a",
    artifact: "verification",
    summary: "Consecutive difference question selected.",
  },
  {
    learner: "learner-a",
    artifact: "intervention",
    summary: "Smallest useful support: difference ladder.",
  },
  {
    learner: "learner-a",
    artifact: "delta",
    summary: "Shifted from approximate trend to repeated change.",
  },
  {
    learner: "learner-a",
    artifact: "transfer",
    summary: "Transferred constant-change reasoning.",
  },
  {
    learner: "learner-b",
    artifact: "reasoning_extraction",
    summary: "Direct multiplication rule inferred.",
  },
  {
    learner: "learner-b",
    artifact: "hypotheses",
    summary: "Starting offset ignored ranked first.",
  },
  {
    learner: "learner-b",
    artifact: "verification",
    summary: "Double-at-x=2 conflict question selected.",
  },
  {
    learner: "learner-b",
    artifact: "intervention",
    summary: "Smallest useful support: offset contrast.",
  },
  {
    learner: "learner-b",
    artifact: "delta",
    summary: "Shifted from direct multiplication to offset rule.",
  },
  {
    learner: "learner-b",
    artifact: "transfer",
    summary: "Transferred offset and change evidence.",
  },
] satisfies readonly Pick<
  CachedJudgeResponse,
  "learner" | "artifact" | "summary"
>[];

export const cachedJudgeResponses: readonly CachedJudgeResponse[] =
  cachedJudgeResponseSeeds.map(({ learner, artifact, summary }) => ({
    id: `${learner}-${artifact}`,
    learner,
    artifact,
    source: "cached_demo",
    schemaVersion: "judge-demo-v1",
    reviewedAt: "2026-07-20",
    summary,
    safety: {
      prohibitedLanguage: false,
      answerLeakedBeforeIntervention: false,
    },
  }));

export function getJudgeFallbackLabel(source: string) {
  if (source === "live_openai") return "Live analysis";
  if (source === "cached_demo") return "Cached demo fallback";
  if (source === "fallback") return "Safe explanatory fallback";
  return "Deterministic reviewed path";
}
