import type { JudgeDemoScene } from "@/lib/judge-demo";

export function LearnerScene({ scene }: { scene: JudgeDemoScene }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.75fr_1fr]">
      <div className="rounded-3xl border border-border bg-surface-inset p-6">
        <p className="font-mono text-xs tracking-[0.2em] text-text-muted uppercase">
          Learner response
        </p>
        <p className="mt-5 text-3xl font-semibold text-attention">
          {scene.primaryText}
        </p>
        <p className="mt-5 text-lg leading-8 text-text-secondary">
          “{scene.narration}”
        </p>
      </div>
      <EvidenceList scene={scene} />
    </div>
  );
}

export function EvidenceList({ scene }: { scene: JudgeDemoScene }) {
  return (
    <div className="rounded-3xl border border-border bg-surface-soft p-6">
      <p className="font-mono text-xs tracking-[0.2em] text-reasoning uppercase">
        Evidence MindTrace keeps separate
      </p>
      <ul className="mt-5 space-y-3">
        {scene.evidence.map((item) => (
          <li key={item} className="flex gap-3 text-sm text-text-secondary">
            <span
              className="mt-2 size-1.5 rounded-full bg-reasoning"
              aria-hidden="true"
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
