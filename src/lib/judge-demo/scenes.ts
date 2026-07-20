import type { JudgeDemoProblem, JudgeDemoScene } from "./contracts";

export const judgeDemoProblem: JudgeDemoProblem = {
  title: "Advertising and Sales",
  table: [
    ["1", "3"],
    ["2", "5"],
    ["3", "7"],
  ],
  question:
    "If advertising cost becomes 5, what sales value follows the pattern?",
  correctAnswer: "11",
};

export const transferProblem: JudgeDemoProblem = {
  title: "Study Hours and Score",
  table: [
    ["1", "52"],
    ["2", "55"],
    ["3", "58"],
  ],
  question: "What score follows the pattern at 5 study hours?",
  correctAnswer: "64",
};

export const judgeScenes: readonly JudgeDemoScene[] = [
  {
    id: "intro",
    kind: "intro",
    title: "Same answer. Different minds.",
    timeRange: "0–12s",
    durationMs: 12000,
    learner: "both",
    source: "deterministic",
    narration: "Two learners both answer 10.",
    primaryText:
      "Two learners give the same wrong answer for completely different reasons.",
    secondaryText:
      "Live AI when available. Curated fallback ensures the demo remains reviewable.",
    evidence: [
      "Same problem",
      "Same answer",
      "Different reasoning",
      "Different support",
    ],
  },
  {
    id: "learner-a-evidence",
    kind: "learner",
    title: "Learner A: approximate growth",
    timeRange: "12–28s",
    durationMs: 16000,
    learner: "learner-a",
    source: "cached_demo",
    narration:
      "The values keep increasing, so sales should probably reach around 10.",
    primaryText: "Answer: 10",
    evidence: [
      "Upward movement noticed",
      "Repeated change not used",
      "Possible explanations remain uncertain",
    ],
  },
  {
    id: "learner-a-verification",
    kind: "verification",
    title: "Learner A verification",
    timeRange: "28–42s",
    durationMs: 14000,
    learner: "learner-a",
    source: "cached_demo",
    narration:
      "When advertising increases from 1 to 2, how much does sales increase?",
    primaryText: "Response: Sales increases by 2.",
    evidence: ["Hypothesis updated", "Consecutive-difference support selected"],
  },
  {
    id: "learner-a-intervention",
    kind: "intervention",
    title: "Learner A intervention",
    timeRange: "42–55s",
    durationMs: 13000,
    learner: "learner-a",
    source: "cached_demo",
    narration: "Advertising moves +1, +1 while sales moves +2, +2.",
    primaryText:
      "From advertising 3 to 5 there are two steps, so sales becomes 7 + 2 + 2 = 11.",
    evidence: ["Minimum visual support", "Revised reasoning, not answer copy"],
  },
  {
    id: "learner-b-evidence",
    kind: "learner",
    title: "Learner B: direct multiplication",
    timeRange: "55–70s",
    durationMs: 15000,
    learner: "learner-b",
    source: "cached_demo",
    narration: "Sales appears to be double advertising, so 5 × 2 = 10.",
    primaryText: "Answer: 10",
    evidence: [
      "Multiplication rule proposed",
      "Offset ignored",
      "Needs conflict evidence",
    ],
  },
  {
    id: "learner-b-verification",
    kind: "verification",
    title: "Learner B verification",
    timeRange: "70–84s",
    durationMs: 14000,
    learner: "learner-b",
    source: "cached_demo",
    narration:
      "If sales were exactly double advertising, what should sales be when advertising is 2?",
    primaryText: "Prediction: 4 · Observed: 5",
    evidence: ["Direct multiplication conflicts with the table"],
  },
  {
    id: "learner-b-intervention",
    kind: "intervention",
    title: "Learner B intervention",
    timeRange: "84–98s",
    durationMs: 14000,
    learner: "learner-b",
    source: "cached_demo",
    narration:
      "The table is not double advertising; it is double advertising plus one.",
    primaryText: "Revised answer: 11",
    evidence: [
      "Conflict with direct multiplication",
      "Offset idea introduced",
      "Relationship revised",
    ],
  },
  {
    id: "transfer",
    kind: "transfer",
    title: "Transfer challenge",
    timeRange: "98–112s",
    durationMs: 14000,
    learner: "both",
    source: "cached_demo",
    narration: "A new context checks independent transfer.",
    primaryText: "Independent answer: 64",
    evidence: [
      "New table",
      "No prior visual support",
      "Constant change transferred",
    ],
  },
  {
    id: "delta",
    kind: "delta",
    title: "Reasoning Delta",
    timeRange: "112–128s",
    durationMs: 16000,
    learner: "both",
    source: "cached_demo",
    narration:
      "Before: approximate growth or direct multiplication. After: constant change and offset identified.",
    primaryText: "Transfer: successful without prior visual support.",
    evidence: [
      "Before reasoning recorded",
      "After reasoning compared",
      "Transfer readiness checked",
    ],
  },
  {
    id: "closing",
    kind: "closing",
    title: "Evidence-based report",
    timeRange: "128–140s",
    durationMs: 12000,
    learner: "both",
    source: "deterministic",
    narration:
      "MindTrace did not simply help the learner reach 11. It identified why they missed it, verified what they needed, and measured transfer.",
    evidence: [
      "Different hypotheses",
      "Different interventions",
      "Evidence of increased independence",
    ],
  },
];
