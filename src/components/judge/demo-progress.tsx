"use client";

import { judgeScenes } from "@/lib/judge-demo";

interface DemoProgressProps {
  sceneIndex: number;
}

export function DemoProgress({ sceneIndex }: DemoProgressProps) {
  return (
    <div aria-label="Judge demo progress" className="space-y-3">
      <div className="flex items-center justify-between text-sm font-semibold text-text-muted">
        <span>
          Scene {sceneIndex + 1} of {judgeScenes.length}
        </span>
        <span>{judgeScenes[sceneIndex]?.timeRange}</span>
      </div>
      <div className="grid grid-cols-10 gap-1">
        {judgeScenes.map((scene, index) => (
          <div
            key={scene.id}
            className={
              index <= sceneIndex
                ? "h-2 rounded-full bg-reasoning"
                : "h-2 rounded-full bg-surface-inset"
            }
          />
        ))}
      </div>
    </div>
  );
}
