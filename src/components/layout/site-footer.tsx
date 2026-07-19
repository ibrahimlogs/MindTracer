import { BrainCircuit } from "lucide-react";
import Link from "next/link";

import { SectionContainer } from "@/components/layout/primitives";
import { StatusPill } from "@/components/ui/status-pill";

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-10">
      <SectionContainer className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <BrainCircuit
              className="size-4 text-reasoning"
              aria-hidden="true"
            />
            MindTrace
          </div>
          <p className="mt-2 text-xs text-text-muted">
            AI designed to strengthen independent reasoning.
          </p>
        </div>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-5 text-sm text-text-secondary"
        >
          <Link href="/demo" className="hover:text-text-primary">
            Demo
          </Link>
          <Link href="/technology" className="hover:text-text-primary">
            Technology
          </Link>
          <StatusPill tone="attention">Visual phase</StatusPill>
        </nav>
      </SectionContainer>
    </footer>
  );
}
