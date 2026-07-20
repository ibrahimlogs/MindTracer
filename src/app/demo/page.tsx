import type { Metadata } from "next";
import Link from "next/link";
import { Crown, GitCompare, Route, UserRound } from "lucide-react";

import { DemoEntryCard } from "@/components/demo";
import { PageShell, SectionContainer } from "@/components/layout/primitives";
import { PageHeader } from "@/components/layout/section-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { ElevatedSurface } from "@/components/ui/surface";

export const metadata: Metadata = {
  title: "Demo",
  description:
    "Choose a deterministic MindTrace demo path through a mocked reasoning journey.",
};

const demoOptions = [
  {
    title: "Compare Two Learners",
    description:
      "Watch two learners give the same answer, then see how different evidence leads to different verification questions and interventions.",
    href: "/demo/session/demo-session?mode=compare",
    cta: "Start the guided comparison",
    status: "Fully available",
    mode: "compare",
    icon: GitCompare,
  },
  {
    title: "Try as a Learner",
    description:
      "Type an answer and explanation inside a prototype simulation that maps your path to reviewed mocked reasoning.",
    href: "/demo/session/demo-session?mode=learner",
    cta: "Try the learner path",
    status: "Mocked interaction",
    mode: "learner",
    icon: UserRound,
  },
  {
    title: "Explore the Reasoning Pipeline",
    description:
      "Jump between the state-machine stages and inspect how the static journey is structured for future backend intelligence.",
    href: "/demo/session/demo-session?mode=pipeline",
    cta: "Explore the pipeline",
    status: "Available",
    mode: "pipeline",
    icon: Route,
  },
] as const;

export default function DemoPage() {
  return (
    <PageShell>
      <section className="py-16 sm:py-24">
        <SectionContainer>
          <StatusPill tone="success">Static Learning Workspace</StatusPill>
          <PageHeader
            eyebrow="Product demo"
            title="Same answer. Different reasoning journey."
            description="Choose a deterministic demo path through MindTrace's learning workspace. Sessions are API-created and resumable; when no database is configured, development fallback mode is clearly used."
            className="mt-8 max-w-4xl"
          />
          <ElevatedSurface className="mt-10 border-reasoning/60 bg-reasoning/10 p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <Crown className="size-5 text-reasoning" aria-hidden="true" />
                  <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs text-success">
                    Recommended for judges
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-semibold">Judge Mode</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
                  Start the competition-grade two-minute path: two learners,
                  same wrong answer, different reasoning evidence, verification,
                  intervention, transfer, and report.
                </p>
              </div>
              <Button asChild size="lg">
                <Link href="/demo/judge">Start the two-minute demo</Link>
              </Button>
            </div>
          </ElevatedSurface>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {demoOptions.map((option) => (
              <DemoEntryCard key={option.title} {...option} />
            ))}
          </div>
        </SectionContainer>
      </section>
      <SiteFooter />
    </PageShell>
  );
}
