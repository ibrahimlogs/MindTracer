import type { Metadata } from "next";
import Link from "next/link";

import { PageShell, SectionContainer } from "@/components/layout/primitives";
import { PageHeader } from "@/components/layout/section-header";
import { DeltaOverview } from "@/components/reasoning-delta";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { ElevatedSurface } from "@/components/ui/surface";
import { demoLearners } from "@/data/demo/demo-learners";
import { getMisconceptionById, getRubricById } from "@/data/education";
import { sessionEngine, SessionEngineError } from "@/lib/session-engine";

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

interface ReportPageProps {
  params: Promise<{ sessionId: string }>;
}

function loadReportSession(sessionId: string) {
  try {
    const session = sessionEngine.getSession(sessionId);
    return session.report ? session : null;
  } catch (error) {
    if (error instanceof SessionEngineError) return null;
    throw error;
  }
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { sessionId } = await params;
  const session = loadReportSession(sessionId);

  if (session?.report) {
    return (
      <PageShell>
        <section className="py-16 sm:py-24">
          <SectionContainer>
            <PageHeader
              eyebrow="Reasoning Delta report"
              title="Evidence, not just a score."
              description="This report separates the starting model, preserved understanding, verified conflict, support used, revised reasoning, and transfer evidence."
            />
            <div className="mt-10 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <ElevatedSurface className="p-5">
                <p className="text-xs font-medium tracking-[0.14em] text-text-muted uppercase">
                  Final summary
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-text-primary">
                  {session.currentLearnerKey === "learner-b"
                    ? "Learner B"
                    : "Learner A"}
                </h2>
                <p className="mt-4 text-sm leading-6 text-text-secondary">
                  {session.report.learnerFacingSummary}
                </p>
                <div className="mt-5 rounded-lg border border-border bg-surface-inset p-4 text-sm text-text-secondary">
                  <p>Transfer challenge: {session.report.transferChallenge}</p>
                  <p className="mt-2">
                    Next concept: {session.report.nextConcept}
                  </p>
                </div>
              </ElevatedSurface>
              <DeltaOverview report={session.report} />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/demo/session/${session.publicId}?mode=compare`}>
                  Replay reasoning journey
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/demo">Restart session</Link>
              </Button>
            </div>
          </SectionContainer>
        </section>
        <SiteFooter />
      </PageShell>
    );
  }

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
                <p className="mt-4 font-mono text-xs text-text-muted">
                  Rubric: {getRubricById(learner.rubricId).title}
                </p>
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
                        .map(
                          (hypothesis) =>
                            getMisconceptionById(hypothesis.id).title,
                        )
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
