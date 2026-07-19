import type { LucideIcon } from "lucide-react";

import { InsetSurface } from "@/components/ui/surface";

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: MetricCardProps) {
  return (
    <InsetSurface className="p-5">
      <div className="flex items-center justify-between text-text-muted">
        <span className="font-mono text-[0.625rem] tracking-[0.14em] uppercase">
          {label}
        </span>
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <p className="mt-5 font-mono text-2xl text-text-primary">{value}</p>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{detail}</p>
    </InsetSurface>
  );
}
