import { Check, Circle, Search, Sparkles, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type NodeState =
  | "input"
  | "hypothesis"
  | "verification"
  | "confirmed"
  | "transfer";

const nodeConfig: Record<NodeState, { icon: LucideIcon; style: string }> = {
  input: { icon: Circle, style: "border-border-strong text-text-secondary" },
  hypothesis: { icon: Circle, style: "border-attention/35 text-attention" },
  verification: { icon: Search, style: "border-reasoning/40 text-reasoning" },
  confirmed: { icon: Check, style: "border-success/40 text-success" },
  transfer: {
    icon: Sparkles,
    style: "border-success/50 bg-success/5 text-success",
  },
};

interface ReasoningNodeProps {
  label: string;
  detail?: string;
  state: NodeState;
  compact?: boolean;
  className?: string;
}

export function ReasoningNode({
  label,
  detail,
  state,
  compact = false,
  className,
}: ReasoningNodeProps) {
  const { icon: Icon, style } = nodeConfig[state];

  return (
    <div
      className={cn(
        "relative rounded-xl border bg-surface-elevated",
        compact ? "px-3 py-2.5" : "p-4",
        style,
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="font-mono text-[0.6875rem] font-medium tracking-[0.06em] text-current uppercase">
          {label}
        </span>
      </div>
      {detail ? (
        <p className="mt-2 text-xs leading-5 text-text-muted">{detail}</p>
      ) : null}
    </div>
  );
}
