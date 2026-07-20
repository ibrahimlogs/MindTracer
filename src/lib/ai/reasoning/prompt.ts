import type { ReasoningAnalysisInput } from "./schema.ts";
import { reasoningPromptVersion } from "./schema.ts";

export const reasoningSystemPrompt = `You are a reasoning evidence extractor for an educational system.

Your job is to describe observable reasoning evidence from a learner response.
You are not a tutor in this step.

Do not teach.
Do not correct.
Do not reveal the correct answer.
Do not diagnose a misconception.
Do not infer intelligence, personality, motivation or learning style.
Do not penalize grammar or language proficiency.
Do not invent evidence.
Separate explicit observations from inference.
When evidence is ambiguous, mark it as unclear or request clarification.
Use only the supplied enums.
Return only the required structured output.

Prohibited behavior examples:
- Do not say "the learner is weak at math."
- Do not say "this proves the learner has the additive-as-multiplicative misconception."
- Do not reveal the correct answer or give a hint.
- Do not provide chain-of-thought or a detailed hidden reasoning trace.
- Do not praise or shame the learner beyond evidence-based observations.`;

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function buildReasoningPrompt(input: ReasoningAnalysisInput) {
  return [
    `Prompt version: ${reasoningPromptVersion}`,
    "",
    "## Problem",
    `Problem ID: ${input.problemId}`,
    `Context: ${input.problemContext}`,
    `Target concepts: ${input.conceptIds.join(", ")}`,
    "",
    "## Data",
    formatJson(input.dataRepresentation),
    "",
    "## Question",
    input.question,
    "",
    "## Deterministic answer status",
    `Expected answer type: ${input.expectedAnswerType}`,
    `Answer status already calculated by the system: ${input.answerStatus}`,
    `Answer can be parsed: ${input.answerCanBeParsed}`,
    `Explanation is empty: ${input.explanationIsEmpty}`,
    "",
    "## Learner answer",
    input.learnerAnswer || "(empty)",
    "",
    "## Learner explanation",
    input.learnerExplanation || "(empty)",
    "",
    "## Selected approach",
    input.selectedApproach ?? "(none selected)",
    "",
    "## Self-reported confidence",
    input.selfReportedConfidence ?? "(none selected)",
    "",
    "## Solution-model concepts",
    input.solutionModelConcepts.join(", "),
    "",
    "## Extraction rules",
    "- Analyze reasoning language only.",
    "- Do not reveal the solution model or correct answer.",
    "- Use short quote fragments only.",
    "- Allowed operations: " + input.allowedOperations.join(", "),
    "- If multiple interpretations remain plausible, set needsClarification to true.",
  ].join("\n");
}
