"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";

import { DemoControls } from "@/components/demo/demo-controls";
import { GuidePanel } from "@/components/mindtrace";
import {
  InitialAnswerForm,
  ProblemContext,
  RetryForm,
  TransferForm,
  VerificationResponseForm,
} from "@/components/problem";
import { LearnerSwitcher, ReasoningTimeline } from "@/components/reasoning";
import { Button } from "@/components/ui/button";
import { ElevatedSurface } from "@/components/ui/surface";
import { ReasoningWorkspaceCanvas } from "@/components/visualization";
import { getDemoLearner } from "@/data/demo/demo-learners";
import { stageLabels } from "@/lib/demo-learning/stages";
import { useLearningSessionStore } from "@/stores/learning-session-store";
import type { DemoMode } from "@/types/demo-learning";

const speedMs = {
  slow: 2400,
  normal: 1500,
  fast: 850,
} as const;

interface WorkspaceShellProps {
  mode: DemoMode;
}

export function WorkspaceShell({ mode }: WorkspaceShellProps) {
  const currentLearner = useLearningSessionStore(
    (state) => state.currentLearner,
  );
  const currentStage = useLearningSessionStore((state) => state.currentStage);
  const autoPlay = useLearningSessionStore((state) => state.autoPlay);
  const demoSpeed = useLearningSessionStore((state) => state.demoSpeed);
  const completedStages = useLearningSessionStore(
    (state) => state.completedStages,
  );
  const selectLearner = useLearningSessionStore((state) => state.selectLearner);
  const setDemoMode = useLearningSessionStore((state) => state.setDemoMode);
  const nextStage = useLearningSessionStore((state) => state.nextStage);
  const previousStage = useLearningSessionStore((state) => state.previousStage);
  const jumpToStage = useLearningSessionStore((state) => state.jumpToStage);
  const restartDemo = useLearningSessionStore((state) => state.restartDemo);
  const startAutoPlay = useLearningSessionStore((state) => state.startAutoPlay);
  const stopAutoPlay = useLearningSessionStore((state) => state.stopAutoPlay);
  const setDemoSpeed = useLearningSessionStore((state) => state.setDemoSpeed);
  const submitInitialAttempt = useLearningSessionStore(
    (state) => state.submitInitialAttempt,
  );
  const submitVerification = useLearningSessionStore(
    (state) => state.submitVerification,
  );
  const acknowledgeIntervention = useLearningSessionStore(
    (state) => state.acknowledgeIntervention,
  );
  const submitRetry = useLearningSessionStore((state) => state.submitRetry);
  const submitTransfer = useLearningSessionStore(
    (state) => state.submitTransfer,
  );
  const learner = getDemoLearner(currentLearner);

  useEffect(() => {
    setDemoMode(mode);
  }, [mode, setDemoMode]);

  useEffect(() => {
    if (!autoPlay) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stopAutoPlay();
      return;
    }
    const timeout = window.setTimeout(() => {
      nextStage();
    }, speedMs[demoSpeed]);

    return () => window.clearTimeout(timeout);
  }, [autoPlay, currentStage, demoSpeed, nextStage, stopAutoPlay]);

  return (
    <main className="min-h-screen overflow-x-clip bg-background text-text-primary">
      <div className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-[96rem] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <Link href="/" className="font-semibold tracking-tight">
              MindTrace
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
              <span>Guided Demo</span>
              <span aria-hidden="true">/</span>
              <span>{learner.name}</span>
              <span aria-hidden="true">/</span>
              <span aria-live="polite">{stageLabels[currentStage]}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mode === "compare" ? (
              <LearnerSwitcher
                currentLearner={currentLearner}
                onSelect={selectLearner}
              />
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={restartDemo}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Restart
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/demo">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Exit demo
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[96rem] gap-4 px-4 py-4 sm:px-6">
        <div className="rounded-lg border border-border bg-surface-elevated p-3 text-sm md:hidden">
          Stage: {stageLabels[currentStage]}
        </div>
        <h1 className="sr-only">
          If advertising cost becomes 5, what sales value would follow the
          pattern?
        </h1>
        <div className="grid gap-4 lg:grid-cols-[34fr_38fr_28fr]">
          <ElevatedSurface className="p-5">
            <ProblemContext />
            <div className="mt-6 border-t border-border pt-5">
              {currentStage === "initial_attempt" ||
              currentStage === "problem_presented" ? (
                <InitialAnswerForm
                  learner={learner}
                  mode={mode}
                  onSubmit={submitInitialAttempt}
                />
              ) : null}
              {currentStage === "verification_required" ? (
                <VerificationResponseForm
                  learner={learner}
                  onSubmit={submitVerification}
                />
              ) : null}
              {currentStage === "intervention_ready" ? (
                <Button type="button" onClick={acknowledgeIntervention}>
                  Show smallest useful intervention
                </Button>
              ) : null}
              {currentStage === "retry_required" ? (
                <RetryForm learner={learner} onSubmit={submitRetry} />
              ) : null}
              {currentStage === "transfer_presented" ? (
                <TransferForm onSubmit={submitTransfer} />
              ) : null}
              {currentStage === "session_complete" ? (
                <div className="space-y-4">
                  <p className="text-sm text-success">
                    Session complete. Transfer evidence is ready for review.
                  </p>
                  <Button asChild>
                    <Link href="/report/demo-session">
                      Open Reasoning Delta report
                    </Link>
                  </Button>
                </div>
              ) : null}
            </div>
          </ElevatedSurface>

          <ElevatedSurface className="min-h-[28rem] p-5">
            <p className="text-xs font-medium tracking-[0.14em] text-text-muted uppercase">
              Visual reasoning canvas
            </p>
            <div className="mt-5">
              <ReasoningWorkspaceCanvas
                learner={learner}
                stage={currentStage}
              />
            </div>
          </ElevatedSurface>

          <ElevatedSurface className="p-5">
            <GuidePanel learner={learner} stage={currentStage} />
          </ElevatedSurface>
        </div>

        <ReasoningTimeline
          currentStage={currentStage}
          completedStages={completedStages}
          onJump={mode === "pipeline" ? jumpToStage : undefined}
        />
        <DemoControls
          autoPlay={autoPlay}
          demoSpeed={demoSpeed}
          onPrevious={previousStage}
          onNext={nextStage}
          onRestart={restartDemo}
          onAutoPlay={startAutoPlay}
          onPause={stopAutoPlay}
          onSpeed={setDemoSpeed}
          onJump={jumpToStage}
        />
      </div>
    </main>
  );
}
