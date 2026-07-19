import { Check, CircleDashed, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface EvidenceChipProps {
  children: React.ReactNode;
  state?: "observed" | "inferred" | "confirmed";
  className?: string;
}

const evidenceStyles: Record<
  NonNullable<EvidenceChipProps["state"]>,
  string
> = {
  observed: "text-text-secondary",
  inferred: "text-attention",
  confirmed: "text-success",
};

export function EvidenceChip({
  children,
  state = "observed",
  className,
}: EvidenceChipProps) {
  const Icon: LucideIcon = state === "confirmed" ? Check : CircleDashed;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-inset px-2 py-1 font-mono text-[0.6875rem]",
        evidenceStyles[state],
        className,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {children}
    </span>
  );
}
