import { beforeEach, describe, expect, it } from "vitest";

import { demoLearners, getDemoLearner } from "@/data/demo/demo-learners";
import { demoProblem } from "@/data/demo/demo-problem";
import { demoTransfer } from "@/data/demo/demo-transfer";
import {
  evaluateTransferAnswer,
  getNextStage,
  getPreviousStage,
} from "@/lib/demo-learning/stages";
import { initialAttemptSchema } from "@/lib/demo-learning/forms";
import { useLearningSessionStore } from "@/stores/learning-session-store";

const initialAttempt = {
  answer: "10",
  explanation: "I used the pattern I saw in the values.",
  approach: "I looked for a repeated pattern",
  confidence: "Unsure",
};

describe("mocked learning session state machine", () => {
  beforeEach(() => {
    useLearningSessionStore.getState().restartDemo();
  });

  it("moves through adjacent stages", () => {
    const store = useLearningSessionStore.getState();

    expect(getNextStage("problem_presented")).toBe("initial_attempt");
    expect(getPreviousStage("initial_attempt")).toBe("problem_presented");

    store.nextStage();
    expect(useLearningSessionStore.getState().currentStage).toBe(
      "initial_attempt",
    );
  });

  it("prevents invalid next transitions past the terminal stage", () => {
    useLearningSessionStore.setState({ currentStage: "session_complete" });
    useLearningSessionStore.getState().nextStage();

    expect(useLearningSessionStore.getState().currentStage).toBe(
      "session_complete",
    );
  });

  it("switches learner and keeps the selected demo mode", () => {
    useLearningSessionStore.setState({ demoMode: "pipeline" });
    useLearningSessionStore.getState().selectLearner("learner-b");

    expect(useLearningSessionStore.getState()).toMatchObject({
      currentLearner: "learner-b",
      demoMode: "pipeline",
      currentStage: "problem_presented",
    });
  });

  it("restarts the active learner path", () => {
    useLearningSessionStore.setState({
      currentLearner: "learner-b",
      currentStage: "reasoning_delta",
      initialAnswer: "10",
    });
    useLearningSessionStore.getState().restartDemo();

    expect(useLearningSessionStore.getState()).toMatchObject({
      currentLearner: "learner-b",
      currentStage: "problem_presented",
      initialAnswer: "",
    });
  });

  it("pauses auto-play on user form interaction", () => {
    useLearningSessionStore.setState({ autoPlay: true });
    useLearningSessionStore.getState().submitInitialAttempt(initialAttempt);

    expect(useLearningSessionStore.getState()).toMatchObject({
      autoPlay: false,
      currentStage: "reasoning_analysis",
    });
  });
});

describe("mock data and validation", () => {
  it("validates the initial answer form", () => {
    expect(initialAttemptSchema.safeParse(initialAttempt).success).toBe(true);
    expect(
      initialAttemptSchema.safeParse({
        answer: "",
        explanation: "short",
        approach: "",
        confidence: "",
      }).success,
    ).toBe(false);
  });

  it("keeps the mocked problem answer hidden in data but available for checks", () => {
    expect(demoProblem.correctAnswer).toBe("11");
    expect(demoLearners.map((learner) => learner.answer)).toEqual(["10", "10"]);
  });

  it("uses different interventions for Learner A and Learner B", () => {
    expect(getDemoLearner("learner-a").intervention.title).toBe(
      "Highlight consecutive differences",
    );
    expect(getDemoLearner("learner-b").intervention.title).toBe(
      "Contrast predicted and observed values",
    );
  });

  it("evaluates transfer answers deterministically", () => {
    expect(demoTransfer.correctAnswer).toBe("64");
    expect(evaluateTransferAnswer("64")).toBe(true);
    expect(evaluateTransferAnswer("63")).toBe(false);
  });

  it("contains learner-specific Reasoning Delta content", () => {
    expect(getDemoLearner("learner-a").reasoningDelta.after).toContain(
      "Constant change",
    );
    expect(getDemoLearner("learner-b").reasoningDelta.conflict).toContain(
      "expected 4",
    );
  });
});
