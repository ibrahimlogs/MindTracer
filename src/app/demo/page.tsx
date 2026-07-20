import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GitCompare, Route, UserRound } from "lucide-react";

import { DemoEntryCard } from "@/components/demo";
import { PageShell, SectionContainer } from "@/components/layout/primitives";
import { PageHeader } from "@/components/layout/section-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { ElevatedSurface } from "@/components/ui/surface";

export const metadata: Metadata = {
  title: "Demo",
  description: "Try the learner-first MindTrace demo path.",
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
          <PageHeader
            eyebrow="Try MindTrace"
            title="See why two identical answers can need completely different support."
            description="Start with the guided two-learner story. It shows the full journey from first reasoning to verification, focused support, retry, transfer, and reflection."
            className="max-w-4xl"
          />
          <ElevatedSurface className="mt-10 overflow-hidden p-0">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="p-7 sm:p-9">
                <span className="inline-flex rounded-full bg-success-soft px-3 py-1.5 text-sm font-semibold text-success">
                  Best for first-time visitors
                </span>
                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  Guided Demo
                </h2>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-text-secondary">
                  Watch the complete MindTrace journey: two learners, one wrong
                  answer, different reasoning, different checks, different
                  support, and a transfer challenge.
                </p>
                <Button asChild size="lg" className="mt-7">
                  <Link href="/demo/judge">
                    Start the two-minute demo
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
              <div className="bg-reasoning-soft p-7 sm:p-9">
                <p className="text-sm font-semibold text-reasoning">
                  Same answer: 10
                </p>
                <div className="mt-5 space-y-4">
                  <DemoReasoning
                    name="Learner A"
                    text="The values keep increasing."
                  />
                  <DemoReasoning
                    name="Learner B"
                    text="It looks like double."
                  />
                </div>
              </div>
            </div>
          </ElevatedSurface>

          <details className="mt-6 rounded-[1.25rem] bg-surface-soft p-5">
            <summary className="cursor-pointer text-sm font-semibold text-text-secondary">
              Demo details
            </summary>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-text-muted">
              Guided Demo uses reviewed responses so the product remains easy to
              evaluate without an account or environment secrets. Technical
              pipeline details remain available for reviewers who want them.
            </p>
          </details>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold">Explore another path</h2>
            <p className="mt-2 text-text-secondary">
              These are useful after you have seen the guided story.
            </p>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
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

function DemoReasoning({ name, text }: { name: string; text: string }) {
  return (
    <div className="rounded-[1.25rem] bg-white p-4">
      <p className="text-sm font-semibold">{name}</p>
      <p className="mt-2 text-base text-text-secondary">“{text}”</p>
    </div>
  );
}
