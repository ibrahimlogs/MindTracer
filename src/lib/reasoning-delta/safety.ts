import {
  reasoningDeltaOutputSchema,
  type ReasoningDeltaOutput,
} from "./schemas.ts";

const prohibited = [
  "iq",
  "lazy",
  "weak learner",
  "bad at math",
  "visual learner",
  "auditory learner",
  "%",
  "mastery score",
  "chain-of-thought",
];

export function validateReasoningDeltaOutput(output: ReasoningDeltaOutput) {
  const parsed = reasoningDeltaOutputSchema.parse(output);
  const text = JSON.stringify(parsed).toLowerCase();
  const blocked = prohibited.find((term) => text.includes(term));
  if (blocked) {
    throw new Error(
      `Reasoning Delta output contains prohibited language: ${blocked}`,
    );
  }
  if (
    parsed.overallChange !== "insufficient_evidence" &&
    parsed.correctedReasoning.length === 0 &&
    parsed.newUnderstanding.length === 0 &&
    parsed.overallChange !== "unchanged"
  ) {
    throw new Error(
      "Reasoning Delta cannot claim improvement without evidence.",
    );
  }
  return parsed;
}
