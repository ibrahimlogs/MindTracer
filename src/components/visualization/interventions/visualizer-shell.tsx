"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

interface VisualizerShellProps {
  title: string;
  reducedMotionSummary: string;
  children: (step: number) => React.ReactNode;
  stepCount?: number;
}

export function VisualizerShell({
  title,
  reducedMotionSummary,
  children,
  stepCount = 4,
}: VisualizerShellProps) {
  const [step, setStep] = useState(stepCount);

  return (
    <section
      className="space-y-4 rounded-lg border border-reasoning/30 bg-reasoning/10 p-4"
      aria-label={title}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setStep(1)}
          >
            Replay
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setStep((current) => Math.max(1, current - 1))}
          >
            Back
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setStep((current) => Math.min(stepCount, current + 1))
            }
          >
            Step
          </Button>
        </div>
      </div>
      <p className="sr-only">{reducedMotionSummary}</p>
      {children(step)}
    </section>
  );
}
