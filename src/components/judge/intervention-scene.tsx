import type { JudgeDemoScene } from "@/lib/judge-demo";

import { EvidenceList } from "./learner-scene";

export function InterventionScene({ scene }: { scene: JudgeDemoScene }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1fr]">
      <div className="rounded-3xl bg-success-soft p-6">
        <p className="text-sm font-semibold text-success">
          Focused visual clue
        </p>
        <div className="mt-6 space-y-3 font-mono text-lg">
          <div className="rounded-2xl bg-white p-5">
            Advertising: <span className="text-success">+1, +1</span>
          </div>
          <div className="rounded-2xl bg-white p-5">
            Sales: <span className="text-success">+2, +2</span>
          </div>
        </div>
        <p className="mt-6 text-lg leading-8 text-text-secondary">
          {scene.primaryText}
        </p>
      </div>
      <EvidenceList scene={scene} />
    </div>
  );
}
