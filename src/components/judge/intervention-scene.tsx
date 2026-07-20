import type { JudgeDemoScene } from "@/lib/judge-demo";

import { EvidenceList } from "./learner-scene";

export function InterventionScene({ scene }: { scene: JudgeDemoScene }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1fr]">
      <div className="rounded-3xl border border-border bg-surface-inset p-6">
        <p className="font-mono text-xs tracking-[0.2em] text-success uppercase">
          Smallest useful intervention
        </p>
        <div className="mt-6 space-y-3 font-mono text-sm">
          <div className="rounded-2xl bg-surface-soft p-4">
            Advertising: <span className="text-success">+1, +1</span>
          </div>
          <div className="rounded-2xl bg-surface-soft p-4">
            Sales: <span className="text-success">+2, +2</span>
          </div>
        </div>
        <p className="mt-6 text-base leading-7 text-text-secondary">
          {scene.primaryText}
        </p>
      </div>
      <EvidenceList scene={scene} />
    </div>
  );
}
