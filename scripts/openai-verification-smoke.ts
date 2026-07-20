if (!process.env.OPENAI_API_KEY) {
  console.log(
    "Skipping OpenAI verification smoke test: OPENAI_API_KEY is not set.",
  );
  process.exit(0);
}

console.log(
  "OpenAI verification smoke test is configured as opt-in; run live validation after setting reviewed model credentials.",
);
