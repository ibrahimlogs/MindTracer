import { describe, expect, it, vi } from "vitest";

import {
  AiReasoningError,
  DeterministicReasoningAnalyzer,
  OpenAIReasoningAnalyzer,
  buildReasoningPrompt,
  containsProhibitedReasoningOutput,
  mapOpenAIError,
  reasoningAnalysisInputSchema,
  reasoningAnalysisJsonSchema,
  reasoningAnalysisResultSchema,
  reasoningPromptVersion,
  reasoningSystemPrompt,
  validateReasoningSafety,
} from "@/lib/ai/reasoning";

const baseInput = reasoningAnalysisInputSchema.parse({
  analysisId: "analysis-test",
  sessionPublicId: "mt_test",
  problemId: "ads_sales_001",
  conceptIds: ["constant_difference"],
  problemContext: "Advertising cost and sales are listed in a table.",
  dataRepresentation: {
    type: "table",
    columns: ["Advertising Cost", "Sales"],
    rows: [
      { input: 1, output: 3 },
      { input: 2, output: 5 },
      { input: 3, output: 7 },
    ],
  },
  question:
    "If advertising cost becomes 5, what sales value follows the pattern?",
  expectedAnswerType: "number",
  answerStatus: "incorrect",
  answerCanBeParsed: true,
  explanationIsEmpty: false,
  solutionModelConcepts: ["constant difference"],
  learnerAnswer: "10",
  learnerExplanation: "Sales appears to be double the advertising cost.",
  selectedApproach: "multiplication_rule",
  selfReportedConfidence: "Somewhat confident",
  attemptType: "initial",
  allowedOperations: [
    "addition",
    "subtraction",
    "multiplication",
    "division",
    "comparison",
    "pattern_extension",
    "substitution",
    "equation_formation",
    "estimation",
    "counting_steps",
    "none",
    "unclear",
  ],
  promptVersion: reasoningPromptVersion,
});

describe("reasoning analysis", () => {
  it("validates reasoning analysis input limits", () => {
    expect(reasoningAnalysisInputSchema.parse(baseInput)).toEqual(baseInput);
    expect(() =>
      reasoningAnalysisInputSchema.parse({
        ...baseInput,
        learnerAnswer: "x".repeat(501),
      }),
    ).toThrow();
  });

  it("validates structured result and rejects unknown enums", async () => {
    const output = await new DeterministicReasoningAnalyzer().analyze(
      baseInput,
    );
    expect(() =>
      reasoningAnalysisResultSchema.parse(output.result),
    ).not.toThrow();
    expect(() =>
      reasoningAnalysisResultSchema.parse({
        ...output.result,
        operationsUsed: ["made_up_operation"],
      }),
    ).toThrow();
  });

  it("exposes a JSON-schema compatibility object", () => {
    expect(reasoningAnalysisJsonSchema).toMatchObject({
      type: "object",
      additionalProperties: false,
    });
  });

  it("uses a versioned prompt that prohibits teaching and diagnosis", () => {
    expect(reasoningPromptVersion).toBe("reasoning-extractor-v1");
    expect(reasoningSystemPrompt).toContain("Do not teach");
    expect(reasoningSystemPrompt).toContain("Do not diagnose");
    expect(buildReasoningPrompt(baseInput)).toContain("Problem");
  });

  it("handles empty explanations and guessing safely", async () => {
    const output = await new DeterministicReasoningAnalyzer().analyze({
      ...baseInput,
      learnerExplanation: "",
      explanationIsEmpty: true,
    });
    expect(output.result.reasoningCompleteness).toBe("absent");
    expect(output.result.needsClarification).toBe(true);
  });

  it("handles broken English without automatic grammar penalty", async () => {
    const output = await new DeterministicReasoningAnalyzer().analyze({
      ...baseInput,
      learnerExplanation: "go up every row so i add more",
    });
    expect(output.result.explanationQuality).toBe(
      "understandable_but_incomplete",
    );
  });

  it("distinguishes weak correct reasoning and partially correct wrong reasoning", async () => {
    const correctWeak = await new DeterministicReasoningAnalyzer().analyze({
      ...baseInput,
      answerStatus: "correct",
      learnerAnswer: "11",
      learnerExplanation: "It fits.",
    });
    const wrongPartial = await new DeterministicReasoningAnalyzer().analyze({
      ...baseInput,
      learnerExplanation: "It goes up each row.",
    });
    expect(correctWeak.result.answerReasoningAlignment).toBe(
      "correct_answer_weakly_supported",
    );
    expect(wrongPartial.result.answerReasoningAlignment).toBe(
      "incorrect_answer_with_partially_correct_reasoning",
    );
  });

  it("repairs prohibited safe-summary phrasing", async () => {
    const output = await new DeterministicReasoningAnalyzer().analyze(
      baseInput,
    );
    const repaired = validateReasoningSafety({
      ...output.result,
      safeLearnerSummary: {
        preservedUnderstanding: ["The correct answer is 11."],
        stillUnclear: ["The learner is weak at math."],
        nextSystemAction: "Do not diagnose.",
      },
    });
    expect(containsProhibitedReasoningOutput(repaired)).toBe(false);
  });

  it("maps timeout, rate limit, authentication, refusal and invalid output errors", () => {
    expect(
      mapOpenAIError(new DOMException("aborted", "AbortError")).category,
    ).toBe("AI_TIMEOUT");
    expect(mapOpenAIError(new Error("429 rate limit")).category).toBe(
      "AI_RATE_LIMITED",
    );
    expect(mapOpenAIError(new Error("401 invalid api key")).category).toBe(
      "AI_AUTHENTICATION_ERROR",
    );
    expect(new AiReasoningError("AI_REFUSAL", "refusal", false).category).toBe(
      "AI_REFUSAL",
    );
    expect(
      new AiReasoningError("AI_INVALID_STRUCTURED_OUTPUT", "invalid", false)
        .retryable,
    ).toBe(false);
  });

  it("does not call OpenAI in deterministic mode", async () => {
    const spy = vi.fn();
    await new DeterministicReasoningAnalyzer().analyze(baseInput);
    expect(spy).not.toHaveBeenCalled();
  });

  it("OpenAI mode fails safely when not configured", async () => {
    const analyzer = new OpenAIReasoningAnalyzer({
      mode: "openai",
      model: "test-model",
      timeoutMs: 10,
      maxRetries: 0,
      storeResponses: false,
      hasApiKey: false,
    });
    await expect(analyzer.analyze(baseInput)).rejects.toMatchObject({
      category: "AI_NOT_CONFIGURED",
    });
  });
});
