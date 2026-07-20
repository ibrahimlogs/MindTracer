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
    <section className="grid min-h-[72vh] items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr]">
      <div>
        <StatusPill tone="success">Judge Mode · two-minute path</StatusPill>
        <h1 className="mt-7 max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-text-primary sm:text-7xl">
          Same answer.
          <span className="block text-reasoning">Different minds.</span>
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-text-secondary">
          Two learners give the same wrong answer for completely different
          reasons. Watch MindTrace identify what each learner actually needs.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button size="lg" onClick={onStart}>
            Start the two-minute demo
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          <Button variant="outline" size="lg" onClick={onExplore}>
            Explore manually
          </Button>
        </div>
        <p className="mt-5 text-xs text-text-muted">
          Live AI when available. Curated fallback ensures the demo remains
          reviewable.
        </p>
      </div>
      <div className="rounded-[2rem] border border-border bg-surface-elevated p-5 shadow-2xl shadow-black/30">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            "Same problem",
            "Same answer",
            "Different reasoning",
            "Different support",
          ].map((label) => (
            <div
              key={label}
              className="rounded-2xl border border-border bg-surface-soft p-5"
            >
              <span className="font-mono text-xs tracking-[0.2em] text-reasoning uppercase">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
