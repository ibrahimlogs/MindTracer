"use client";

import {
  FastForward,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  StepBack,
  StepForward,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { JudgeDemoMode } from "@/lib/judge-demo";

interface DemoControlsProps {
  mode: JudgeDemoMode;
  isPlaying: boolean;
  playback: "normal" | "fast";
  onModeChange: (mode: JudgeDemoMode) => void;
  onPlayPause: () => void;
  onRestart: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
  onPlaybackChange: () => void;
}

export function DemoControls({
  mode,
  isPlaying,
  playback,
  onModeChange,
  onPlayPause,
  onRestart,
  onPrevious,
  onNext,
  onSkip,
  onPlaybackChange,
}: DemoControlsProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface-elevated/90 p-3 shadow-2xl shadow-black/20"
      aria-label="Judge demo controls"
    >
      <Button size="sm" onClick={onPlayPause}>
        {isPlaying ? (
          <Pause className="size-4" aria-hidden="true" />
        ) : (
          <Play className="size-4" aria-hidden="true" />
        )}
        {isPlaying ? "Pause" : "Play"}
      </Button>
      <Button variant="outline" size="sm" onClick={onRestart}>
        <RotateCcw className="size-4" aria-hidden="true" />
        Restart
      </Button>
      <Button variant="ghost" size="sm" onClick={onPrevious}>
        <StepBack className="size-4" aria-hidden="true" />
        Previous scene
      </Button>
      <Button variant="ghost" size="sm" onClick={onNext}>
        <StepForward className="size-4" aria-hidden="true" />
        Next scene
      </Button>
      <Button variant="ghost" size="sm" onClick={onSkip}>
        <SkipForward className="size-4" aria-hidden="true" />
        Skip animation
      </Button>
      <Button variant="outline" size="sm" onClick={onPlaybackChange}>
        <FastForward className="size-4" aria-hidden="true" />
        {playback === "normal" ? "Normal speed" : "Fast playback"}
      </Button>
      <div className="ml-auto flex rounded-xl border border-border bg-surface-inset p-1">
        {(["guided", "interactive"] as const).map((option) => (
          <button
            key={option}
            className={
              mode === option
                ? "rounded-lg bg-reasoning px-3 py-1.5 text-xs font-medium text-background"
                : "rounded-lg px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary"
            }
            type="button"
            onClick={() => onModeChange(option)}
          >
            {option === "guided" ? "Guided" : "Interactive"}
          </button>
        ))}
      </div>
    </div>
  );
}
