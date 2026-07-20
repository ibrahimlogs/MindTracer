"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { SectionContainer } from "@/components/layout/primitives";
import { StatusPill } from "@/components/ui/status-pill";
import {
  clampJudgeSceneIndex,
  getJudgeFallbackLabel,
  initialJudgeController,
  judgeDemoProblem,
  judgeScenes,
  type JudgeDemoMode,
} from "@/lib/judge-demo";

import { ArchitectureSummary } from "./architecture-summary";
import { ClosingScene } from "./closing-scene";
import { DeltaScene } from "./delta-scene";
import { DemoControls } from "./demo-controls";
import { DemoIntroduction } from "./demo-introduction";
import { DemoProgress } from "./demo-progress";
import { EvaluationSummary } from "./evaluation-summary";
import { InterventionScene } from "./intervention-scene";
import { LearnerScene, EvidenceList } from "./learner-scene";
import { TransferScene } from "./transfer-scene";
import { VerificationScene } from "./verification-scene";

const storageKey = "mindtrace-judge-demo";

interface RestoredJudgeState {
  started: boolean;
  snapshot: typeof initialJudgeController;
}

function getInitialJudgeState(): RestoredJudgeState {
  if (typeof window === "undefined") {
    return { started: false, snapshot: initialJudgeController };
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return { started: false, snapshot: initialJudgeController };

    const parsed = JSON.parse(stored) as Partial<
      typeof initialJudgeController
    > & {
      started?: boolean;
    };

    return {
      started: Boolean(parsed.started),
      snapshot: {
        ...initialJudgeController,
        mode: parsed.mode === "interactive" ? "interactive" : "guided",
        sceneIndex: clampJudgeSceneIndex(parsed.sceneIndex ?? 0),
        isPlaying: false,
        playback: parsed.playback === "fast" ? "fast" : "normal",
        focus:
          parsed.focus === "learner-a" || parsed.focus === "learner-b"
            ? parsed.focus
            : "both",
      },
    };
  } catch (error) {
    console.warn("Judge demo state could not be restored.", error);
    return { started: false, snapshot: initialJudgeController };
  }
}

export function JudgeDemoShell() {
  const [state, setState] = useState(getInitialJudgeState);
  const { snapshot, started } = state;

  const scene = judgeScenes[snapshot.sceneIndex] ?? judgeScenes[0]!;
  const delay = scene.durationMs / (snapshot.playback === "fast" ? 2 : 1);

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ ...snapshot, started }),
    );
  }, [snapshot, started]);

  useEffect(() => {
    if (!snapshot.isPlaying) return;

    const timeout = window.setTimeout(() => {
      setState((currentState) => {
        const current = currentState.snapshot;
        const nextIndex = clampJudgeSceneIndex(current.sceneIndex + 1);
        return {
          ...currentState,
          snapshot: {
            ...current,
            sceneIndex: nextIndex,
            isPlaying:
              nextIndex === current.sceneIndex ? false : current.isPlaying,
          },
        };
      });
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [delay, snapshot.isPlaying, snapshot.sceneIndex]);

  const sourceLabel = useMemo(
    () => getJudgeFallbackLabel(scene.source),
    [scene.source],
  );

  function stopForManualAction(update: Partial<typeof snapshot>) {
    setState((current) => ({
      ...current,
      snapshot: { ...current.snapshot, ...update, isPlaying: false },
    }));
  }

  if (!started) {
    return (
      <SectionContainer>
        <DemoIntroduction
          onStart={() => {
            setState((current) => ({
              started: true,
              snapshot: { ...current.snapshot, isPlaying: true },
            }));
          }}
          onExplore={() => {
            setState((current) => ({
              started: true,
              snapshot: { ...current.snapshot, mode: "interactive" },
            }));
          }}
        />
      </SectionContainer>
    );
  }

  return (
    <SectionContainer className="py-6 sm:py-10">
      <div className="grid gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <StatusPill
              tone={scene.source === "cached_demo" ? "attention" : "success"}
            >
              {sourceLabel}
            </StatusPill>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              {scene.title}
            </h1>
            <p className="mt-4 max-w-3xl text-text-secondary">
              {snapshot.mode === "guided"
                ? "A guided learning story using reviewed learner responses."
                : "Interactive mode is a prototype path for curated problems."}
            </p>
          </div>
          <div className="rounded-full bg-surface-soft px-4 py-2 text-sm font-semibold text-text-muted">
            Focus: {snapshot.focus.replace("-", " ")}
          </div>
        </div>

        <DemoProgress sceneIndex={snapshot.sceneIndex} />
        <ProblemCard />

        <motion.section
          key={scene.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          aria-live="polite"
          className="lesson-shadow min-h-[24rem] rounded-[2rem] bg-white p-5 sm:p-8"
        >
          {renderScene(scene)}
        </motion.section>

        <DemoControls
          mode={snapshot.mode}
          isPlaying={snapshot.isPlaying}
          playback={snapshot.playback}
          onModeChange={(mode: JudgeDemoMode) => stopForManualAction({ mode })}
          onPlayPause={() =>
            setState((current) => ({
              ...current,
              snapshot: {
                ...current.snapshot,
                isPlaying: !current.snapshot.isPlaying,
              },
            }))
          }
          onRestart={() => {
            setState((current) => ({
              ...current,
              snapshot: { ...initialJudgeController, mode: snapshot.mode },
            }));
          }}
          onPrevious={() =>
            stopForManualAction({
              sceneIndex: clampJudgeSceneIndex(snapshot.sceneIndex - 1),
            })
          }
          onNext={() =>
            stopForManualAction({
              sceneIndex: clampJudgeSceneIndex(snapshot.sceneIndex + 1),
            })
          }
          onSkip={() =>
            stopForManualAction({
              sceneIndex: clampJudgeSceneIndex(snapshot.sceneIndex + 1),
            })
          }
          onPlaybackChange={() =>
            stopForManualAction({
              playback: snapshot.playback === "normal" ? "fast" : "normal",
            })
          }
        />

        {scene.kind === "closing" ? (
          <div className="grid gap-5">
            <ArchitectureSummary />
            <EvaluationSummary />
          </div>
        ) : null}
      </div>
    </SectionContainer>
  );
}

function ProblemCard() {
  return (
    <section className="rounded-[2rem] bg-surface-soft p-5">
      <p className="text-sm font-semibold text-text-muted">Same problem</p>
      <div className="mt-4 grid gap-5 lg:grid-cols-[0.55fr_1fr]">
        <table className="w-full text-left text-base">
          <thead className="text-text-muted">
            <tr>
              <th className="py-2">Advertising Cost</th>
              <th className="py-2">Sales</th>
            </tr>
          </thead>
          <tbody>
            {judgeDemoProblem.table.map(([cost, sales]) => (
              <tr key={cost} className="border-t border-border">
                <td className="py-3 font-mono">{cost}</td>
                <td className="py-3 font-mono">{sales}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <h2 className="text-2xl leading-tight font-semibold">
            {judgeDemoProblem.question}
          </h2>
          <p className="mt-3 text-base text-text-muted">
            Both learners answer 10. MindTrace delays the correct answer until
            the intervention stage to avoid answer leakage.
          </p>
        </div>
      </div>
    </section>
  );
}

function renderScene(scene: (typeof judgeScenes)[number]) {
  if (scene.kind === "learner") return <LearnerScene scene={scene} />;
  if (scene.kind === "verification") return <VerificationScene scene={scene} />;
  if (scene.kind === "intervention") return <InterventionScene scene={scene} />;
  if (scene.kind === "transfer") return <TransferScene scene={scene} />;
  if (scene.kind === "delta") return <DeltaScene scene={scene} />;
  if (scene.kind === "closing") return <ClosingScene scene={scene} />;
  return <EvidenceList scene={scene} />;
}
