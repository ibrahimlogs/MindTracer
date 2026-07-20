import { getMisconceptionById } from "@/data/education";
import { demoProblem } from "@/data/demo/demo-problem";
import type { DemoLearner } from "@/types/demo-learning";
import type { MisconceptionRecord } from "@/types/misconception";

function fillTemplate(
  template: string,
  values: Readonly<Record<string, string>>,
) {
  return template.replaceAll(
    /\{(\w+)\}/g,
    (match, key: string) => values[key] ?? match,
  );
}

function hypothesisFromMisconception(misconception: MisconceptionRecord) {
  return {
    id: misconception.misconceptionId,
    label: misconception.title,
    description: misconception.shortDescription,
  };
}

const directionWithoutRate = getMisconceptionById("direction_without_rate");
const approximatePatternGuess = getMisconceptionById(
  "approximate_pattern_guess",
);
const additiveAsMultiplicative = getMisconceptionById(
  "additive_as_multiplicative",
);
const interceptIgnored = getMisconceptionById("intercept_ignored");

const directionVerification =
  directionWithoutRate.verificationQuestionTemplates[0];
const multiplicationVerification =
  additiveAsMultiplicative.verificationQuestionTemplates[0];
const directionIntervention = directionWithoutRate.interventionLadder.find(
  (intervention) => intervention.level === 3,
);
const multiplicationIntervention =
  additiveAsMultiplicative.interventionLadder.find(
    (intervention) => intervention.level === 3,
  );

if (
  !directionVerification ||
  !multiplicationVerification ||
  !directionIntervention ||
  !multiplicationIntervention
) {
  throw new Error("Demo learner path references incomplete education records.");
}

export const demoLearners: readonly [DemoLearner, DemoLearner] = [
  {
    id: "learner-a",
    name: "Learner A",
    primaryMisconceptionIds: [
      directionWithoutRate.misconceptionId,
      approximatePatternGuess.misconceptionId,
    ],
    rubricId: demoProblem.rubricId,
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
      hypothesisFromMisconception(directionWithoutRate),
      hypothesisFromMisconception(approximatePatternGuess),
    ],
    verification: {
      question: fillTemplate(directionVerification.promptTemplate, {
        inputColumn: "advertising",
        inputA: "1",
        inputB: "2",
        outputColumn: "sales",
      }),
      response: "Sales increases by 2.",
      focus: "Compare 1 -> 2 and 3 -> 5.",
    },
    confirmedLearningNeed:
      "The learner notices the direction of change but has not yet used the repeated rate.",
    intervention: {
      title: directionIntervention.title,
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
    primaryMisconceptionIds: [
      additiveAsMultiplicative.misconceptionId,
      interceptIgnored.misconceptionId,
    ],
    rubricId: demoProblem.rubricId,
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
      hypothesisFromMisconception(additiveAsMultiplicative),
      hypothesisFromMisconception(interceptIgnored),
    ],
    verification: {
      question: fillTemplate(multiplicationVerification.promptTemplate, {
        inputColumn: "advertising",
        outputColumn: "sales",
        inputValue: "2",
      }),
      response: "It would be 4, but the table shows 5.",
      focus: "Check Advertising = 2 against the observed Sales = 5.",
    },
    confirmedLearningNeed:
      "The learner sees the rate but is missing the starting offset.",
    intervention: {
      title: multiplicationIntervention.title,
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
