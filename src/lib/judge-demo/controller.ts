import type { JudgeDemoMode } from "./contracts";
import { judgeScenes } from "./scenes";

export interface JudgeControllerSnapshot {
  mode: JudgeDemoMode;
  sceneIndex: number;
  isPlaying: boolean;
  playback: "normal" | "fast";
  focus: "both" | "learner-a" | "learner-b";
}

export const initialJudgeController: JudgeControllerSnapshot = {
  mode: "guided",
  sceneIndex: 0,
  isPlaying: false,
  playback: "normal",
  focus: "both",
};

export function clampJudgeSceneIndex(index: number) {
  return Math.min(Math.max(index, 0), judgeScenes.length - 1);
}

export function getJudgeSceneProgress(sceneIndex: number) {
  return Math.round(((sceneIndex + 1) / judgeScenes.length) * 100);
}
