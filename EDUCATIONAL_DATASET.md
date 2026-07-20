# Educational dataset

MindTrace Step 4 introduces a prototype curated educational dataset that can be reviewed, validated, and later seeded into persistent storage. It replaces scattered shared demo constants with controlled records while keeping the current learning journey deterministic.

The dataset is not externally benchmarked and does not claim expert validation. It is intentionally small enough for manual review.

## Files

- `src/data/education/concepts.json`
- `src/data/education/problems.json`
- `src/data/education/misconceptions.json`
- `src/data/education/rubrics.json`
- `src/data/education/evaluation-cases.json`
- `src/data/education/validators.ts`
- `src/data/education/loaders.ts`

## Current counts

- 3 concept records
- 12 problem records
- 12 misconception records
- 24 verification-question templates
- 36 intervention records
- 4 reasoning rubrics
- 30 prototype evaluation cases, 28 reviewed

## Concept schema

Concept records define the controlled learning families for the MVP: Constant Difference, Additive vs Multiplicative Relationships, and Table to Linear Equation. Each concept includes prerequisites, related concepts, learning objectives, multiple explanation modes, career/programming connections, common misconception references, recommended problems, next concepts, and status.

## Problem schema

Problem records define reusable primary and transfer tasks. Each record includes concept references, difficulty, context, discriminated data representation, answer contract, solution model, valid approaches, reasoning prompts, target misconceptions, verification context, visualization configuration, transfer mappings, rubric reference, tags, and status.

Supported representations are `table`, `sequence`, `equation`, `short_context`, and `comparison`.

## Misconception schema

Misconception records describe observable reasoning patterns, not learner ability. Each record includes concept references, signals, counter-signals, alternative explanations, verification-question templates, intervention ladder, escalation rules, allowed next actions, severity, and status.

## Verification templates

Verification templates are controlled question patterns used to gather evidence for or against a misconception hypothesis. They include a goal, prompt template, expected and disconfirming evidence, answer format, difficulty, reveal policy, and reuse flag.

Step 7 now selects from these templates before any optional wording adaptation. Learner A and Learner B both answer `10` on `ads_sales_001`, but their different reasoning evidence selects different verification questions from the same curated library.

## Intervention ladders

Interventions are ordered from light support to full reconstruction:

1. Reflection question
2. Contrast question
3. Highlighted values
4. Animated visual clue
5. Concept reminder
6. Micro-example
7. Partial worked step
8. Full reconstruction

Validation enforces reveal rules: early levels cannot reveal the full answer, level 1 cannot reveal partial or full answers, and full reconstruction is only level 8.

Step 8 consumes these ladders through `src/lib/intervention-engine`. The deterministic selector can synthesize a bounded intermediate level when a curated ladder has a nearby reviewed record, but it still preserves the family, reveal policy, and answer-leakage guard.

## Rubrics

The fixed rubrics cover constant difference, additive/multiplicative relationships, table-to-equation reasoning, and transfer reasoning. Dimensions use qualitative states such as `strong`, `developing`, `missing`, `incorrect`, and `insufficient_evidence`; the dataset does not create mastery percentages.

## Evaluation cases

`evaluation-cases.json` is labeled as a prototype curated evaluation dataset. It contains learner-answer examples for expected reasoning signals, top misconception IDs, acceptable verification types, acceptable intervention levels, expected answer correctness, review notes, and review status.

## Transfer mappings

Every active primary problem references at least one transfer problem with overlapping required concepts. Validation prevents self-transfer and accidental circular primary/transfer loops.

## Validation command

```bash
corepack pnpm validate:education
```

The command loads every education JSON file, validates schemas with Zod, checks cross-record references, prints a readable summary, and exits non-zero on failure.

## Adding records

To add a concept:

1. Add the concept to `concepts.json`.
2. Reference only existing misconception and recommended problem IDs, or add those records in the same change.
3. Run `corepack pnpm validate:education`.

To add a problem:

1. Add the problem to `problems.json`.
2. Use an allowed data representation and answer type.
3. Reference active concepts, misconceptions, rubric, and transfer problems.
4. Ensure active primary problems have at least one valid transfer problem.
5. Run validation and unit tests.

To add a misconception:

1. Add observable signals, counter-signals, and alternative explanations.
2. Add at least one verification template.
3. Add at least three ordered intervention levels.
4. Keep escalation rules explicit and avoid learner ability labels.
5. Run validation and unit tests.

To review an evaluation case:

1. Confirm the learner explanation maps to the expected reasoning signals.
2. Confirm top misconception IDs exist and match the evidence.
3. Confirm acceptable verification types and intervention levels are bounded.
4. Change `reviewStatus` to `reviewed` only after manual review.

## Known limitations

- The dataset is prototype-scale and curated for product development, not a research benchmark.
- Evaluation cases are handcrafted examples, not human-study results.
- The demo still follows deterministic scripted learner paths after intervention.
- Step 5 adds a Prisma seed path for these records, but the dataset remains prototype-scale.
- OpenAI-backed ranking/adaptation boundaries are optional and not benchmark-validated in this workspace.
