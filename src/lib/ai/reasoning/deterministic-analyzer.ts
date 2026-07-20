import type {
  ReasoningAnalyzer,
  ReasoningAnalyzerOutput,
} from "@/lib/ai/reasoning/analyzer";
import type { ReasoningAnalysisInput } from "@/lib/ai/reasoning/schema";
import type { ReasoningAnalysisResult } from "@/lib/ai/reasoning/schema";

function includesAny(text: string, terms: readonly string[]) {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

export class DeterministicReasoningAnalyzer implements ReasoningAnalyzer {
  async analyze(
    input: ReasoningAnalysisInput,
  ): Promise<ReasoningAnalyzerOutput> {
    const startedAt = performance.now();
    const text = `${input.learnerAnswer} ${input.learnerExplanation} ${input.selectedApproach ?? ""}`;
    const mentionsDouble = includesAny(text, ["double", "times 2", "multiply"]);
    const mentionsDifference = includesAny(text, [
      "goes up",
      "increase",
      "add",
      "+",
      "difference",
    ]);
    const mentionsGuess = includesAny(text, [
      "guess",
      "probably",
      "around",
      "think",
    ]);

    const relationshipClaimed: ReasoningAnalysisResult["relationshipClaimed"] =
      mentionsDouble
        ? "direct_multiplication"
        : mentionsDifference
          ? "constant_difference"
          : mentionsGuess
            ? "approximate_growth"
            : "unclear";

    const operationsUsed = [
      ...(mentionsDifference
        ? (["addition", "pattern_extension"] as const)
        : []),
      ...(mentionsDouble ? (["multiplication"] as const) : []),
      ...(mentionsGuess ? (["estimation"] as const) : []),
    ];

    const result: ReasoningAnalysisResult = {
      observedClaims: input.learnerExplanation
        ? [
            {
              claim: mentionsDouble
                ? "The learner states or implies a multiplication rule."
                : "The learner states that the values increase.",
              evidenceQuoteFragment: input.learnerExplanation.slice(0, 160),
              source: "explanation" as const,
              certainty: "explicit" as const,
            },
          ]
        : [],
      inferredReasoningSteps: [
        {
          step: mentionsDouble
            ? "The learner appears to compare sales with advertising by multiplying."
            : "The learner appears to extend the visible pattern.",
          evidenceBasis:
            input.learnerExplanation || input.learnerAnswer || "No explanation",
          inferenceStrength: input.explanationIsEmpty
            ? ("weak" as const)
            : ("moderate" as const),
        },
      ],
      relationshipClaimed,
      relationshipOtherDescription: null,
      operationsUsed: operationsUsed.length
        ? operationsUsed
        : (["unclear"] as const),
      evidenceReferenced: mentionsDifference
        ? [
            {
              evidenceType: "verbal_pattern" as const,
              description: "The response references values increasing.",
              problemReference: "table pattern",
              supportStrength: "partial" as const,
            },
          ]
        : [
            {
              evidenceType: "none" as const,
              description: "No specific table evidence is named.",
              problemReference: "learner explanation",
              supportStrength: "weak" as const,
            },
          ],
      evidenceIgnored: mentionsDouble
        ? [
            {
              description:
                "The multiplication claim is not checked against every row.",
              relevance:
                "A direct multiplication rule would need to fit each table row.",
              omissionConfidence: "medium" as const,
            },
          ]
        : [],
      correctObservations: mentionsDifference
        ? ["The learner noticed that the output values increase."]
        : [],
      unsupportedClaims: mentionsDouble
        ? [
            "The direct multiplication claim is not supported by all provided rows.",
          ]
        : [],
      contradictionSignals: [],
      uncertaintySignals:
        input.explanationIsEmpty || mentionsGuess
          ? [
              {
                signal: input.explanationIsEmpty
                  ? "empty explanation"
                  : "approximate language",
                source: input.explanationIsEmpty
                  ? "explanation"
                  : "explanation wording",
                meaning:
                  "The system needs one more check before choosing support.",
              },
            ]
          : [],
      reasoningCompleteness: input.explanationIsEmpty
        ? ("absent" as const)
        : mentionsGuess
          ? ("minimal" as const)
          : ("partial" as const),
      answerReasoningAlignment:
        input.answerStatus === "correct"
          ? ("correct_answer_weakly_supported" as const)
          : mentionsDifference
            ? ("incorrect_answer_with_partially_correct_reasoning" as const)
            : ("incorrect_answer_with_incorrect_reasoning" as const),
      explanationQuality: input.explanationIsEmpty
        ? ("absent" as const)
        : mentionsGuess
          ? ("vague" as const)
          : ("understandable_but_incomplete" as const),
      needsClarification: true,
      clarificationGoal: mentionsDouble
        ? "Determine whether the learner tested the multiplication rule against multiple rows."
        : "Determine whether the learner compared consecutive changes or only the direction of growth.",
      extractionConfidenceBand: input.explanationIsEmpty
        ? ("insufficient_evidence" as const)
        : ("medium" as const),
      safeLearnerSummary: {
        preservedUnderstanding: mentionsDifference
          ? ["You noticed that the values increase."]
          : ["You gave an answer that can be checked against the table."],
        stillUnclear: [
          mentionsDouble
            ? "It is not yet clear whether the rule was tested against each row."
            : "It is not yet clear whether the repeated change between rows was compared.",
        ],
        nextSystemAction:
          "MindTrace will check one small part of the reasoning before choosing support.",
      },
      internalNotes:
        "Deterministic prototype extraction; no misconception diagnosis.",
    };

    return {
      source: "deterministic",
      result,
      metadata: {
        provider: "mindtrace",
        model: "deterministic-v1",
        responseId: null,
        latencyMs: Math.round(performance.now() - startedAt),
        retryCount: 0,
        analyzerMode: "deterministic",
        storageRequested: false,
        finishStatus: "completed",
      },
    };
  }
}
