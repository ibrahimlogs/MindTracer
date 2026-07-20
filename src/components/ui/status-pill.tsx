import type * as React from "react";

import { cn } from "@/lib/utils";

type StatusTone = "reasoning" | "success" | "attention" | "muted";

const tones: Record<StatusTone, string> = {
  reasoning: "bg-reasoning-soft text-reasoning",
  success: "bg-success-soft text-success",
  attention: "bg-attention-soft text-attention",
  muted: "bg-surface-soft text-text-secondary",
};

interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
  indicator?: boolean;
}

export function StatusPill({
  tone = "muted",
  indicator = true,
  className,
  children,
  ...props
}: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.8125rem] font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    >
      {indicator ? (
        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      ) : null}
      {children}
    </span>
  );
}
