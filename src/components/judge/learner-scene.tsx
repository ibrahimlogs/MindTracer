import type { JudgeDemoScene } from "@/lib/judge-demo";

export function LearnerScene({ scene }: { scene: JudgeDemoScene }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.75fr_1fr]">
      <div className="rounded-3xl bg-surface-soft p-6">
        <p className="text-sm font-semibold text-text-muted">
          Learner response
        </p>
        <p className="mt-5 text-3xl font-semibold text-attention">
          {scene.primaryText}
        </p>
        <p className="mt-5 text-xl leading-8 text-text-secondary">
          “{scene.narration}”
        </p>
      </div>
      <EvidenceList scene={scene} />
    </div>
  );
}

export function EvidenceList({ scene }: { scene: JudgeDemoScene }) {
  return (
    <div className="rounded-3xl bg-reasoning-soft p-6">
      <p className="text-sm font-semibold text-reasoning">
        What MindTrace noticed
      </p>
      <ul className="mt-5 space-y-3">
        {scene.evidence.map((item) => (
          <li key={item} className="flex gap-3 text-base text-text-secondary">
            <span
              className="mt-2.5 size-1.5 rounded-full bg-reasoning"
              aria-hidden="true"
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
