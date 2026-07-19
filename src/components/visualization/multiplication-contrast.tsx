export function MultiplicationContrast() {
  return (
    <div className="rounded-lg border border-attention/30 bg-attention/10 p-4">
      <p className="text-sm font-medium text-text-primary">
        Check the multiplication claim
      </p>
      <div className="mt-4 grid gap-2 text-sm">
        <div className="rounded-md bg-surface-inset p-3">
          Claim: Sales = Advertising x 2
        </div>
        <div className="rounded-md bg-surface-inset p-3">
          When Advertising = 2, prediction = 4
        </div>
        <div className="rounded-md border border-success/40 bg-success/10 p-3">
          Observed = 5, so reveal +1 offset
        </div>
      </div>
    </div>
  );
}
