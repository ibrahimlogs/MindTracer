import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import {
  buildReasoningPrompt,
  reasoningSystemPrompt,
} from "../src/lib/ai/reasoning/prompt.ts";
import {
  reasoningAnalysisInputSchema,
  reasoningAnalysisResultSchema,
} from "../src/lib/ai/reasoning/schema.ts";

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.log("OPENAI_API_KEY is absent; live OpenAI smoke test skipped.");
    return;
  }

  const model = process.env.OPENAI_REASONING_MODEL ?? "gpt-5.6";
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const input = reasoningAnalysisInputSchema.parse({
    analysisId: "smoke-synthetic",
    sessionPublicId: "smoke-session",
    problemId: "ads_sales_001",
    conceptIds: ["constant_difference"],
    problemContext: "Advertising cost and sales are shown in a small table.",
    dataRepresentation: {
      type: "table",
      columns: ["Advertising Cost", "Sales"],
      rows: [
        { input: 1, output: 3 },
        { input: 2, output: 5 },
        { input: 3, output: 7 },
      ],
    },
    question:
      "If advertising cost becomes 5, what sales value follows the pattern?",
    expectedAnswerType: "number",
    answerStatus: "incorrect",
    answerCanBeParsed: true,
    explanationIsEmpty: false,
    solutionModelConcepts: ["constant difference"],
    learnerAnswer: "10",
    learnerExplanation: "Sales looks like double the advertising cost.",
    selectedApproach: "multiplication_rule",
    selfReportedConfidence: "Somewhat confident",
    attemptType: "initial",
    allowedOperations: [
      "addition",
      "subtraction",
      "multiplication",
      "division",
      "comparison",
      "pattern_extension",
      "substitution",
      "equation_formation",
      "estimation",
      "counting_steps",
      "none",
      "unclear",
    ],
    promptVersion: "reasoning-extractor-v1",
  });

  const startedAt = performance.now();
  const response = await client.responses.parse({
    model,
    store: false,
    input: [
      { role: "system", content: reasoningSystemPrompt },
      { role: "user", content: buildReasoningPrompt(input) },
    ],
    text: {
      format: zodTextFormat(
        reasoningAnalysisResultSchema,
        "reasoning_analysis",
      ),
    },
  });

  const message = response.output.find((item) => item.type === "message");
  const parsed = message?.content.find(
    (item) => "parsed" in item && item.parsed,
  );
  if (!parsed || !("parsed" in parsed)) {
    throw new Error("Smoke test did not receive parsed structured output.");
  }

  reasoningAnalysisResultSchema.parse(parsed.parsed);
  console.table({
    model: response.model ?? model,
    latencyMs: Math.round(performance.now() - startedAt),
    schemaStatus: "valid",
    responseStatus: response.status,
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
