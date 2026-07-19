import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { SectionContainer } from "@/components/layout/primitives";
import { PrimaryButton, SecondaryButton } from "@/components/ui/actions";
import { Eyebrow } from "@/components/ui/eyebrow";

export function FinalCta() {
  return (
    <section className="py-20 sm:py-28">
      <SectionContainer>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-elevated px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
          <div
            className="absolute top-0 right-0 h-px w-1/2 bg-gradient-to-l from-reasoning to-transparent"
            aria-hidden="true"
          />
          <Eyebrow>Next question, stronger mind</Eyebrow>
          <h2 className="mt-6 max-w-3xl text-3xl leading-tight font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
            Help AI make the learner stronger—not merely faster.
          </h2>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton asChild size="lg">
              <Link href="/demo">
                Start the demo{" "}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </PrimaryButton>
            <SecondaryButton asChild size="lg">
              <Link href="/technology">Explore the system</Link>
            </SecondaryButton>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
