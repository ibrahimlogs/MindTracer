"use client";

import { create } from "zustand";

import { demoTransfer } from "@/data/demo/demo-transfer";
import {
  canTransition,
  evaluateTransferAnswer,
  getNextStage,
  getPreviousStage,
  learningStages,
} from "@/lib/demo-learning/stages";
import type {
  DemoMode,
  DemoSpeed,
  LearnerId,
  LearningStage,
} from "@/types/demo-learning";

interface AttemptPayload {
  answer: string;
  explanation: string;
  approach: string;
  confidence: string;
}

interface RetryPayload {
  answer: string;
  explanation: string;
}

interface LearningSessionState {
  currentLearner: LearnerId;
  currentStage: LearningStage;
  demoMode: DemoMode;
  initialAnswer: string;
  initialExplanation: string;
  selectedApproach: string;
  confidence: string;
  verificationResponse: string;
  retryAnswer: string;
  retryExplanation: string;
  transferAttempt: string;
  transferExplanation: string;
  transferCorrect: boolean | null;
  autoPlay: boolean;
  demoSpeed: DemoSpeed;
  completedStages: LearningStage[];
  selectLearner: (learnerId: LearnerId) => void;
  setDemoMode: (mode: DemoMode) => void;
  nextStage: () => void;
  previousStage: () => void;
  jumpToStage: (stage: LearningStage) => void;
  restartDemo: () => void;
  startAutoPlay: () => void;
  stopAutoPlay: () => void;
  setDemoSpeed: (speed: DemoSpeed) => void;
  submitInitialAttempt: (payload: AttemptPayload) => void;
  submitVerification: (response: string) => void;
  acknowledgeIntervention: () => void;
  submitRetry: (payload: RetryPayload) => void;
  submitTransfer: (payload: RetryPayload) => void;
}

const initialState = {
  currentLearner: "learner-a" as LearnerId,
  currentStage: "problem_presented" as LearningStage,
  demoMode: "compare" as DemoMode,
  initialAnswer: "",
  initialExplanation: "",
  selectedApproach: "",
  confidence: "",
  verificationResponse: "",
  retryAnswer: "",
  retryExplanation: "",
  transferAttempt: "",
  transferExplanation: "",
  transferCorrect: null,
  autoPlay: false,
  demoSpeed: "normal" as DemoSpeed,
  completedStages: [] as LearningStage[],
};

function completeStage(completedStages: LearningStage[], stage: LearningStage) {
  return completedStages.includes(stage)
    ? completedStages
    : [...completedStages, stage];
}

function advanceFrom(
  state: LearningSessionState,
  target?: LearningStage,
): Partial<LearningSessionState> {
  const nextStage = target ?? getNextStage(state.currentStage);

  if (
    nextStage === state.currentStage ||
    !canTransition(state.currentStage, nextStage)
  ) {
    return {};
  }

  return {
    currentStage: nextStage,
    completedStages: completeStage(state.completedStages, state.currentStage),
  };
}

export const useLearningSessionStore = create<LearningSessionState>((set) => ({
  ...initialState,
  selectLearner: (currentLearner) =>
    set((state) => ({
      ...initialState,
      currentLearner,
      demoMode: state.demoMode,
      demoSpeed: state.demoSpeed,
    })),
  setDemoMode: (demoMode) => set({ demoMode }),
  nextStage: () => set((state) => advanceFrom(state)),
  previousStage: () =>
    set((state) => ({
      currentStage: getPreviousStage(state.currentStage),
      autoPlay: false,
    })),
  jumpToStage: (currentStage) =>
    set((state) =>
      state.demoMode === "pipeline" || learningStages.includes(currentStage)
        ? { currentStage, autoPlay: false }
        : {},
    ),
  restartDemo: () =>
    set((state) => ({
      ...initialState,
      currentLearner: state.currentLearner,
      demoMode: state.demoMode,
      demoSpeed: state.demoSpeed,
    })),
  startAutoPlay: () => set({ autoPlay: true }),
  stopAutoPlay: () => set({ autoPlay: false }),
  setDemoSpeed: (demoSpeed) => set({ demoSpeed }),
  submitInitialAttempt: (payload) =>
    set((state) => ({
      initialAnswer: payload.answer,
      initialExplanation: payload.explanation,
      selectedApproach: payload.approach,
      confidence: payload.confidence,
      autoPlay: false,
      currentStage: "reasoning_analysis",
      completedStages: completeStage(
        completeStage(state.completedStages, "problem_presented"),
        "initial_attempt",
      ),
    })),
  submitVerification: (verificationResponse) =>
    set((state) => ({
      verificationResponse,
      autoPlay: false,
      ...advanceFrom(state, "verification_submitted"),
    })),
  acknowledgeIntervention: () =>
    set((state) => ({
      autoPlay: false,
      ...advanceFrom(state, "intervention_shown"),
    })),
  submitRetry: (payload) =>
    set((state) => ({
      retryAnswer: payload.answer,
      retryExplanation: payload.explanation,
      autoPlay: false,
      ...advanceFrom(state, "retry_submitted"),
    })),
  submitTransfer: (payload) =>
    set((state) => ({
      transferAttempt: payload.answer,
      transferExplanation: payload.explanation,
      transferCorrect: evaluateTransferAnswer(payload.answer),
      autoPlay: false,
      completedStages: completeStage(
        completeStage(state.completedStages, "transfer_presented"),
        "transfer_submitted",
      ),
      currentStage:
        payload.answer.trim() === demoTransfer.correctAnswer
          ? "session_complete"
          : "transfer_submitted",
    })),
}));
