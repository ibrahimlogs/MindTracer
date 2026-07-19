export function DifferenceVisualizer() {
  return (
    <div className="space-y-4 rounded-lg border border-success/30 bg-success/10 p-4">
      <p className="text-sm font-medium text-text-primary">
        Consecutive differences
      </p>
      <div className="font-mono text-sm text-text-secondary">
        Advertising: 1 -&gt; 2 -&gt; 3
      </div>
      <div className="font-mono text-sm text-success">
        +1&nbsp;&nbsp;&nbsp;&nbsp;+1
      </div>
      <div className="font-mono text-sm text-text-secondary">
        Sales: 3 -&gt; 5 -&gt; 7
      </div>
      <div className="font-mono text-sm text-success">
        +2&nbsp;&nbsp;&nbsp;&nbsp;+2
      </div>
    </div>
  );
}
