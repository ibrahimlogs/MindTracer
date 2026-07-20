import type * as React from "react";

import { cn } from "@/lib/utils";

type SurfaceProps = React.HTMLAttributes<HTMLDivElement>;

export function Surface({ className, ...props }: SurfaceProps) {
  return (
    <div
      className={cn("rounded-[1.4rem] bg-surface-soft", className)}
      {...props}
    />
  );
}

export function ElevatedSurface({ className, ...props }: SurfaceProps) {
  return (
    <div
      className={cn(
        "lesson-shadow rounded-[1.6rem] bg-surface-elevated",
        className,
      )}
      {...props}
    />
  );
}

export function InsetSurface({ className, ...props }: SurfaceProps) {
  return (
    <div
      className={cn("rounded-[1.15rem] bg-surface-inset", className)}
      {...props}
    />
  );
}

export function GradientBorder({
  className,
  children,
  ...props
}: SurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[linear-gradient(135deg,color-mix(in_srgb,var(--reasoning)_52%,transparent),var(--border)_38%,color-mix(in_srgb,var(--success)_28%,transparent))] p-px",
        className,
      )}
      {...props}
    >
      <div className="h-full rounded-[calc(var(--radius-xl)-1px)] bg-surface-elevated">
        {children}
      </div>
    </div>
  );
}
