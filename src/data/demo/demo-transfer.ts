import type { MockTransferResult } from "@/types/demo-learning";

export const demoTransfer: MockTransferResult = {
  context: "A teacher compares study hours and scores.",
  columns: ["Study Hours", "Score"],
  rows: [
    { input: 1, output: 52 },
    { input: 2, output: 55 },
    { input: 3, output: 58 },
  ],
  question: "What score follows the pattern at 5 study hours?",
  correctAnswer: "64",
  explanation:
    "The score rises by 3 for each extra study hour. From 3 to 5 hours is two steps, so 58 + 3 + 3 = 64.",
};
