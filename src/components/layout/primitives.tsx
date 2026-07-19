import type * as React from "react";

import { cn } from "@/lib/utils";

interface ClassNameProps {
  className?: string;
}

interface ElementProps extends ClassNameProps {
  children: React.ReactNode;
}

export function PageShell({ children, className }: ElementProps) {
  return <main className={cn("overflow-clip", className)}>{children}</main>;
}

export function SectionContainer({ children, className }: ElementProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ContentGrid({ children, className }: ElementProps) {
  return (
    <div
      className={cn("grid grid-cols-12 gap-x-5 gap-y-8 lg:gap-x-8", className)}
    >
      {children}
    </div>
  );
}

export function ResponsiveStack({ children, className }: ElementProps) {
  return (
    <div className={cn("flex flex-col gap-5 md:flex-row", className)}>
      {children}
    </div>
  );
}

export function Divider({ className }: ClassNameProps) {
  return (
    <div className={cn("h-px w-full bg-border", className)} role="separator" />
  );
}
