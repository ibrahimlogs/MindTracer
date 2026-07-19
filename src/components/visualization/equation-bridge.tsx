export function EquationBridge() {
  return (
    <div className="rounded-lg border border-reasoning/40 bg-reasoning/10 p-4 text-center">
      <p className="text-xs text-text-muted">Formal bridge</p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm text-text-primary">
        <span>add 2 each step</span>
        <span aria-hidden="true">-&gt;</span>
        <span>two times input plus one</span>
        <span aria-hidden="true">-&gt;</span>
        <span className="font-mono">y = 2x + 1</span>
      </div>
    </div>
  );
}
