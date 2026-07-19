import type { DemoLearner } from "@/types/demo-learning";

export const demoLearners: readonly [DemoLearner, DemoLearner] = [
  {
    id: "learner-a",
    name: "Learner A",
    answer: "10",
    explanation:
      "The values keep increasing, so sales should probably reach around 10.",
    selectedApproach: "I looked for a repeated pattern",
    confidence: "Unsure",
    analysis: {
      evidence: ["Values increasing", "Approximate continuation"],
      interpretation: [
        "Correctly notices that values increase",
        "Does not compare consecutive changes",
        "Uses approximate pattern extension",
        "Has not identified the constant difference",
      ],
    },
    hypotheses: [
      {
        id: "direction_without_rate",
        label: "Direction without rate",
        description:
          "The learner notices upward movement but may not be using the repeated change.",
      },
      {
        id: "approximate_pattern_guess",
        label: "Approximate pattern guess",
        description:
          "The learner may be extending the table by estimation instead of a rule.",
      },
    ],
    verification: {
      question:
        "When advertising increases from 1 to 2, how much does sales increase?",
      response: "Sales increases by 2.",
      focus: "Compare 1 -> 2 and 3 -> 5.",
    },
    confirmedLearningNeed:
      "The learner notices the direction of change but has not yet used the repeated rate.",
    intervention: {
      title: "Highlight consecutive differences",
      summary:
        "Advertising changes by +1 each step while sales changes by +2 each step.",
      steps: [
        "Advertising: 1 -> 2 -> 3 has +1, +1",
        "Sales: 3 -> 5 -> 7 has +2, +2",
      ],
      bridge:
        "Repeated change gives the verbal rule: add 2 sales for each 1 advertising.",
    },
    revisedAnswer: "11",
    revisedExplanation:
      "Advertising increases by 1 each time, while sales increases by 2. From advertising 3 to 5 there are two more steps, so sales becomes 7 + 2 + 2 = 11.",
    reasoningDelta: {
      before: "Values increase, approximate guess",
      after: "Constant change identified",
    },
    report: {
      started: "Noticed that both variables increased.",
      missingOrConflict: "Did not identify the repeated difference.",
      support: "One comparison question and one animated difference visual.",
      revised: "Identified +1 input and +2 output.",
      transfer: "Applied the same constant-change idea independently.",
      remainingGap: "Needs more practice naming the rate from a table.",
      nextConcept: "Linear rate of change",
    },
  },
  {
    id: "learner-b",
    name: "Learner B",
    answer: "10",
    explanation:
      "Sales appears to be double the advertising cost, so 5 times 2 is 10.",
    selectedApproach: "I used multiplication",
    confidence: "Somewhat confident",
    analysis: {
      evidence: ["Input/output pairs", "Multiplication assumption"],
      interpretation: [
        "Correctly notices a consistent relationship",
        "Assumes exact multiplication",
        "Ignores the starting offset",
        "Does not test the rule against all rows",
      ],
    },
    hypotheses: [
      {
        id: "additive_as_multiplicative",
        label: "Additive pattern as multiplication",
        description:
          "The learner sees a rate but may be treating the whole rule as y = 2x.",
      },
      {
        id: "intercept_ignored",
        label: "Starting offset ignored",
        description:
          "The learner may be missing the +1 that keeps each observed value above double.",
      },
    ],
    verification: {
      question:
        "If sales were exactly double advertising, what should sales be when advertising is 2? Does that match the table?",
      response: "It would be 4, but the table shows 5.",
      focus: "Check Advertising = 2 against the observed Sales = 5.",
    },
    confirmedLearningNeed:
      "The learner sees the rate but is missing the starting offset.",
    intervention: {
      title: "Contrast predicted and observed values",
      summary:
        "The claim Sales = Advertising x 2 predicts 4 when advertising is 2, but the table shows 5.",
      steps: [
        "Claim: Sales = Advertising x 2",
        "Prediction at 2 = 4",
        "Observed at 2 = 5",
      ],
      bridge: "The formal bridge is Sales = Advertising x 2 + 1.",
    },
    revisedAnswer: "11",
    revisedExplanation:
      "Sales increases by 2 for every increase of 1 in advertising, but it also starts 1 above double the advertising value. So sales = 2x + 1, and at x = 5 the result is 11.",
    reasoningDelta: {
      before: "y = 2x",
      conflict: "At x = 2, expected 4 but observed 5",
      after: "y = 2x + 1",
    },
    report: {
      started: "Assumed sales was exactly twice advertising.",
      missingOrConflict:
        "At advertising = 2, that rule predicted 4 instead of 5.",
      support: "One contrast question and one offset visual.",
      revised: "Identified y = 2x + 1.",
      transfer: "Applied the relationship independently in a new context.",
      remainingGap: "Needs more practice testing equations against every row.",
      nextConcept: "Slope-intercept form",
    },
  },
];

export const getDemoLearner = (learnerId: DemoLearner["id"]) =>
  demoLearners.find((learner) => learner.id === learnerId) ?? demoLearners[0];
