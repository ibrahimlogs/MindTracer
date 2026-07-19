import type { DemoLearner } from "@/types/demo-learning";

export function HypothesisBranch({ learner }: { learner: DemoLearner }) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-surface-inset p-3 text-sm text-text-primary">
        Learner response: {learner.answer}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {learner.hypotheses.map((hypothesis) => (
          <div
            key={hypothesis.id}
            className="rounded-lg border border-reasoning/30 bg-reasoning/10 p-3"
          >
            <p className="text-sm font-medium text-text-primary">
              {hypothesis.label}
            </p>
            <p className="mt-2 text-xs leading-5 text-text-secondary">
              {hypothesis.description}
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-text-muted">
        These are hypotheses, not confirmed diagnoses.
      </p>
    </div>
  );
}
