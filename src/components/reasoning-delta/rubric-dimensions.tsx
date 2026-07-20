import type { ReasoningDeltaOutput } from "@/lib/reasoning-delta";

export function RubricDimensions({
  dimensions,
}: {
  dimensions: ReasoningDeltaOutput["dimensions"];
}) {
  return (
    <section className="rounded-lg border border-border bg-surface-inset p-4">
      <p className="text-xs font-medium tracking-[0.14em] text-text-muted uppercase">
        Rubric dimensions
      </p>
      <div className="mt-3 grid gap-2">
        {dimensions.map((dimension) => (
          <div
            key={dimension.dimensionId}
            className="rounded-md border border-border bg-surface-elevated p-3"
          >
            <div className="flex flex-wrap justify-between gap-2 text-xs">
              <span className="font-mono text-text-primary">
                {dimension.dimensionId}
              </span>
              <span className="text-success">{dimension.changeStatus}</span>
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              {dimension.conciseReason}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
