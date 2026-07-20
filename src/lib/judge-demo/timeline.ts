import { judgeScenes } from "./scenes";

export const guidedDemoTotalMs = judgeScenes.reduce(
  (total, scene) => total + scene.durationMs,
  0,
);

export function getSceneIndexById(sceneId: string) {
  const index = judgeScenes.findIndex((scene) => scene.id === sceneId);
  return index >= 0 ? index : 0;
}

export function getNextSceneIndex(currentIndex: number) {
  return Math.min(currentIndex + 1, judgeScenes.length - 1);
}

export function getPreviousSceneIndex(currentIndex: number) {
  return Math.max(currentIndex - 1, 0);
}
