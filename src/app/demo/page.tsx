import type { Metadata } from "next";
import { GitCompare, Route, UserRound } from "lucide-react";

import { DemoEntryCard } from "@/components/demo";
import { PageShell, SectionContainer } from "@/components/layout/primitives";
import { PageHeader } from "@/components/layout/section-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { StatusPill } from "@/components/ui/status-pill";

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
    featured: true,
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
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
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
