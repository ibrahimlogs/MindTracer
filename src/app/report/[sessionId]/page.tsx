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
  ["Where you started", "started"],
  ["What MindTrace checked", "missingOrConflict"],
  ["What support you used", "support"],
  ["How your reasoning changed", "revised"],
  ["Transfer challenge result", "transfer"],
  ["What to practice next", "remainingGap"],
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
              title="Your reasoning changed."
              description="MindTrace compared your first explanation, the support you used, your retry, and your transfer response."
            />
            <div className="mt-10 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <ElevatedSurface className="p-5">
                <p className="text-sm font-semibold text-text-muted">
                  Learning reflection
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-text-primary">
                  {session.currentLearnerKey === "learner-b"
                    ? "Learner B"
                    : "Learner A"}
                </h2>
                <p className="mt-4 text-base leading-7 text-text-secondary">
                  {session.report.learnerFacingSummary}
                </p>
                <div className="mt-5 rounded-2xl bg-surface-soft p-4 text-base text-text-secondary">
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
            title="Your reasoning changed."
            description="This reflection separates where each learner started, what MindTrace checked, what support helped, and whether the idea transferred."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {demoLearners.map((learner) => (
              <ElevatedSurface key={learner.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-text-muted">
                      Learner
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-text-primary">
                      {learner.name}
                    </h2>
                  </div>
                  <span className="rounded-full bg-success-soft px-3 py-1.5 text-sm font-semibold text-success">
                    Transfer complete
                  </span>
                </div>
                <p className="mt-4 text-sm text-text-muted">
                  Reflection lens: {getRubricById(learner.rubricId).title}
                </p>
                <div className="mt-6 grid gap-4">
                  <section className="rounded-2xl bg-success-soft p-4">
                    <h3 className="text-sm font-semibold text-success">
                      Correct understanding preserved
                    </h3>
                    <p className="mt-2 text-base leading-7 text-text-secondary">
                      {learner.analysis.interpretation[0]}
                    </p>
                  </section>
                  <section className="rounded-2xl bg-reasoning-soft p-4">
                    <h3 className="text-sm font-semibold text-reasoning">
                      Hypothesis considered
                    </h3>
                    <p className="mt-2 text-base leading-7 text-text-secondary">
                      {learner.hypotheses
                        .map(
                          (hypothesis) =>
                            getMisconceptionById(hypothesis.id).title,
                        )
                        .join(" and ")}
                    </p>
                  </section>
                  <section className="rounded-2xl bg-surface-soft p-4">
                    <h3 className="text-sm font-semibold text-text-muted">
                      Verification evidence
                    </h3>
                    <p className="mt-2 text-base leading-7 text-text-secondary">
                      {learner.verification.response}
                    </p>
                  </section>
                  <section className="rounded-2xl bg-surface-soft p-4">
                    <h3 className="text-sm font-semibold text-text-muted">
                      Intervention used
                    </h3>
                    <p className="mt-2 text-base leading-7 text-text-secondary">
                      {learner.intervention.title}
                    </p>
                  </section>
                  {sections.map(([title, key]) => (
                    <section
                      key={key}
                      className="rounded-2xl bg-surface-soft p-4"
                    >
                      <h3 className="text-sm font-semibold text-text-muted">
                        {title}
                      </h3>
                      <p className="mt-2 text-base leading-7 text-text-secondary">
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
