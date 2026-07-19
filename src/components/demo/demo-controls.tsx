"use client";

import { Pause, Play, RotateCcw, StepBack, StepForward } from "lucide-react";

import { Button } from "@/components/ui/button";
import { learningStages, stageLabels } from "@/lib/demo-learning/stages";
import type { DemoSpeed, LearningStage } from "@/types/demo-learning";

interface DemoControlsProps {
  autoPlay: boolean;
  demoSpeed: DemoSpeed;
  onPrevious: () => void;
  onNext: () => void;
  onRestart: () => void;
  onAutoPlay: () => void;
  onPause: () => void;
  onSpeed: (speed: DemoSpeed) => void;
  onJump: (stage: LearningStage) => void;
}

export function DemoControls({
  autoPlay,
  demoSpeed,
  onPrevious,
  onNext,
  onRestart,
  onAutoPlay,
  onPause,
  onSpeed,
  onJump,
}: DemoControlsProps) {
  return (
    <details className="rounded-xl border border-border bg-surface-elevated p-3">
      <summary className="cursor-pointer text-sm font-medium text-text-primary">
        Demo controls
      </summary>
      <div className="mt-4 grid gap-3 md:grid-cols-[auto_auto_1fr] md:items-center">
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={onPrevious}>
            <StepBack className="size-4" aria-hidden="true" />
            Previous
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onNext}>
            <StepForward className="size-4" aria-hidden="true" />
            Next
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onRestart}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Restart
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={autoPlay ? onPause : onAutoPlay}
          >
            {autoPlay ? (
              <Pause className="size-4" aria-hidden="true" />
            ) : (
              <Play className="size-4" aria-hidden="true" />
            )}
            {autoPlay ? "Pause" : "Auto-play"}
          </Button>
        </div>
        <div className="flex gap-1 rounded-md border border-border bg-surface-inset p-1">
          {(["slow", "normal", "fast"] as const).map((speed) => (
            <button
              key={speed}
              type="button"
              className="rounded px-2 py-1 text-xs text-text-secondary aria-pressed:bg-surface-soft aria-pressed:text-text-primary"
              aria-pressed={demoSpeed === speed}
              onClick={() => onSpeed(speed)}
            >
              {speed}
            </button>
          ))}
        </div>
        <label className="text-xs text-text-muted">
          Jump to stage
          <select
            className="mt-1 w-full rounded-md border border-border bg-surface-inset px-3 py-2 text-sm text-text-primary"
            onChange={(event) => onJump(event.target.value as LearningStage)}
            defaultValue=""
          >
            <option value="" disabled>
              Choose stage
            </option>
            {learningStages.map((stage) => (
              <option key={stage} value={stage}>
                {stageLabels[stage]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </details>
  );
}
