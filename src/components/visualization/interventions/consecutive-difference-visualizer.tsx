"use client";

import { motion } from "framer-motion";

import type { SessionSnapshot } from "@/lib/session-engine";

import { VisualizerCaption } from "./visualizer-caption";
import { VisualizerShell } from "./visualizer-shell";

type Config = NonNullable<SessionSnapshot["intervention"]>["visualizerConfig"];

export function ConsecutiveDifferenceVisualizer({
  config,
}: {
  config: Config;
}) {
  const rows = config.rows.slice(0, 3);
  return (
    <VisualizerShell
      title="Consecutive differences"
      reducedMotionSummary={config.reducedMotionSummary}
      stepCount={4}
    >
      {(step) => (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            {rows.map((row, index) => (
              <motion.div
                key={`${row.input}-${row.output}`}
                className="rounded-md border border-border bg-surface-inset p-3"
                animate={{
                  borderColor:
                    step > index ? "var(--color-success)" : undefined,
                }}
              >
                <div className="text-text-muted">{config.inputLabel}</div>
                <div className="font-mono text-text-primary">{row.input}</div>
                <div className="mt-2 text-text-muted">{config.outputLabel}</div>
                <div className="font-mono text-text-primary">{row.output}</div>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 font-mono text-sm text-success">
            {step >= 2 ? <div>+1 input, +2 output</div> : <div />}
            {step >= 4 ? <div>+1 input, +2 output</div> : <div />}
          </div>
          <VisualizerCaption>{config.caption}</VisualizerCaption>
        </div>
      )}
    </VisualizerShell>
  );
}
