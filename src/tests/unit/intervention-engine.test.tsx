import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InterventionCanvas } from "@/components/visualization/interventions";
import { getMisconceptionById, getProblemById } from "@/data/education";
import {
  buildInterventionEngineInput,
  containsAnswerLeakage,
  DeterministicInterventionEscalationPolicy,
  DeterministicInterventionPolicy,
  DeterministicInterventionRenderer,
  DeterministicInterventionSelector,
  familyForMisconception,
  interventionAdapterPromptVersion,
  OpenAIInterventionAdapter,
  validateInterventionSelection,
  type InterventionLevel,
  type InterventionSelection,
} from "@/lib/intervention-engine";
import type {
  SessionSnapshot,
  VerificationSnapshot,
} from "@/lib/session-engine/repository";

function baseSelection(
  overrides: Partial<InterventionSelection> = {},
): InterventionSelection {
  const problem = getProblemById("ads_sales_001");
  const config = new DeterministicInterventionRenderer().visualizerConfig({
    family: "consecutive_difference",
    level: 3,
    problem,
  });
  return {
    interventionRecordId: "iv_direction_without_rate_3",
    family: "consecutive_difference",
    level: 3,
    type: "highlight",
    title: "Consecutive differences",
    instructionalGoal: "Make the rate visible.",
    preservedUnderstanding: ["You noticed that both values increase."],
    learnerFacingContent:
      "You correctly noticed that both values increase. Now compare how much each value changes from one row to the next.",
    visualizerType: "consecutive_difference",
    visualizerConfig: config,
    revealsPartialAnswer: true,
    revealsFullAnswer: false,
    escalationAvailable: true,
    nextAllowedLevel: 4,
    selectionSource: "deterministic",
    selectionReason:
      "Selected the lowest useful intervention after verification.",
    supportLabel: "Focused comparison",
    safetyValidation: {
      answerLeakageChecked: true,
      passed: true,
      notes: ["Problem-aware answer leakage guard passed."],
    },
    ...overrides,
  };
}

function sessionFor(
  misconceptionId: string,
  family: InterventionSelection["family"],
  level: InterventionLevel,
  previousInterventions: InterventionSelection[] = [],
): SessionSnapshot {
  const verification: VerificationSnapshot = {
    id: "verification",
    questionTemplateId: "template",
    question: "check",
    response: "response",
    status: "answered",
    answerFormat: "short_text",
    verificationGoal: "goal",
    targetHypothesisIds: [misconceptionId],
    expectedEvidence: "expected",
    disconfirmingEvidence: "disconfirm",
    hypothesisBefore: null,
    hypothesisAfter: {
      status: "confirmed",
      confirmedMisconceptionId: misconceptionId,
      remainingHypotheses: [],
      supportedHypothesisIds: [misconceptionId],
      weakenedHypothesisIds: [],
      rejectedHypothesisIds: [],
      resolution: "resolved",
      evidenceSummary: ["verified"],
      requiresAdditionalVerification: false,
      additionalVerificationGoal: null,
      recommendedInterventionFamily: family,
      recommendedStartingLevel: level,
      safeLearnerSummary: {
        preservedUnderstanding: ["You noticed useful evidence."],
        verifiedLearningNeed: "A small support path fits this reasoning.",
        nextSystemAction: "MindTrace will prepare support.",
      },
    },
    createdAt: new Date().toISOString(),
    answeredAt: new Date().toISOString(),
  };
  return {
    sessionId: "session",
    publicId: "mt_test",
    mode: "pipeline",
    currentProblemId: "ads_sales_001",
    currentLearnerKey: "learner-a",
    currentStage: "intervention_ready",
    status: "active",
    educationalDataVersion: "step-04-prototype-v1",
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    fallbackMode: true,
    completedStages: [],
    attempts: [
      {
        id: "attempt",
        problemId: "ads_sales_001",
        attemptType: "initial",
        answer: "10",
        explanation: "The values keep increasing.",
        selectedApproach: "pattern_extension",
        confidence: "Unsure",
        submissionKey: "attempt-key",
        createdAt: new Date().toISOString(),
      },
    ],
    analysis: null,
    retryAnalysis: null,
    hypotheses: null,
    verification,
    intervention: null,
    interventionHistory: previousInterventions.map((item, index) => ({
      id: `intervention-${index}`,
      misconceptionId,
      ...item,
      replayCount: 0,
      interactions: [],
      acknowledgedAt: null,
      createdAt: new Date().toISOString(),
    })),
    supportUsage: {
      interventionCount: previousInterventions.length,
      highestLevelUsed: previousInterventions.reduce(
        (highest, item) => Math.max(highest, item.level),
        0,
      ),
      familiesUsed: [
        ...new Set(previousInterventions.map((item) => item.family)),
      ],
      visualizerTypesUsed: [
        ...new Set(previousInterventions.map((item) => item.visualizerType)),
      ],
      learnerRequestedHelpCount: 0,
      systemEscalationCount: 0,
      replayCount: 0,
      partialAnswerRevealed: previousInterventions.some(
        (item) => item.revealsPartialAnswer,
      ),
      fullAnswerRevealed: previousInterventions.some(
        (item) => item.revealsFullAnswer,
      ),
    },
    transfer: null,
    report: null,
    events: [],
  };
}

describe("intervention engine", () => {
  it("uses a versioned adapter prompt", () => {
    expect(interventionAdapterPromptVersion).toBe("intervention-adapter-v1");
  });

  it("maps misconception families", () => {
    expect(familyForMisconception("direction_without_rate", "none")).toBe(
      "consecutive_difference",
    );
    expect(familyForMisconception("additive_as_multiplicative", "none")).toBe(
      "additive_multiplicative_contrast",
    );
    expect(familyForMisconception("x_y_reversed", "none")).toBe(
      "variable_role_check",
    );
    expect(familyForMisconception("arithmetic_only_error", "none")).toBe(
      "arithmetic_check",
    );
  });

  it("selects Learner A and Learner B different interventions", async () => {
    const selector = new DeterministicInterventionSelector();
    const learnerA = await selector.select(
      buildInterventionEngineInput(
        sessionFor("direction_without_rate", "consecutive_difference", 3),
        [],
      ),
    );
    const learnerB = await selector.select(
      buildInterventionEngineInput(
        sessionFor(
          "additive_as_multiplicative",
          "additive_multiplicative_contrast",
          3,
        ),
        [],
      ),
    );
    expect(learnerA.family).toBe("consecutive_difference");
    expect(learnerA.level).toBe(3);
    expect(learnerB.family).toBe("additive_multiplicative_contrast");
    expect(learnerB.visualizerType).toBe("additive_multiplicative_contrast");
  });

  it("starts at the lowest useful level and never jumps to level 8 automatically", async () => {
    const selection = await new DeterministicInterventionSelector().select(
      buildInterventionEngineInput(
        sessionFor("direction_without_rate", "consecutive_difference", 2),
        [],
      ),
    );
    expect(selection.level).toBe(2);
    expect(selection.level).not.toBe(8);
  });

  it("escalates one level with an explicit learner reason", async () => {
    const previous = baseSelection({ level: 3 });
    const input = buildInterventionEngineInput(
      sessionFor("direction_without_rate", "consecutive_difference", 3, [
        previous,
      ]),
      [previous],
      true,
    );
    const selection = await new DeterministicInterventionSelector().select(
      input,
    );
    expect(selection.level).toBe(4);
    expect(selection.selectionReason).toContain("LEARNER_REQUESTED_MORE_HELP");
  });

  it("creates explicit escalation records", () => {
    const escalation = new DeterministicInterventionEscalationPolicy().next({
      currentLevel: 3,
      maximumPermittedLevel: 4,
      previousInterventionId: "previous",
      reasonCode: "LEARNER_REQUESTED_MORE_HELP",
      triggerSource: "learner",
    });
    expect(escalation.toLevel).toBe(4);
    expect(escalation.reasonCode).toBe("LEARNER_REQUESTED_MORE_HELP");
  });

  it("routes unresolved and arithmetic-only cases conservatively", () => {
    const policy = new DeterministicInterventionPolicy();
    expect(
      policy.resolveFamily({
        misconceptionId: null,
        recommendedFamily: "none",
      }),
    ).toBe("evidence_comparison");
    expect(
      policy.resolveFamily({
        misconceptionId: "arithmetic_only_error",
        recommendedFamily: "arithmetic_check",
      }),
    ).toBe("arithmetic_check");
  });

  it("detects answer, equation and accessibility-text leaks", () => {
    const problem = getProblemById("ads_sales_001");
    expect(containsAnswerLeakage("The answer is 11.", problem, false)).toBe(
      true,
    );
    expect(containsAnswerLeakage("Use y = 2x + 1.", problem, false)).toBe(true);
    expect(
      containsAnswerLeakage("Screen reader: final value 11.", problem, false),
    ).toBe(true);
  });

  it("rejects invalid full-answer support below level 8", () => {
    const problem = getProblemById("ads_sales_001");
    expect(() =>
      validateInterventionSelection(
        baseSelection({ level: 3, revealsFullAnswer: true }),
        problem,
      ),
    ).toThrow();
  });

  it("rejects unsafe OpenAI adaptation path when unconfigured", async () => {
    await expect(
      new OpenAIInterventionAdapter(false).adapt(baseSelection()),
    ).rejects.toMatchObject({ category: "AI_NOT_CONFIGURED" });
  });

  it("validates visualizer config schemas and hides lower-level offset", () => {
    const problem = getProblemById("ads_sales_001");
    const config = new DeterministicInterventionRenderer().visualizerConfig({
      family: "additive_multiplicative_contrast",
      level: 3,
      problem,
    });
    expect(config.visualizerType).toBe("additive_multiplicative_contrast");
    expect(config.showOffset).toBe(false);
  });

  it("renders consecutive-difference arrows and controls", () => {
    render(
      <InterventionCanvas
        intervention={{
          id: "id",
          misconceptionId: "direction_without_rate",
          replayCount: 0,
          interactions: [],
          acknowledgedAt: null,
          createdAt: new Date().toISOString(),
          ...baseSelection(),
        }}
      />,
    );
    expect(screen.getByText("Consecutive differences")).toBeVisible();
    expect(screen.getByRole("button", { name: "Replay" })).toBeVisible();
    expect(screen.getAllByText("+1 input, +2 output")).toHaveLength(2);
  });

  it("renders contrast visualizer predicted and observed values without final equation", () => {
    const problem = getProblemById("ads_sales_001");
    const config = new DeterministicInterventionRenderer().visualizerConfig({
      family: "additive_multiplicative_contrast",
      level: 3,
      problem,
    });
    render(
      <InterventionCanvas
        intervention={{
          id: "id",
          misconceptionId: "additive_as_multiplicative",
          replayCount: 0,
          interactions: [],
          acknowledgedAt: null,
          createdAt: new Date().toISOString(),
          ...baseSelection({
            family: "additive_multiplicative_contrast",
            visualizerType: "additive_multiplicative_contrast",
            visualizerConfig: config,
          }),
        }}
      />,
    );
    expect(screen.getByText(/Claim prediction: 4/)).toBeInTheDocument();
    expect(screen.getByText(/Observed value: 5/)).toBeInTheDocument();
    expect(screen.queryByText(/y = 2x/)).toBeNull();
  });

  it("loads curated intervention ladders", () => {
    expect(
      getMisconceptionById("direction_without_rate").interventionLadder.length,
    ).toBeGreaterThan(0);
  });
});
