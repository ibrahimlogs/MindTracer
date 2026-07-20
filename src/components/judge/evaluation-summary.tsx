const metrics = [
  [
    "Reasoning extraction",
    "Schema-valid output rate",
    "deterministic verified",
  ],
  ["Verification", "Post-verification agreement", "deterministic verified"],
  ["Intervention", "Answer leakage rate", "deterministic verified"],
  ["Reasoning Delta", "Unsupported-improvement rate", "deterministic verified"],
  ["Transfer", "Unsupported-success rate", "deterministic verified"],
] as const;

export function EvaluationSummary() {
  return (
    <section className="rounded-[2rem] bg-white p-6">
      <p className="text-sm font-semibold text-attention">Evaluation summary</p>
      <h2 className="mt-4 text-2xl font-semibold">
        Prototype system-behavior evaluation
      </h2>
      <p className="mt-3 text-sm leading-6 text-text-secondary">
        These checks use curated prototype cases. They are safety and regression
        tests, not claims of broad educational efficacy.
      </p>
      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        {metrics.map(([area, metric, status]) => (
          <div key={area} className="rounded-2xl bg-surface-soft p-4">
            <p className="text-sm font-medium">{area}</p>
            <p className="mt-2 text-xs leading-5 text-text-muted">{metric}</p>
            <p className="mt-4 font-mono text-[0.68rem] tracking-[0.18em] text-success uppercase">
              {status}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
