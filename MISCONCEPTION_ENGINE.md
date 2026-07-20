# Misconception hypothesis engine

Step 7 adds the first real MindTrace misconception boundary. The engine does not diagnose a learner from the first explanation. It retrieves curated candidates, ranks only those candidates, preserves uncertainty, and asks for verification when evidence is not decisive.

Implementation lives in `src/lib/misconception-engine`.

- `candidate-retriever.ts` deterministically retrieves up to six allowed candidates from the problem’s curated misconception set.
- `deterministic-ranker.ts` ranks up to three hypotheses from retrieved candidates.
- `openai-ranker.ts` defines the optional live ranker boundary. It may rank supplied candidates only and must not invent IDs.
- `verification-policy.ts` decides whether one small verification check is required.
- `question-selector.ts` and `question-adapter.ts` select and adapt approved Step 4 verification templates.
- `response-evaluator.ts` evaluates the verification response and recommends an intervention family/starting level without generating intervention content.
- `safety.ts` validates IDs, duplicates, question leakage, diagnosis wording, prohibited labels, and invalid outputs.

Prompt ID: `misconception-ranker-v1`

The OpenAI ranker role is constrained to ranking a curated candidate set. It must not diagnose, teach, reveal the answer, infer personality/intelligence/learning style, or create misconception IDs. Deterministic and fallback modes remain functional without an API key.

Current limitation: the deterministic ranker is prototype-scale. Safety behavior is tested, but live model quality is not claimed without API-key smoke tests and reviewed outputs.
