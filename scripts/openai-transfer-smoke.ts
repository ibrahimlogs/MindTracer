if (!process.env.OPENAI_API_KEY) {
  console.log(
    "Skipping OpenAI transfer smoke test: OPENAI_API_KEY is not set.",
  );
  process.exit(0);
}

console.log(
  "OpenAI transfer smoke test is configured as opt-in; validate schema status, no fake scores and no prohibited labels with reviewed credentials.",
);
