import { ArrowDown, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface FlowConnectorProps {
  label?: string;
  orientation?: "horizontal" | "vertical";
  active?: boolean;
  className?: string;
}

export function FlowConnector({
  label,
  orientation = "horizontal",
  active = false,
  className,
}: FlowConnectorProps) {
  const Icon = orientation === "horizontal" ? ArrowRight : ArrowDown;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center gap-2 text-text-muted",
        orientation === "vertical" && "flex-col",
        active && "text-reasoning",
        className,
      )}
      aria-hidden="true"
    >
      {label ? (
        <span className="font-mono text-[0.5625rem] tracking-wider uppercase">
          {label}
        </span>
      ) : null}
      <Icon className="size-4" />
    </div>
  );
}
