import type { JudgeDemoScene } from "@/lib/judge-demo";

import { EvidenceList } from "./learner-scene";

export function VerificationScene({ scene }: { scene: JudgeDemoScene }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
      <div className="rounded-3xl border border-reasoning/30 bg-reasoning/10 p-6">
        <p className="font-mono text-xs tracking-[0.2em] text-reasoning uppercase">
          Targeted verification question
        </p>
        <h2 className="mt-5 text-2xl leading-tight font-semibold">
          {scene.narration}
        </h2>
        {scene.primaryText ? (
          <p className="mt-6 rounded-2xl border border-border bg-background/45 p-4 text-sm text-text-secondary">
            {scene.primaryText}
          </p>
        ) : null}
      </div>
      <EvidenceList scene={scene} />
    </div>
  );
}
