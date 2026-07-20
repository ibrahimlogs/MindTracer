import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";

interface DemoIntroductionProps {
  onStart: () => void;
  onExplore: () => void;
}

export function DemoIntroduction({
  onStart,
  onExplore,
}: DemoIntroductionProps) {
  return (
    <section className="grid min-h-[72vh] items-center gap-10 py-14 lg:grid-cols-[1.02fr_0.98fr]">
      <div>
        <StatusPill tone="success">Guided Demo · two-minute path</StatusPill>
        <h1 className="mt-7 max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-text-primary sm:text-7xl">
          Same answer.
          <span className="block text-reasoning">Different minds.</span>
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-text-secondary sm:text-xl sm:leading-9">
          Two learners give the same wrong answer for completely different
          reasons. Watch MindTrace identify what each learner actually needs.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button size="lg" onClick={onStart}>
            Begin
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          <Button variant="outline" size="lg" onClick={onExplore}>
            Explore manually
          </Button>
        </div>
        <p className="mt-5 text-sm text-text-muted">
          Reviewed demo path available. Live AI can be connected separately.
        </p>
      </div>
      <div className="lesson-shadow rounded-[2rem] bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            "Same problem",
            "Same answer",
            "Different reasoning",
            "Different support",
          ].map((label) => (
            <div key={label} className="rounded-2xl bg-surface-soft p-5">
              <span className="text-sm font-semibold text-reasoning">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
