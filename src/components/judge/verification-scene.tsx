import type { JudgeDemoScene } from "@/lib/judge-demo";

import { EvidenceList } from "./learner-scene";

export function VerificationScene({ scene }: { scene: JudgeDemoScene }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
      <div className="rounded-3xl bg-reasoning-soft p-6">
        <p className="text-sm font-semibold text-reasoning">
          MindTrace is checking one small detail
        </p>
        <h2 className="mt-5 text-3xl leading-tight font-semibold">
          {scene.narration}
        </h2>
        {scene.primaryText ? (
          <p className="mt-6 rounded-2xl bg-white p-5 text-lg text-text-secondary">
            {scene.primaryText}
          </p>
        ) : null}
      </div>
      <EvidenceList scene={scene} />
    </div>
  );
}
