import type * as React from "react";

import { cn } from "@/lib/utils";

interface EyebrowProps extends React.HTMLAttributes<HTMLParagraphElement> {
  marker?: React.ReactNode;
}

export function Eyebrow({
  marker,
  children,
  className,
  ...props
}: EyebrowProps) {
  return (
    <p
      className={cn(
        "flex items-center gap-2 font-mono text-[0.6875rem] font-medium tracking-[0.18em] text-reasoning uppercase",
        className,
      )}
      {...props}
    >
      {marker}
      {children}
    </p>
  );
}
