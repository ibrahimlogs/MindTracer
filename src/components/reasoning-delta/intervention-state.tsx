export function InterventionState({
  family,
  level,
}: {
  family: string;
  level: number;
}) {
  return (
    <section className="rounded-lg border border-reasoning/40 bg-reasoning/10 p-4">
      <p className="text-xs font-medium tracking-[0.14em] text-text-muted uppercase">
        Intervention used
      </p>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {family} support at level {level}. Support is recorded without judgment.
      </p>
    </section>
  );
}
