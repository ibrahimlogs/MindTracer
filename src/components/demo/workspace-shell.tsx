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
  sessionId: string;
}

export function WorkspaceShell({ mode, sessionId }: WorkspaceShellProps) {
  const currentLearner = useLearningSessionStore(
    (state) => state.currentLearner,
  );
  const currentStage = useLearningSessionStore((state) => state.currentStage);
  const autoPlay = useLearningSessionStore((state) => state.autoPlay);
  const demoSpeed = useLearningSessionStore((state) => state.demoSpeed);
  const completedStages = useLearningSessionStore(
    (state) => state.completedStages,
  );
  const analysisSummary = useLearningSessionStore(
    (state) => state.analysisSummary,
  );
  const hypothesesSummary = useLearningSessionStore(
    (state) => state.hypothesesSummary,
  );
  const verificationQuestion = useLearningSessionStore(
    (state) => state.verificationQuestion,
  );
  const interventionSummary = useLearningSessionStore(
    (state) => state.interventionSummary,
  );
  const report = useLearningSessionStore((state) => state.report);
  const serverSessionId = useLearningSessionStore(
    (state) => state.serverSessionId,
  );
  const selectLearner = useLearningSessionStore((state) => state.selectLearner);
  const setDemoMode = useLearningSessionStore((state) => state.setDemoMode);
  const loadSession = useLearningSessionStore((state) => state.loadSession);
  const error = useLearningSessionStore((state) => state.error);
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
  const showIntervention = useLearningSessionStore(
    (state) => state.showIntervention,
  );
  const requestMoreHelp = useLearningSessionStore(
    (state) => state.requestMoreHelp,
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
    void loadSession(sessionId);
  }, [loadSession, sessionId]);

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
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text-muted">
              <span>Interactive learning demo</span>
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

      <div className="mx-auto grid max-w-[96rem] gap-5 px-4 py-5 sm:px-6">
        <div className="rounded-[1.25rem] bg-white p-4 text-sm font-semibold text-text-secondary md:hidden">
          Step: {stageLabels[currentStage]}
        </div>
        {error ? (
          <div className="rounded-[1.25rem] bg-error-soft p-4 text-base text-error">
            {error} You can restart the demo or continue with the reviewed path.
          </div>
        ) : null}
        <h1 className="sr-only">
          If advertising cost becomes 5, what sales value would follow the
          pattern?
        </h1>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,68fr)_minmax(22rem,32fr)]">
          <ElevatedSurface className="p-6 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-reasoning">
                  Constant Difference
                </p>
                <h1 className="mt-1 text-2xl font-semibold">
                  {stageLabels[currentStage]}
                </h1>
              </div>
              <span className="rounded-full bg-surface-soft px-4 py-2 text-sm font-semibold text-text-muted">
                Step {Math.min(completedStages.length + 1, 7)} of 7
              </span>
            </div>
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
                  question={verificationQuestion?.question}
                  expectedResponseType={verificationQuestion?.answerFormat}
                  onSubmit={submitVerification}
                />
              ) : null}
              {currentStage === "intervention_ready" ? (
                <Button type="button" onClick={showIntervention}>
                  Show smallest useful intervention
                </Button>
              ) : null}
              {currentStage === "intervention_shown" ? (
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={acknowledgeIntervention}>
                    Let me try again
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={requestMoreHelp}
                  >
                    I need another hint
                  </Button>
                </div>
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
                    <Link href={`/report/${serverSessionId ?? "demo-session"}`}>
                      Open Reasoning Delta report
                    </Link>
                  </Button>
                </div>
              ) : null}
            </div>
            <div className="mt-8 rounded-[1.5rem] bg-surface-soft p-4">
              <p className="text-sm font-semibold text-text-muted">
                Visual explanation
              </p>
              <div className="mt-4">
                <ReasoningWorkspaceCanvas
                  learner={learner}
                  stage={currentStage}
                  analysis={analysisSummary}
                  hypotheses={hypothesesSummary}
                  verification={verificationQuestion}
                  intervention={interventionSummary}
                  report={report}
                />
              </div>
            </div>
          </ElevatedSurface>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <ElevatedSurface className="p-5">
              <GuidePanel
                learner={learner}
                stage={currentStage}
                analysis={analysisSummary}
                hypotheses={hypothesesSummary}
                verification={verificationQuestion}
                intervention={interventionSummary}
                report={report}
                mode={mode}
              />
            </ElevatedSurface>
          </aside>
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
