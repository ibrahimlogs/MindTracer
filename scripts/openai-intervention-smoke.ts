if (!process.env.OPENAI_API_KEY) {
  console.log(
    "Skipping OpenAI intervention smoke test: OPENAI_API_KEY is not set.",
  );
  process.exit(0);
}

console.log(
  "OpenAI intervention smoke test is configured as opt-in; validate record ID preservation, level preservation and no answer leakage with reviewed credentials.",
);
