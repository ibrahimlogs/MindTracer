import { ArrowRight, Cpu, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { SectionContainer } from "@/components/layout/primitives";
import { SectionHeader } from "@/components/layout/section-header";
import { SecondaryButton } from "@/components/ui/actions";
import { StatusPill } from "@/components/ui/status-pill";
import { GradientBorder } from "@/components/ui/surface";

const architecture = [
  "Structured learner input",
  "Reasoning extraction",
  "Curated misconception retrieval",
  "Hypothesis ranking",
  "Verification",
  "Intervention policy",
  "Retry analysis",
  "Transfer evidence",
] as const;

export function TechnologyPreview() {
  return (
    <section className="border-y border-border/70 bg-surface-elevated/35 py-20 sm:py-28">
      <SectionContainer>
        <GradientBorder>
          <div className="p-6 sm:p-10 lg:p-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <StatusPill tone="attention">
                Architecture in development
              </StatusPill>
              <Cpu className="size-5 text-text-muted" aria-hidden="true" />
            </div>
            <SectionHeader
              eyebrow="Technology preview"
              title="Generative where adaptation matters. Controlled where learning safety matters."
              className="mt-8"
            />

            <ol className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {architecture.map((stage, index) => (
                <li
                  key={stage}
                  className="min-h-28 bg-surface-inset p-4 sm:p-5"
                >
                  <span className="font-mono text-[0.625rem] text-text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-5 text-sm leading-6 text-text-primary">
                    {stage}
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-col justify-between gap-6 border-t border-border pt-7 sm:flex-row sm:items-end">
              <div className="flex max-w-xl gap-3">
                <ShieldCheck
                  className="mt-0.5 size-5 shrink-0 text-success"
                  aria-hidden="true"
                />
                <p className="text-sm leading-6 text-text-secondary">
                  <span className="block text-text-primary">
                    The AI proposes and adapts.
                  </span>
                  The controlled learning system verifies and governs.
                </p>
              </div>
              <SecondaryButton asChild>
                <Link href="/technology">
                  Explore the architecture{" "}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </SecondaryButton>
            </div>
          </div>
        </GradientBorder>
      </SectionContainer>
    </section>
  );
}
