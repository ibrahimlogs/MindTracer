import {
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
  ScanSearch,
} from "lucide-react";
import Link from "next/link";

import { SectionContainer } from "@/components/layout/primitives";
import { PrimaryButton, SecondaryButton } from "@/components/ui/actions";
import { Eyebrow } from "@/components/ui/eyebrow";

export function Hero() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" aria-labelledby="hero-title">
      <SectionContainer>
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(32rem,1.12fr)] lg:gap-14">
          <div>
            <Eyebrow
              marker={<ScanSearch className="size-3.5" aria-hidden="true" />}
            >
              Reasoning-first learning
            </Eyebrow>
            <h1
              id="hero-title"
              className="mt-7 max-w-3xl text-5xl leading-[0.98] font-semibold tracking-[-0.065em] text-balance text-text-primary sm:text-7xl"
            >
              Same answer.
              <span className="block text-reasoning">Different minds.</span>
            </h1>
            <p className="mt-7 max-w-[44rem] text-lg leading-8 text-text-secondary sm:text-xl sm:leading-9">
              MindTrace looks beyond whether an answer is correct. It examines
              the reasoning, checks what the learner actually needs, and gives
              the smallest useful support before asking them to try again.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton asChild size="lg">
                <Link href="/demo/judge">
                  Watch the two-minute demo
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </PrimaryButton>
              <SecondaryButton asChild size="lg">
                <Link href="/demo">
                  Try as a learner
                  <ArrowDownRight className="size-4" aria-hidden="true" />
                </Link>
              </SecondaryButton>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2
                  className="size-4 text-success"
                  aria-hidden="true"
                />
                No account required.
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2
                  className="size-4 text-success"
                  aria-hidden="true"
                />
                Reviewed demo path available.
              </span>
            </div>
          </div>

          <LearnerProofVisual />
        </div>
      </SectionContainer>
    </section>
  );
}

function LearnerProofVisual() {
  return (
    <div
      className="lesson-shadow rounded-[2rem] bg-white p-5 sm:p-7"
      aria-label="Learner reasoning comparison"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <LearnerCard
          name="Learner A"
          tone="blue"
          quote="The values keep increasing."
          reasoning="Pattern estimate"
        />
        <LearnerCard
          name="Learner B"
          tone="violet"
          quote="It looks like double."
          reasoning="Direct multiplication"
        />
      </div>
      <div className="my-6 rounded-[1.5rem] bg-reasoning-soft p-5 text-center">
        <p className="text-sm font-semibold text-reasoning">Same answer</p>
        <p className="mt-1 text-5xl font-semibold tracking-[-0.06em]">10</p>
        <p className="mt-2 text-base text-text-secondary">
          Different reasoning means different support.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProofStep
          title="Different verification"
          items={["Consecutive change", "Rule consistency"]}
        />
        <ProofStep
          title="Different support"
          items={["+1 input / +2 output", "Predicted 4 / observed 5"]}
        />
      </div>
    </div>
  );
}

function LearnerCard({
  name,
  quote,
  reasoning,
  tone,
}: {
  name: string;
  quote: string;
  reasoning: string;
  tone: "blue" | "violet";
}) {
  const classes =
    tone === "blue"
      ? "bg-learner-a-soft text-learner-a"
      : "bg-learner-b-soft text-learner-b";

  return (
    <div className="rounded-[1.5rem] bg-surface-soft p-5">
      <div className="flex items-center gap-3">
        <span
          className={`grid size-11 place-items-center rounded-full font-semibold ${classes}`}
        >
          {name.endsWith("A") ? "A" : "B"}
        </span>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-text-muted">{reasoning}</p>
        </div>
      </div>
      <p className="mt-5 text-lg leading-7 text-text-primary">“{quote}”</p>
    </div>
  );
}

function ProofStep({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) {
  return (
    <div className="rounded-[1.25rem] bg-surface-soft p-4">
      <p className="font-semibold">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-text-secondary">
        {items.map((item) => (
          <li key={item}>→ {item}</li>
        ))}
      </ul>
    </div>
  );
}
