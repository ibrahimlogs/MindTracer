# Reasoning Delta

Step 9 adds retry analysis and before/after reasoning comparison. A correct retry answer is not treated as proof by itself; MindTrace compares the initial reasoning evidence with the retry reasoning evidence using fixed qualitative rubric dimensions.

Prompt ID: `reasoning-delta-v1`.

Implemented:

- retry reasoning extraction with `attemptType = retry`;
- initial analysis preservation;
- qualitative before/after comparison;
- eight fixed rubric dimensions;
- remaining-gap visibility;
- support-aware independence;
- safe deterministic evaluator and lazy OpenAI boundary.

No percentages or mastery scores are produced.
