import type { JudgeDemoScene } from "@/lib/judge-demo";

export function DeltaScene({ scene }: { scene: JudgeDemoScene }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {[
        ["Before", "Approximate growth or direct multiplication"],
        ["After", "Constant change and offset identified"],
        ["Transfer", "Successful without prior visual support"],
      ].map(([label, value]) => (
        <div key={label} className="rounded-3xl bg-surface-soft p-6">
          <p className="text-sm font-semibold text-text-muted">{label}</p>
          <p className="mt-5 text-xl leading-tight font-semibold">{value}</p>
        </div>
      ))}
      <p className="sr-only" aria-live="polite">
        {scene.narration}
      </p>
    </div>
  );
}
