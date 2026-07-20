"use client";

import { motion } from "framer-motion";

import type { SessionSnapshot } from "@/lib/session-engine";

import { VisualizerCaption } from "./visualizer-caption";
import { VisualizerShell } from "./visualizer-shell";

type Config = NonNullable<SessionSnapshot["intervention"]>["visualizerConfig"];

export function AdditiveMultiplicativeContrast({ config }: { config: Config }) {
  return (
    <VisualizerShell
      title="Check the multiplication claim"
      reducedMotionSummary={config.reducedMotionSummary}
      stepCount={3}
    >
      {(step) => (
        <div className="space-y-3 text-sm">
          <div className="rounded-md bg-surface-inset p-3">
            Claim: {config.claim}
          </div>
          {step >= 2 ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-md bg-surface-inset p-3"
            >
              Claim prediction: {config.predictedValue}
            </motion.div>
          ) : null}
          {step >= 3 ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-md border border-attention/40 bg-attention/10 p-3"
            >
              Observed value: {config.observedValue}
              {config.showOffset ? (
                <span className="ml-2 text-success">Difference: +1</span>
              ) : null}
            </motion.div>
          ) : null}
          {config.showFinalEquation ? (
            <div className="rounded-md border border-error/40 bg-error/10 p-3 font-mono">
              y = 2x + 1
            </div>
          ) : null}
          <VisualizerCaption>{config.caption}</VisualizerCaption>
        </div>
      )}
    </VisualizerShell>
  );
}
