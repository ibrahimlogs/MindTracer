import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ElevatedSurface } from "@/components/ui/surface";

interface DemoEntryCardProps {
  title: string;
  description: string;
  href: string;
  cta: string;
  status: string;
  icon: LucideIcon;
  featured?: boolean;
}

export function DemoEntryCard({
  title,
  description,
  href,
  cta,
  status,
  icon: Icon,
  featured = false,
}: DemoEntryCardProps) {
  return (
    <ElevatedSurface
      className={`p-5 ${featured ? "border-reasoning/60 bg-reasoning/10" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-lg border border-border bg-surface-inset p-3">
          <Icon className="size-5 text-reasoning" aria-hidden="true" />
        </div>
        <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs text-success">
          {status}
        </span>
      </div>
      <h2 className="mt-5 text-xl font-semibold text-text-primary">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-text-secondary">
        {description}
      </p>
      <div className="mt-5 rounded-lg border border-border bg-surface-inset p-4 text-xs leading-5 text-text-muted">
        Preview: same answer, different reasoning evidence and support path.
      </div>
      <Button
        asChild
        className="mt-5 w-full"
        variant={featured ? "default" : "outline"}
      >
        <Link href={href}>{cta}</Link>
      </Button>
    </ElevatedSurface>
  );
}
