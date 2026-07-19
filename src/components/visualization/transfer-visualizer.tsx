import { demoTransfer } from "@/data/demo/demo-transfer";

export function TransferVisualizer({ reveal = false }: { reveal?: boolean }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">{demoTransfer.context}</p>
      <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border text-sm">
        {demoTransfer.columns.map((column) => (
          <div
            key={column}
            className="border-b border-border bg-surface-inset p-3 text-xs text-text-muted uppercase"
          >
            {column}
          </div>
        ))}
        {demoTransfer.rows.map((row) => (
          <div key={row.input} className="contents">
            <div className="border-b border-border/70 p-3 font-mono">
              {row.input}
            </div>
            <div className="border-b border-border/70 p-3 font-mono">
              {row.output}
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm font-medium text-text-primary">
        {demoTransfer.question}
      </p>
      {reveal ? (
        <p className="text-sm text-success">
          Transfer evidence: {demoTransfer.explanation}
        </p>
      ) : null}
    </div>
  );
}
