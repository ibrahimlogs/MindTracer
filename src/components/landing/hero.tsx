import { ArrowDownRight, ArrowRight, ScanSearch } from "lucide-react";
import Link from "next/link";

import { SectionContainer } from "@/components/layout/primitives";
import { PrimaryButton, SecondaryButton } from "@/components/ui/actions";
import { AnimatedHeadline } from "@/components/ui/animated-headline";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ReasoningNetwork } from "@/components/visualization/reasoning-network";

export function Hero() {
  return (
    <section
      className="border-b border-border/70 py-16 sm:py-20 lg:py-24"
      aria-labelledby="hero-title"
    >
      <SectionContainer>
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(34rem,1.08fr)] lg:gap-10 xl:gap-16">
          <div>
            <Eyebrow
              marker={<ScanSearch className="size-3.5" aria-hidden="true" />}
            >
              AI for human reasoning
            </Eyebrow>
            <div id="hero-title" className="mt-7">
              <AnimatedHeadline />
            </div>
            <p className="mt-7 max-w-[42.5rem] text-lg leading-8 text-text-secondary">
              MindTrace discovers why a learner is struggling, verifies what
              they need, provides the smallest useful intervention, and measures
              whether their reasoning becomes independent.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton asChild size="lg">
                <Link href="/demo">
                  Experience the reasoning demo
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </PrimaryButton>
              <SecondaryButton asChild size="lg">
                <Link href="#how-it-works">
                  See how it works
                  <ArrowDownRight className="size-4" aria-hidden="true" />
                </Link>
              </SecondaryButton>
            </div>
            <div className="mt-10 flex items-start gap-3 border-l border-reasoning/40 pl-4">
              <p className="font-mono text-xs leading-5 text-text-muted">
                Answers are becoming abundant.
                <span className="block text-text-primary">
                  Independent reasoning is not.
                </span>
              </p>
            </div>
          </div>

          <ReasoningNetwork />
        </div>
      </SectionContainer>
    </section>
  );
}
