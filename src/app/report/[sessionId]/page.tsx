import type { Metadata } from "next";
import Link from "next/link";

import { PageShell, SectionContainer } from "@/components/layout/primitives";
import { PageHeader } from "@/components/layout/section-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { ElevatedSurface } from "@/components/ui/surface";
import { demoLearners } from "@/data/demo/demo-learners";

export const metadata: Metadata = {
  title: "Reasoning Delta Report",
  description:
    "A static MindTrace report summarizing mocked reasoning evidence and transfer.",
};

const sections = [
  ["Starting mental model", "started"],
  ["Learning gap or conflict", "missingOrConflict"],
  ["Support required", "support"],
  ["Revised mental model", "revised"],
  ["Transfer result", "transfer"],
  ["Remaining gap", "remainingGap"],
  ["Next concept", "nextConcept"],
] as const;

export default function ReportPage() {
  return (
    <PageShell>
      <section className="py-16 sm:py-24">
        <SectionContainer>
          <PageHeader
            eyebrow="Reasoning Delta report"
            title="Evidence, not just a score."
            description="This static report separates observed learner evidence from mocked hypotheses. It uses no fake mastery percentages and no live AI diagnosis."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {demoLearners.map((learner) => (
              <ElevatedSurface key={learner.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium tracking-[0.14em] text-text-muted uppercase">
                      Learner
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-text-primary">
                      {learner.name}
                    </h2>
                  </div>
                  <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs text-success">
                    Transfer complete
                  </span>
                </div>
                <div className="mt-6 grid gap-3">
                  <section className="rounded-lg border border-border bg-surface-inset p-4">
                    <h3 className="text-xs font-medium tracking-[0.14em] text-text-muted uppercase">
                      Correct understanding preserved
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      {learner.analysis.interpretation[0]}
                    </p>
                  </section>
                  <section className="rounded-lg border border-border bg-surface-inset p-4">
                    <h3 className="text-xs font-medium tracking-[0.14em] text-text-muted uppercase">
                      Hypothesis considered
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      {learner.hypotheses
                        .map((hypothesis) => hypothesis.label)
                        .join(" and ")}
                    </p>
                  </section>
                  <section className="rounded-lg border border-border bg-surface-inset p-4">
                    <h3 className="text-xs font-medium tracking-[0.14em] text-text-muted uppercase">
                      Verification evidence
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      {learner.verification.response}
                    </p>
                  </section>
                  <section className="rounded-lg border border-border bg-surface-inset p-4">
                    <h3 className="text-xs font-medium tracking-[0.14em] text-text-muted uppercase">
                      Intervention used
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      {learner.intervention.title}
                    </p>
                  </section>
                  {sections.map(([title, key]) => (
                    <section
                      key={key}
                      className="rounded-lg border border-border bg-surface-inset p-4"
                    >
                      <h3 className="text-xs font-medium tracking-[0.14em] text-text-muted uppercase">
                        {title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-text-secondary">
                        {learner.report[key]}
                      </p>
                    </section>
                  ))}
                </div>
              </ElevatedSurface>
            ))}
          </div>
          <Button asChild className="mt-8">
            <Link href="/demo/session/demo-session?mode=compare">
              Return to guided comparison
            </Link>
          </Button>
        </SectionContainer>
      </section>
      <SiteFooter />
    </PageShell>
  );
}
