import type { Metadata } from "next";
import {
  ArrowDown,
  Beaker,
  CheckCircle2,
  GitBranch,
  ShieldCheck,
} from "lucide-react";

import { PageShell, SectionContainer } from "@/components/layout/primitives";
import { PageHeader, SectionHeader } from "@/components/layout/section-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { StatusPill } from "@/components/ui/status-pill";
import { ElevatedSurface, InsetSurface } from "@/components/ui/surface";

export const metadata: Metadata = {
  title: "Technology",
  description:
    "The planned controlled AI architecture behind MindTrace Reasoning Lab.",
};

const architecture = [
  [
    "Structured learner input",
    "Problem context, answer, reasoning, and confidence enter as distinct evidence.",
  ],
  [
    "Reasoning extraction",
    "A model proposes a compact representation of the learner’s apparent rule.",
  ],
  [
    "Curated misconception retrieval",
    "Candidate patterns are retrieved from reviewed concept-specific material.",
  ],
  [
    "Hypothesis ranking",
    "Possible explanations are ranked with uncertainty retained.",
  ],
  [
    "Verification",
    "A targeted question is chosen to discriminate between plausible explanations.",
  ],
  [
    "Intervention policy",
    "A controlled policy selects the smallest useful contrast or cue.",
  ],
  [
    "Retry analysis",
    "The learner retries while the system looks for changed reasoning, not copied language.",
  ],
  [
    "Transfer evidence",
    "A different context tests whether understanding survives without the original support.",
  ],
] as const;

export default function TechnologyPage() {
  return (
    <PageShell>
      <section className="border-b border-border/70 py-16 sm:py-24">
        <SectionContainer>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <PageHeader
              eyebrow="Technology and learning safety"
              title="Adaptation proposed by AI. Learning governed by evidence."
              description="MindTrace is being designed as a controlled reasoning system—not an unconstrained answer generator. Model flexibility is reserved for interpretation and adaptation; verification and support policy remain explicit."
            />
            <StatusPill tone="attention">Planned architecture</StatusPill>
          </div>
        </SectionContainer>
      </section>

      <section className="py-20 sm:py-28">
        <SectionContainer>
          <SectionHeader
            eyebrow="Product thesis"
            title="The first explanation is useful only if the system is willing to test it."
            description="A learner’s answer can support several plausible stories. MindTrace treats diagnosis as a hypothesis because acting on an untested story can deliver polished help for the wrong learning need."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <ElevatedSurface className="p-6 sm:p-8">
              <GitBranch className="size-5 text-attention" aria-hidden="true" />
              <h2 className="mt-6 text-xl font-medium">
                Why diagnosis remains a hypothesis
              </h2>
              <p className="mt-3 text-sm leading-7 text-text-secondary">
                Candidate misconceptions remain labeled as inference until a
                targeted response separates them. Observed learner evidence and
                model interpretation are never meant to collapse into one field.
              </p>
            </ElevatedSurface>
            <ElevatedSurface className="p-6 sm:p-8">
              <CheckCircle2
                className="size-5 text-success"
                aria-hidden="true"
              />
              <h2 className="mt-6 text-xl font-medium">
                Why transfer is required
              </h2>
              <p className="mt-3 text-sm leading-7 text-text-secondary">
                A corrected retry may reflect immediate support. A distinct
                problem provides stronger evidence that the mental model can be
                used independently.
              </p>
            </ElevatedSurface>
          </div>
        </SectionContainer>
      </section>

      <section className="border-y border-border/70 bg-surface-elevated/35 py-20 sm:py-28">
        <SectionContainer>
          <SectionHeader
            eyebrow="Controlled AI architecture"
            title="A proposed sequence with explicit checkpoints."
            description="This is the system being built. The visual product phase establishes its public explanation; it does not implement the workflow."
          />
          <ol className="mt-12 grid gap-3 lg:grid-cols-2">
            {architecture.map(([title, description], index) => (
              <li key={title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-reasoning/30 bg-surface-inset font-mono text-[0.625rem] text-reasoning">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {index < architecture.length - 1 ? (
                    <ArrowDown
                      className="my-2 size-3 text-text-muted lg:hidden"
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
                <InsetSurface className="flex-1 p-4 sm:p-5">
                  <h3 className="text-sm font-medium">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-text-secondary">
                    {description}
                  </p>
                </InsetSurface>
              </li>
            ))}
          </ol>
        </SectionContainer>
      </section>

      <section className="py-20 sm:py-28">
        <SectionContainer>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.82fr]">
            <SectionHeader
              eyebrow="Current implementation status"
              title="The foundation and visual explanation are real. The learning workflow is not implemented yet."
              description="There are currently no product database models, misconception engine, verification policy, intervention engine, or transfer evaluator. Those remain future phases and are not simulated on this page."
            />
            <ElevatedSurface className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <ShieldCheck
                  className="size-5 text-success"
                  aria-hidden="true"
                />
                <h2 className="text-base font-medium">Boundary status</h2>
              </div>
              <div className="mt-6 space-y-4 font-mono text-xs">
                <div className="flex justify-between gap-4 border-b border-border pb-3">
                  <span className="text-text-secondary">
                    Technical foundation
                  </span>
                  <span className="text-success">verified</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-3">
                  <span className="text-text-secondary">
                    Visual product phase
                  </span>
                  <span className="text-success">implemented</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-3">
                  <span className="text-text-secondary">Static workspace</span>
                  <span className="text-attention">next phase</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-text-secondary">
                    AI learning workflow
                  </span>
                  <span className="text-text-muted">not implemented</span>
                </div>
              </div>
              <div className="mt-7 flex gap-3 border-l border-attention/40 pl-4">
                <Beaker
                  className="mt-0.5 size-4 shrink-0 text-attention"
                  aria-hidden="true"
                />
                <p className="text-xs leading-5 text-text-muted">
                  No diagnostic outcome shown in this phase is presented as a
                  live model result.
                </p>
              </div>
            </ElevatedSurface>
          </div>
        </SectionContainer>
      </section>
      <SiteFooter />
    </PageShell>
  );
}
