import type { Metadata } from "next";

import { PageShell, SectionContainer } from "@/components/layout/primitives";
import { PageHeader } from "@/components/layout/section-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { StatusPill } from "@/components/ui/status-pill";
import { ElevatedSurface } from "@/components/ui/surface";

export const metadata: Metadata = {
  title: "Prototype Evaluation",
  description:
    "A judge-facing summary of MindTrace prototype system-behavior evaluations.",
};

const groups = [
  {
    title: "Reasoning extraction",
    items: [
      "Schema-valid output rate: deterministic harness passing",
      "Prohibited-output rate: guarded by safety checks",
      "Live status: pending unless OPENAI_API_KEY is configured",
    ],
  },
  {
    title: "Verification",
    items: [
      "Initial top-1 agreement: measured on curated cases",
      "Post-verification agreement: measured on curated cases",
      "False confident diagnosis rate and unknown-ID rate: tracked",
    ],
  },
  {
    title: "Intervention",
    items: [
      "Family, starting-level, and visualizer agreement: deterministic checks",
      "Answer leakage rate: guarded before permitted stages",
      "Support is selected from reviewed intervention ladders",
    ],
  },
  {
    title: "Reasoning Delta",
    items: [
      "Overall-change agreement: deterministic checks",
      "Transfer-readiness agreement: deterministic checks",
      "Unsupported-improvement rate: tracked as a safety metric",
    ],
  },
  {
    title: "Transfer",
    items: [
      "Transfer-status agreement: deterministic checks",
      "Guess-detection agreement: deterministic checks",
      "Unsupported-success rate: tracked separately",
    ],
  },
] as const;

export default function EvaluationPage() {
  return (
    <PageShell>
      <section className="border-b border-border/70 py-16 sm:py-24">
        <SectionContainer>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <PageHeader
              eyebrow="Evaluation"
              title="Prototype system-behavior evaluation"
              description="These are curated deterministic and handcrafted regression checks for a prototype learning system. They are not educational efficacy research and should not be read as broad learner-outcome claims."
            />
            <StatusPill tone="attention">Prototype evidence</StatusPill>
          </div>
        </SectionContainer>
      </section>

      <section className="py-12 sm:py-16">
        <SectionContainer>
          <div className="grid gap-5 lg:grid-cols-2">
            {groups.map((group) => (
              <ElevatedSurface key={group.title} className="p-6">
                <h2 className="text-xl font-semibold">{group.title}</h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-text-secondary">
                  {group.items.map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
              </ElevatedSurface>
            ))}
          </div>
          <ElevatedSurface className="mt-6 border-attention/40 p-6">
            <h2 className="text-xl font-semibold">Known limits</h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              The dataset is intentionally small and curated. Deterministic
              agreement means the system follows its reviewed prototype
              contracts; it does not prove generalized learning gains. Live
              OpenAI and PostgreSQL verification are reported separately when
              credentials are available.
            </p>
          </ElevatedSurface>
        </SectionContainer>
      </section>
      <SiteFooter />
    </PageShell>
  );
}
