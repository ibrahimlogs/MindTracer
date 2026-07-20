import {
  reasoningAnalysisResultSchema,
  type ReasoningAnalysisResult,
} from "@/lib/ai/reasoning/schema";

const prohibitedPatterns = [
  /\b(unintelligent|stupid|lazy|incapable|bad at math|weak at math)\b/i,
  /\b(visual learner|auditory learner|kinesthetic learner)\b/i,
  /\b(personality|motivation|emotional state)\b/i,
  /\b(has the .* misconception|diagnosed with|proves the learner)\b/i,
  /\b(correct answer is|answer should be|the answer is 11)\b/i,
  /\b\d+%\b/,
];

function scrub(text: string) {
  return prohibitedPatterns.reduce(
    (current, pattern) => current.replace(pattern, "evidence is still unclear"),
    text,
  );
}

function hasProhibitedText(value: unknown): boolean {
  if (typeof value === "string") {
    return prohibitedPatterns.some((pattern) => pattern.test(value));
  }
  if (Array.isArray(value)) return value.some(hasProhibitedText);
  if (value && typeof value === "object") {
    return Object.values(value).some(hasProhibitedText);
  }
  return false;
}

export function validateReasoningSafety(result: ReasoningAnalysisResult) {
  if (!hasProhibitedText(result)) return result;

  const repaired = structuredClone(result);
  repaired.safeLearnerSummary = {
    preservedUnderstanding:
      result.safeLearnerSummary.preservedUnderstanding.map(scrub),
    stillUnclear: result.safeLearnerSummary.stillUnclear.map(scrub),
    nextSystemAction: scrub(result.safeLearnerSummary.nextSystemAction),
  };
  repaired.internalNotes = scrub(result.internalNotes);
  repaired.extractionConfidenceBand =
    repaired.extractionConfidenceBand === "high"
      ? "medium"
      : repaired.extractionConfidenceBand;

  return reasoningAnalysisResultSchema.parse(repaired);
}

export function containsProhibitedReasoningOutput(value: unknown) {
  return hasProhibitedText(value);
}
