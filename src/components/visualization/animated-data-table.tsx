import { demoProblem } from "@/data/demo/demo-problem";

export function AnimatedDataTable({
  highlights = [],
}: {
  highlights?: number[];
}) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border text-sm">
      {demoProblem.columns.map((column) => (
        <div
          key={column}
          className="border-b border-border bg-surface-inset p-3 text-xs text-text-muted uppercase"
        >
          {column}
        </div>
      ))}
      {demoProblem.rows.map((row, index) => {
        const active = highlights.includes(index);

        return (
          <div key={row.input} className="contents">
            <div
              className={`border-b border-border/70 p-3 font-mono ${
                active
                  ? "bg-reasoning/15 text-text-primary"
                  : "text-text-secondary"
              }`}
            >
              {row.input}
            </div>
            <div
              className={`border-b border-border/70 p-3 font-mono ${
                active
                  ? "bg-reasoning/15 text-text-primary"
                  : "text-text-secondary"
              }`}
            >
              {row.output}
            </div>
          </div>
        );
      })}
    </div>
  );
}
