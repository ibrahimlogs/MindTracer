"use client";

import { Check } from "lucide-react";

import { getStageIndex, timelineStages } from "@/lib/demo-learning/stages";
import type { LearningStage } from "@/types/demo-learning";

interface ReasoningTimelineProps {
  currentStage: LearningStage;
  completedStages: LearningStage[];
  onJump?: (stage: LearningStage) => void;
}

export function ReasoningTimeline({
  currentStage,
  completedStages,
  onJump,
}: ReasoningTimelineProps) {
  const currentIndex = getStageIndex(currentStage);

  return (
    <nav
      aria-label="Reasoning trace timeline"
      className="soft-shadow rounded-[1.4rem] bg-white p-3"
    >
      <ol className="grid gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {timelineStages.map((stage) => {
          const stageIndex = getStageIndex(stage.key);
          const complete =
            completedStages.includes(stage.key) || stageIndex < currentIndex;
          const active = stage.key === currentStage;

          return (
            <li key={stage.key}>
              <button
                type="button"
                disabled={!onJump}
                onClick={() => onJump?.(stage.key)}
                className="flex min-h-11 w-full items-center gap-2 rounded-full bg-surface-soft px-3 py-2 text-left text-sm text-text-muted transition-colors disabled:cursor-default aria-current:bg-reasoning-soft aria-current:text-reasoning"
                aria-current={active ? "step" : undefined}
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border text-[0.65rem]">
                  {complete ? (
                    <Check className="size-3" aria-hidden="true" />
                  ) : (
                    stageIndex + 1
                  )}
                </span>
                <span>{stage.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
