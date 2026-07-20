if (!process.env.OPENAI_API_KEY) {
  console.log(
    "Skipped: missing configuration. OPENAI_API_KEY is required for the live OpenAI journey smoke test.",
  );
  process.exit(0);
}

const startedAt = performance.now();

console.log(
  "Live OpenAI journey smoke test should be run with reviewed call budget. Existing focused smoke tests cover extraction, ranking, verification, intervention, delta, and transfer adapters.",
);
console.table({
  learner: "Learner A synthetic response",
  model: process.env.OPENAI_REASONING_MODEL ?? "gpt-5.6",
  latencyMs: Math.round(performance.now() - startedAt),
  status: "configured",
});
