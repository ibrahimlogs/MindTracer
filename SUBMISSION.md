# MindTrace Reasoning Lab

Tagline: Same answer. Different minds.

MindTrace Reasoning Lab is a competition prototype that shows why two learners can give the same wrong answer for different reasons, then verifies the learning need before choosing support.

## Problem

Most learning tools treat the answer as the main signal. The answer matters, but it can hide different mental models.

## Insight

The strongest signal is not simply wrongness. It is the difference between the learner's stated reasoning, verified misconception evidence, revised reasoning, and transfer behavior.

## Solution flow

Structured learner response → reasoning evidence extraction → curated misconception retrieval → hypothesis ranking → verification question → minimum intervention → retry comparison → transfer challenge → evidence-based report.

## Technical architecture

Generative components interpret language, rank only curated candidates, adapt approved wording, and compare before/after reasoning. Controlled components govern concept IDs, verification templates, hint levels, transitions, answer-leakage checks, rubrics, and transfer mappings.

## GPT-5.6 use

The integration is implemented for interpreting varied explanations, separating observation from inference, ranking curated candidates, adapting support language, and rubric-based reasoning comparison. Live verification depends on `OPENAI_API_KEY`.

## Codex use

Codex built the application foundation, schemas, validators, session engine, educational dataset, AI boundaries, tests, visualizations, evaluation harnesses, and final judge-mode submission layer from an empty repository.

## Innovation

MindTrace makes misconception diagnosis a verified hypothesis rather than a confident label.

## Evaluation

The current evaluation is a prototype system-behavior evaluation using curated deterministic and handcrafted cases. It is not a scientific claim about broad learner outcomes.

## Limitations

The dataset is small, domains are curated, live OpenAI and PostgreSQL checks require credentials, and no authentication or teacher workflow is included.

## Demo instructions

Run `corepack pnpm dev`, open `/demo/judge`, and click “Start the two-minute demo.”

## Repository instructions

Install with `corepack pnpm install`, copy `.env.example`, then run the validation commands documented in `README.md`.
