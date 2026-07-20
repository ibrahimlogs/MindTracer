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
import type { SessionSnapshot } from "@/lib/session-engine";
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
  serverSessionId: string | null;
  analysisSummary: SessionSnapshot["analysis"];
  hypothesesSummary: SessionSnapshot["hypotheses"];
  verificationQuestion: SessionSnapshot["verification"];
  pendingAction: string | null;
  error: string | null;
  hydrateFromServer: (snapshot: SessionSnapshot) => void;
  loadSession: (sessionId: string) => Promise<void>;
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
  serverSessionId: null,
  analysisSummary: null,
  hypothesesSummary: null,
  verificationQuestion: null,
  pendingAction: null,
  error: null,
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

function createSubmissionKey(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

async function postSessionAction<TBody>(
  sessionId: string,
  path: string,
  body?: TBody,
) {
  const response = await fetch(`/api/sessions/${sessionId}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": createSubmissionKey(path.replaceAll("/", "-")),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = (await response.json()) as {
    success: boolean;
    data: SessionSnapshot | { session: SessionSnapshot } | null;
    error: { message: string } | null;
  };

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error?.message ?? "Session action failed.");
  }

  return "session" in payload.data ? payload.data.session : payload.data;
}

function stateFromSnapshot(
  snapshot: SessionSnapshot,
): Partial<LearningSessionState> {
  const initialAttempt = snapshot.attempts.find(
    (attempt) => attempt.attemptType === "initial",
  );
  const retryAttempt = snapshot.attempts.find(
    (attempt) => attempt.attemptType === "retry",
  );

  return {
    serverSessionId: snapshot.publicId,
    currentLearner: snapshot.currentLearnerKey,
    currentStage: snapshot.currentStage,
    completedStages: [...snapshot.completedStages],
    initialAnswer: initialAttempt?.answer ?? "",
    initialExplanation: initialAttempt?.explanation ?? "",
    selectedApproach: initialAttempt?.selectedApproach ?? "",
    confidence: initialAttempt?.confidence ?? "",
    verificationResponse: snapshot.verification?.response ?? "",
    retryAnswer: retryAttempt?.answer ?? "",
    retryExplanation: retryAttempt?.explanation ?? "",
    transferAttempt: snapshot.transfer?.answer ?? "",
    transferExplanation: snapshot.transfer?.explanation ?? "",
    transferCorrect: snapshot.transfer?.success ?? null,
    analysisSummary: snapshot.analysis,
    hypothesesSummary: snapshot.hypotheses,
    verificationQuestion: snapshot.verification,
    error: null,
  };
}

async function ensureVerificationQuestion(snapshot: SessionSnapshot) {
  if (
    snapshot.currentStage !== "verification_required" ||
    snapshot.verification
  ) {
    return snapshot;
  }
  return postSessionAction(snapshot.publicId, "/verification");
}

export const useLearningSessionStore = create<LearningSessionState>((set) => ({
  ...initialState,
  hydrateFromServer: (snapshot) => set(stateFromSnapshot(snapshot)),
  loadSession: async (sessionId) => {
    set({ pendingAction: "load-session", error: null });
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      const payload = (await response.json()) as {
        success: boolean;
        data: SessionSnapshot | null;
        error: { message: string } | null;
      };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error?.message ?? "Unable to load session.");
      }
      set({ ...stateFromSnapshot(payload.data), pendingAction: null });
    } catch (caught) {
      set({
        pendingAction: null,
        error:
          caught instanceof Error ? caught.message : "Unable to load session.",
      });
    }
  },
  selectLearner: (currentLearner) =>
    set((state) => ({
      ...initialState,
      currentLearner,
      demoMode: state.demoMode,
      demoSpeed: state.demoSpeed,
    })),
  setDemoMode: (demoMode) => set({ demoMode }),
  nextStage: () =>
    set((state) => {
      if (state.currentStage === "intervention_ready") {
        return {};
      }
      const sessionId = state.serverSessionId;
      if (sessionId) {
        const actionByStage: Partial<Record<LearningStage, string>> = {
          reasoning_analysis: "/analysis",
          hypothesis_ready: "/hypotheses",
          verification_submitted: "/interventions",
          retry_submitted: "/delta",
          reasoning_delta: "/transfer/start",
        };
        const action = actionByStage[state.currentStage];
        if (action) {
          void postSessionAction(sessionId, action)
            .then((snapshot) => ensureVerificationQuestion(snapshot))
            .then((snapshot) => set(stateFromSnapshot(snapshot)))
            .catch((caught: unknown) =>
              set({
                error:
                  caught instanceof Error
                    ? caught.message
                    : "Unable to advance session.",
              }),
            );
        }
      }
      return advanceFrom(state);
    }),
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
  submitInitialAttempt: (payload) => {
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
    }));
    void (async () => {
      const sessionId = useLearningSessionStore.getState().serverSessionId;
      if (!sessionId) return;
      try {
        const snapshot = await postSessionAction(sessionId, "/attempts", {
          answer: payload.answer,
          explanation: payload.explanation,
          selectedApproach: payload.approach,
          confidence: payload.confidence,
          submissionKey: createSubmissionKey("initial"),
        });
        useLearningSessionStore.setState(stateFromSnapshot(snapshot));
      } catch (caught) {
        useLearningSessionStore.setState({
          error:
            caught instanceof Error
              ? caught.message
              : "Unable to submit initial attempt.",
        });
      }
    })();
  },
  submitVerification: (verificationResponse) => {
    set((state) => ({
      verificationResponse,
      autoPlay: false,
      ...advanceFrom(state, "verification_submitted"),
    }));
    void (async () => {
      const sessionId = useLearningSessionStore.getState().serverSessionId;
      if (!sessionId) return;
      try {
        const snapshot = await postSessionAction(
          sessionId,
          "/verification/submit",
          {
            response: verificationResponse,
            submissionKey: createSubmissionKey("verification"),
          },
        );
        const nextSnapshot = await ensureVerificationQuestion(snapshot);
        useLearningSessionStore.setState(stateFromSnapshot(nextSnapshot));
      } catch (caught) {
        useLearningSessionStore.setState({
          error:
            caught instanceof Error
              ? caught.message
              : "Unable to submit verification.",
        });
      }
    })();
  },
  acknowledgeIntervention: () => {
    set((state) => ({
      autoPlay: false,
      ...advanceFrom(state, "intervention_shown"),
    }));
    void (async () => {
      const sessionId = useLearningSessionStore.getState().serverSessionId;
      if (!sessionId) return;
      try {
        const snapshot = await postSessionAction(
          sessionId,
          "/interventions/acknowledge",
        );
        useLearningSessionStore.setState(stateFromSnapshot(snapshot));
      } catch (caught) {
        useLearningSessionStore.setState({
          error:
            caught instanceof Error
              ? caught.message
              : "Unable to acknowledge intervention.",
        });
      }
    })();
  },
  submitRetry: (payload) => {
    set((state) => ({
      retryAnswer: payload.answer,
      retryExplanation: payload.explanation,
      autoPlay: false,
      ...advanceFrom(state, "retry_submitted"),
    }));
    void (async () => {
      const sessionId = useLearningSessionStore.getState().serverSessionId;
      if (!sessionId) return;
      try {
        const snapshot = await postSessionAction(sessionId, "/retry", {
          answer: payload.answer,
          explanation: payload.explanation,
          submissionKey: createSubmissionKey("retry"),
        });
        useLearningSessionStore.setState(stateFromSnapshot(snapshot));
      } catch (caught) {
        useLearningSessionStore.setState({
          error:
            caught instanceof Error
              ? caught.message
              : "Unable to submit retry.",
        });
      }
    })();
  },
  submitTransfer: (payload) => {
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
    }));
    void (async () => {
      const sessionId = useLearningSessionStore.getState().serverSessionId;
      if (!sessionId) return;
      try {
        const snapshot = await postSessionAction(
          sessionId,
          "/transfer/submit",
          {
            answer: payload.answer,
            explanation: payload.explanation,
            supportUsed: false,
            submissionKey: createSubmissionKey("transfer"),
          },
        );
        useLearningSessionStore.setState(stateFromSnapshot(snapshot));
      } catch (caught) {
        useLearningSessionStore.setState({
          error:
            caught instanceof Error
              ? caught.message
              : "Unable to submit transfer.",
        });
      }
    })();
  },
}));
