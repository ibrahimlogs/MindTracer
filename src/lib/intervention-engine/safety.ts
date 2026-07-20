import { InterventionEngineError } from "./errors.ts";
import {
  approvedVisualizerTypeSchema,
  interventionSelectionSchema,
  type InterventionSelection,
} from "./schemas.ts";
import type { ProblemRecord } from "@/types/education";

const prohibited = [
  "you have misconception",
  "diagnosed",
  "weak",
  "lazy",
  "not smart",
  "learning style",
  "bad at",
];

function containsProhibited(value: string) {
  const lower = value.toLowerCase();
  return prohibited.some((phrase) => lower.includes(phrase));
}

export function containsAnswerLeakage(
  value: string,
  problem: ProblemRecord,
  allowFullAnswer: boolean,
) {
  if (allowFullAnswer) return false;
  const lower = value.toLowerCase();
  const answer = problem.correctAnswer.trim().toLowerCase();
  if (
    answer &&
    new RegExp(
      `(^|\\D)${answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\D|$)`,
    ).test(lower)
  ) {
    return true;
  }
  if (/y\s*=\s*2x\s*\+\s*1/i.test(value)) return true;
  if (/7\s*\+\s*2\s*\+\s*2/i.test(value)) return true;
  return false;
}

export function validateInterventionSelection(
  selection: InterventionSelection,
  problem: ProblemRecord,
) {
  const parsed = interventionSelectionSchema.parse(selection);
  approvedVisualizerTypeSchema.parse(parsed.visualizerType);
  const visibleText = [
    parsed.title,
    parsed.learnerFacingContent,
    parsed.visualizerConfig.caption,
    parsed.visualizerConfig.reducedMotionSummary,
    parsed.visualizerConfig.claim ?? "",
    parsed.visualizerConfig.predictedValue ?? "",
    parsed.visualizerConfig.observedValue ?? "",
  ].join(" ");
  if (containsProhibited(visibleText)) {
    throw new InterventionEngineError(
      "UNSAFE_ADAPTATION",
      "Intervention contained prohibited learner-facing wording.",
    );
  }
  if (
    containsAnswerLeakage(visibleText, problem, parsed.revealsFullAnswer) ||
    (!parsed.revealsFullAnswer && parsed.visualizerConfig.showFinalEquation)
  ) {
    throw new InterventionEngineError(
      "ANSWER_LEAKAGE_DETECTED",
      "Intervention revealed more answer information than this level permits.",
    );
  }
  if (parsed.level < 8 && parsed.revealsFullAnswer) {
    throw new InterventionEngineError(
      "INVALID_INTERVENTION_LEVEL",
      "Full answer support is only allowed at level 8.",
    );
  }
  return parsed;
}
