import { describe, expect, it } from "vitest";

import {
  cachedJudgeResponses,
  clampJudgeSceneIndex,
  guidedDemoTotalMs,
  judgeScenes,
} from "@/lib/judge-demo";

describe("judge demo", () => {
  it("contains a two-minute guided story with required learner paths", () => {
    expect(guidedDemoTotalMs).toBeGreaterThanOrEqual(110_000);
    expect(guidedDemoTotalMs).toBeLessThanOrEqual(140_000);
    expect(judgeScenes.some((scene) => scene.learner === "learner-a")).toBe(
      true,
    );
    expect(judgeScenes.some((scene) => scene.learner === "learner-b")).toBe(
      true,
    );
    expect(judgeScenes.some((scene) => scene.kind === "transfer")).toBe(true);
    expect(judgeScenes.some((scene) => scene.kind === "closing")).toBe(true);
  });

  it("keeps reviewed cached responses explicit and safe", () => {
    expect(cachedJudgeResponses).toHaveLength(12);
    expect(
      cachedJudgeResponses.every(
        (response) =>
          response.source === "cached_demo" &&
          !response.safety.prohibitedLanguage &&
          !response.safety.answerLeakedBeforeIntervention,
      ),
    ).toBe(true);
  });

  it("clamps restored scene indexes", () => {
    expect(clampJudgeSceneIndex(-4)).toBe(0);
    expect(clampJudgeSceneIndex(1000)).toBe(judgeScenes.length - 1);
  });
});
