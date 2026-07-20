import type { JudgeDemoScene } from "./contracts";

export function createJudgeAnalyticsEvent(scene: JudgeDemoScene) {
  return {
    event: "judge_scene_viewed",
    sceneId: scene.id,
    source: scene.source,
    learner: scene.learner,
    timestamp: new Date().toISOString(),
  };
}
