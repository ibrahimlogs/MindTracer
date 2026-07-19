import { ReasoningNode } from "@/components/visualization/reasoning-node";
import { cn } from "@/lib/utils";

interface ReducedMotionFallbackProps {
  className?: string;
  compact?: boolean;
}

export function ReducedMotionFallback({
  className,
  compact = false,
}: ReducedMotionFallbackProps) {
  return (
    <div
      className={cn(
        "relative h-full min-h-[22rem] overflow-hidden p-5 sm:p-7",
        className,
      )}
      data-testid="reasoning-static-fallback"
      aria-label="Static reasoning path from learner response to independent transfer"
    >
      <div
        className="absolute inset-y-10 left-1/2 w-px -translate-x-1/2 bg-border"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid h-full max-w-lg grid-cols-2 content-center gap-x-5 gap-y-4">
        <ReasoningNode
          label="Learner reasoning"
          state="input"
          compact={compact}
          className="col-span-2 mx-auto w-full max-w-56"
        />
        <ReasoningNode
          label="Hypothesis A"
          state="hypothesis"
          compact={compact}
        />
        <ReasoningNode
          label="Hypothesis B"
          state="hypothesis"
          compact={compact}
        />
        <ReasoningNode
          label="Verification"
          state="verification"
          compact={compact}
          className="col-span-2 mx-auto w-full max-w-56"
        />
        <ReasoningNode
          label="Intervention"
          state="confirmed"
          compact={compact}
          className="col-span-2 mx-auto w-full max-w-56"
        />
        <ReasoningNode
          label="Independent transfer"
          state="transfer"
          compact={compact}
          className="col-span-2 mx-auto w-full max-w-56"
        />
      </div>
    </div>
  );
}
