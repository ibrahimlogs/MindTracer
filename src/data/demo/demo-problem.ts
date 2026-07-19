import type { DemoProblem } from "@/types/demo-learning";

export const demoProblem: DemoProblem = {
  context: "A small business tracks advertising cost and sales.",
  columns: ["Advertising Cost", "Sales"],
  rows: [
    { input: 1, output: 3 },
    { input: 2, output: 5 },
    { input: 3, output: 7 },
  ],
  question:
    "If advertising cost becomes 5, what sales value would follow the pattern?",
  correctAnswer: "11",
};
