# Transfer system

Step 9 adds curated transfer selection, support fading, transfer submission, transfer reasoning analysis, transfer evaluation, and final report generation.

Prompt ID: `transfer-evaluator-v1`.

Transfer selection uses curated `transferProblemIds` only. The current demo transfer is `study_score_001`.

Transfer starts in `independent` mode: no prior visualizer, suggested approach, previous equation, or hint is preloaded. Accessibility labels, clear instructions, navigation, and error messages remain available.

Transfer evaluation separates answer correctness from concept application, evidence use, explanation completeness, independence, copied-structure risk, and remaining gaps.
