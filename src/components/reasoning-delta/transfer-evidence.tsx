import type { TransferEvaluationOutput } from "@/lib/transfer-engine";

export function TransferEvidence({
  outcome,
}: {
  outcome: TransferEvaluationOutput | null;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface-inset p-4">
      <p className="text-xs font-medium tracking-[0.14em] text-text-muted uppercase">
        Transfer evidence
      </p>
      {outcome ? (
        <div className="mt-2 space-y-2 text-sm text-text-secondary">
          <p>Status: {outcome.transferStatus}</p>
          <p>Independence: {outcome.independenceState}</p>
          <p>{outcome.learnerFacingSummary}</p>
        </div>
      ) : (
        <p className="mt-2 text-sm text-text-muted">
          Transfer evidence appears after the independent transfer attempt.
        </p>
      )}
    </section>
  );
}
