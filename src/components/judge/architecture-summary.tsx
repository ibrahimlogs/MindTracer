const flow = [
  "Structured learner response",
  "Reasoning evidence extraction",
  "Curated misconception retrieval",
  "Hypothesis ranking",
  "Verification question",
  "Minimum intervention",
  "Retry comparison",
  "Transfer challenge",
  "Evidence-based report",
] as const;

export function ArchitectureSummary() {
  return (
    <section className="rounded-[2rem] border border-border bg-surface-elevated p-6">
      <p className="font-mono text-xs tracking-[0.2em] text-reasoning uppercase">
        Technical architecture summary
      </p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs text-text-secondary">
        {flow.map((step, index) => (
          <span key={step} className="flex items-center gap-2">
            <span className="rounded-full border border-border bg-surface-soft px-3 py-2">
              {step}
            </span>
            {index < flow.length - 1 ? <span aria-hidden="true">→</span> : null}
          </span>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <BoundaryCard
          title="Generative"
          items={[
            "Natural-language interpretation",
            "Hypothesis ranking",
            "Wording adaptation",
            "Before/after comparison",
          ]}
        />
        <BoundaryCard
          title="Controlled"
          items={[
            "Concept graph",
            "Candidate IDs",
            "Verification templates",
            "Hint levels",
            "State transitions",
            "Answer leakage checks",
          ]}
        />
      </div>
      <p className="mt-6 text-sm text-text-secondary">
        The AI proposes and adapts. The learning system verifies and governs.
      </p>
    </section>
  );
}

function BoundaryCard({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-inset p-5">
      <h3 className="font-medium">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-text-secondary">
        {items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}
