"use client";

import { demoLearners } from "@/data/demo/demo-learners";
import type { LearnerId } from "@/types/demo-learning";

interface LearnerSwitcherProps {
  currentLearner: LearnerId;
  onSelect: (learnerId: LearnerId) => void;
}

export function LearnerSwitcher({
  currentLearner,
  onSelect,
}: LearnerSwitcherProps) {
  return (
    <div
      className="flex rounded-md border border-border bg-surface-inset p-1"
      role="tablist"
      aria-label="Learner paths"
    >
      {demoLearners.map((learner) => (
        <button
          key={learner.id}
          type="button"
          role="tab"
          aria-selected={currentLearner === learner.id}
          className="rounded px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors aria-selected:bg-surface-soft aria-selected:text-text-primary"
          onClick={() => onSelect(learner.id)}
        >
          {learner.name}
        </button>
      ))}
    </div>
  );
}
