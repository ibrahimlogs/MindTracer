"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

import { BeforeAfterCard } from "@/components/ui/before-after-card";
import { EvidenceChip } from "@/components/ui/evidence-chip";
import { InsetSurface } from "@/components/ui/surface";

export function ReasoningDeltaVisual() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1.12fr_auto_1fr]">
      <BeforeAfterCard
        label="Before · inferred rule"
        quote="Sales is double advertising."
        tone="before"
      />
      <div className="hidden items-center lg:flex" aria-hidden="true">
        <ArrowRight className="size-4 text-text-muted" />
      </div>

      <InsetSurface className="relative overflow-hidden border-reasoning/25 p-5 sm:p-6">
        <motion.div
          className="absolute inset-x-0 top-0 h-px origin-left bg-reasoning"
          initial={reducedMotion ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="flex items-center gap-2 text-reasoning">
          <AlertTriangle className="size-4" aria-hidden="true" />
          <span className="font-mono text-[0.625rem] tracking-[0.15em] uppercase">
            Conflict found
          </span>
        </div>
        <p className="mt-4 font-mono text-sm leading-7 text-text-primary">
          At advertising = 2, that predicts 4.
          <span className="block text-attention">The observed value is 5.</span>
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <EvidenceChip state="inferred">prediction: 4</EvidenceChip>
          <EvidenceChip state="observed">observed: 5</EvidenceChip>
        </div>
      </InsetSurface>

      <div className="hidden items-center lg:flex" aria-hidden="true">
        <ArrowRight className="size-4 text-text-muted" />
      </div>
      <BeforeAfterCard
        label="After · repaired model"
        quote="Sales increases by 2 for every increase of 1, with a starting offset of 1."
        tone="after"
      />

      <div className="col-span-full mt-1 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-inset px-5 py-4">
          <div>
            <p className="font-mono text-[0.625rem] tracking-[0.14em] text-text-muted uppercase">
              Formal bridge
            </p>
            <p className="mt-2 font-mono text-xl text-reasoning">y = 2x + 1</p>
          </div>
          <span className="font-mono text-xs text-success">model aligned</span>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-success/20 bg-success/5 px-5 py-4">
          <CheckCircle2
            className="size-5 shrink-0 text-success"
            aria-hidden="true"
          />
          <div>
            <p className="font-mono text-[0.625rem] tracking-[0.14em] text-success uppercase">
              Transfer
            </p>
            <p className="mt-1.5 text-sm text-text-secondary">
              Applied independently to a different context.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
