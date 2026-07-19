import type { DemoLearner } from "@/types/demo-learning";

export function ReasoningDelta({ learner }: { learner: DemoLearner }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-lg border border-border bg-surface-inset p-3">
        <p className="text-xs text-text-muted">Before</p>
        <p className="mt-2 text-sm text-text-primary">
          {learner.reasoningDelta.before}
        </p>
      </div>
      <div className="rounded-lg border border-attention/40 bg-attention/10 p-3">
        <p className="text-xs text-text-muted">Evidence</p>
        <p className="mt-2 text-sm text-text-primary">
          {learner.reasoningDelta.conflict ?? learner.verification.response}
        </p>
      </div>
      <div className="rounded-lg border border-success/40 bg-success/10 p-3">
        <p className="text-xs text-text-muted">After</p>
        <p className="mt-2 text-sm text-text-primary">
          {learner.reasoningDelta.after}
        </p>
      </div>
    </div>
  );
}
