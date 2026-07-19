import type * as React from "react";

import { cn } from "@/lib/utils";

type StatusTone = "reasoning" | "success" | "attention" | "muted";

const tones: Record<StatusTone, string> = {
  reasoning: "border-reasoning/25 bg-reasoning/8 text-reasoning",
  success: "border-success/25 bg-success/8 text-success",
  attention: "border-attention/25 bg-attention/8 text-attention",
  muted: "border-border bg-surface-soft text-text-secondary",
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
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[0.625rem] font-medium tracking-[0.12em] uppercase",
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
