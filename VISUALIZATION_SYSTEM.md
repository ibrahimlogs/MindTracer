# Visualization system

Step 8 adds misconception-specific intervention visualizers for the Learning Workspace. They are meant to make one reasoning contrast visible, not to solve the whole problem for the learner.

## Components

Intervention visualizers live in `src/components/visualization/interventions`:

- `ConsecutiveDifferenceVisualizer`
- `AdditiveMultiplicativeContrast`
- `SlopeInterceptBridge`
- `VariableRoleMap`
- `ArithmeticCheckVisualizer`
- `EvidenceComparisonVisualizer`
- `InterventionCanvas`

The server-selected intervention snapshot supplies `visualizerType` and a typed `visualizerConfig`. `InterventionCanvas` routes that snapshot to the matching visualizer.

## Motion and accessibility

Visualizers use short Framer Motion reveals plus explicit Replay, Back, and Step controls. Reduced-motion meaning is preserved through a text summary and by rendering the same evidence in order. The visualizer layer should never be the only place where learner-critical meaning exists.

## Design boundary

The visual language is deliberately instructional and evidence-centered rather than dashboard-like. Visualizers use existing dark-theme tokens, compact labels, and small comparisons. They do not introduce product analytics charts, teacher dashboards, or transfer reports.
