"use client";

import { motion } from "framer-motion";

import { ReasoningDelta } from "@/components/reasoning";
import { getStageIndex } from "@/lib/demo-learning/stages";
import type { SessionSnapshot } from "@/lib/session-engine";
import type { DemoLearner, LearningStage } from "@/types/demo-learning";

import { AnimatedDataTable } from "./animated-data-table";
import { DifferenceVisualizer } from "./difference-visualizer";
import { EquationBridge } from "./equation-bridge";
import { HypothesisBranch } from "./hypothesis-branch";
import { MultiplicationContrast } from "./multiplication-contrast";
import { TransferVisualizer } from "./transfer-visualizer";

interface ReasoningWorkspaceCanvasProps {
  learner: DemoLearner;
  stage: LearningStage;
  analysis: SessionSnapshot["analysis"];
}

export function ReasoningWorkspaceCanvas({
  learner,
  stage,
  analysis,
}: ReasoningWorkspaceCanvasProps) {
  const index = getStageIndex(stage);

  return (
    <motion.div
      key={`${learner.id}-${stage}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-5"
    >
      {index < getStageIndex("reasoning_analysis") ? (
        <AnimatedDataTable />
      ) : null}
      {stage === "reasoning_analysis" ? (
        <div className="space-y-4">
          <AnimatedDataTable
            highlights={learner.id === "learner-a" ? [0, 1, 2] : [1]}
          />
          <div className="rounded-lg border border-border bg-surface-inset p-4">
            <p className="text-xs font-medium tracking-[0.14em] text-text-muted uppercase">
              Reasoning extraction
            </p>
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              <li>Reading your explanation</li>
              <li>Identifying the evidence you used</li>
              <li>Separating observations from assumptions</li>
              <li>Preparing the next reasoning check</li>
            </ul>
            {analysis ? (
              <p className="mt-3 text-sm text-success">
                Structured analysis ready: {analysis.source}.
              </p>
            ) : (
              <p className="mt-3 text-sm text-text-muted">
                Evidence highlighted: {learner.analysis.evidence.join(", ")}.
              </p>
            )}
          </div>
        </div>
      ) : null}
      {stage === "hypothesis_ready" || stage === "verification_required" ? (
        <HypothesisBranch learner={learner} />
      ) : null}
      {stage === "verification_submitted" || stage === "intervention_ready" ? (
        <div className="rounded-lg border border-border bg-surface-inset p-4 text-sm text-text-primary">
          {learner.verification.focus}
        </div>
      ) : null}
      {stage === "intervention_shown" || stage === "retry_required" ? (
        learner.id === "learner-a" ? (
          <DifferenceVisualizer />
        ) : (
          <MultiplicationContrast />
        )
      ) : null}
      {stage === "retry_submitted" ? <EquationBridge /> : null}
      {stage === "reasoning_delta" ? (
        <ReasoningDelta learner={learner} />
      ) : null}
      {stage === "transfer_presented" ||
      stage === "transfer_submitted" ||
      stage === "session_complete" ? (
        <TransferVisualizer reveal={stage !== "transfer_presented"} />
      ) : null}
    </motion.div>
  );
}
