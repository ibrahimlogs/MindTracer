import type { Metadata } from "next";
import { ArrowDown, FlaskConical, LockKeyhole, ScanSearch } from "lucide-react";

import { PageShell, SectionContainer } from "@/components/layout/primitives";
import { PageHeader } from "@/components/layout/section-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EvidenceChip } from "@/components/ui/evidence-chip";
import { StatusPill } from "@/components/ui/status-pill";
import { ElevatedSurface, InsetSurface } from "@/components/ui/surface";
import { ReasoningNode } from "@/components/visualization/reasoning-node";

export const metadata: Metadata = {
  title: "Demo",
  description: "A preview of the upcoming MindTrace static learning workspace.",
};

export default function DemoPage() {
  return (
    <PageShell>
      <section className="py-16 sm:py-24">
        <SectionContainer>
          <div className="grid items-start gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
            <div>
              <StatusPill tone="attention">
                Learning workspace coming in Step 3
              </StatusPill>
              <PageHeader
                eyebrow="Product demo preview"
                title="See the shape of a reasoning journey before it becomes interactive."
                description="The upcoming static workspace will demonstrate how a problem, learner explanation, verification question, minimal intervention, retry, and transfer task fit together."
                className="mt-8"
              />
              <div className="mt-8 flex gap-3 border-l border-border-strong pl-4">
                <LockKeyhole
                  className="mt-0.5 size-4 shrink-0 text-text-muted"
                  aria-hidden="true"
                />
                <p className="text-sm leading-6 text-text-secondary">
                  This page is intentionally a teaser. It contains no fake
                  interactions, AI diagnosis, saved session, or generated
                  feedback.
                </p>
              </div>
            </div>

            <ElevatedSurface className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FlaskConical
                    className="size-4 text-reasoning"
                    aria-hidden="true"
                  />
                  Static workspace preview
                </div>
                <EvidenceChip>non-interactive</EvidenceChip>
              </div>
              <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-[0.9fr_1.1fr]">
                <InsetSurface className="p-5">
                  <p className="font-mono text-[0.625rem] tracking-[0.14em] text-text-muted uppercase">
                    Problem context
                  </p>
                  <p className="mt-5 text-sm leading-6 text-text-secondary">
                    A learner submits an answer and explains the rule they used.
                  </p>
                  <div className="mt-6 rounded-lg border border-border bg-surface-soft p-4 font-mono text-xs text-text-primary">
                    “I doubled the input.”
                  </div>
                </InsetSurface>
                <div className="space-y-2">
                  <ReasoningNode
                    label="Learner reasoning"
                    state="input"
                    compact
                  />
                  <div
                    className="flex justify-center text-text-muted"
                    aria-hidden="true"
                  >
                    <ArrowDown className="size-4" />
                  </div>
                  <ReasoningNode
                    label="Hypothesis to verify"
                    state="hypothesis"
                    compact
                  />
                  <div
                    className="flex justify-center text-text-muted"
                    aria-hidden="true"
                  >
                    <ArrowDown className="size-4" />
                  </div>
                  <ReasoningNode
                    label="Targeted question"
                    state="verification"
                    compact
                  />
                  <div
                    className="flex justify-center text-text-muted"
                    aria-hidden="true"
                  >
                    <ArrowDown className="size-4" />
                  </div>
                  <ReasoningNode
                    label="Transfer evidence"
                    state="transfer"
                    compact
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-border bg-surface-inset px-5 py-4 text-xs text-text-muted sm:px-6">
                <ScanSearch className="size-4 shrink-0" aria-hidden="true" />
                Step 3 will turn this visual sequence into a complete mocked
                reasoning journey.
              </div>
            </ElevatedSurface>
          </div>
        </SectionContainer>
      </section>
      <SiteFooter />
    </PageShell>
  );
}
