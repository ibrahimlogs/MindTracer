"use client";

import { judgeScenes } from "@/lib/judge-demo";

interface DemoProgressProps {
  sceneIndex: number;
}

export function DemoProgress({ sceneIndex }: DemoProgressProps) {
  return (
    <div aria-label="Judge demo progress" className="space-y-3">
      <div className="flex items-center justify-between font-mono text-[0.68rem] tracking-[0.24em] text-text-muted uppercase">
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
                ? "h-1.5 rounded-full bg-reasoning"
                : "h-1.5 rounded-full bg-surface-soft"
            }
          />
        ))}
      </div>
    </div>
  );
}
