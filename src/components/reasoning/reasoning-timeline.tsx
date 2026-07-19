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
      className="rounded-xl border border-border bg-surface-elevated p-3"
    >
      <ol className="grid gap-2 sm:grid-cols-7">
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
                className="flex w-full items-center gap-2 rounded-md border border-border/70 bg-surface-inset px-3 py-2 text-left text-xs text-text-muted transition-colors hover:border-border-strong disabled:cursor-default aria-current:border-reasoning aria-current:text-text-primary"
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
