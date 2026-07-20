import type { JudgeDemoScene } from "@/lib/judge-demo";
import { transferProblem } from "@/lib/judge-demo";

import { EvidenceList } from "./learner-scene";

export function TransferScene({ scene }: { scene: JudgeDemoScene }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.8fr_1fr]">
      <div className="rounded-3xl bg-surface-soft p-6">
        <p className="text-sm font-semibold text-text-muted">
          {transferProblem.title}
        </p>
        <table className="mt-5 w-full text-left text-base">
          <thead className="text-text-muted">
            <tr>
              <th className="py-2">Study Hours</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {transferProblem.table.map(([hours, score]) => (
              <tr key={hours} className="border-t border-border">
                <td className="py-3 font-mono">{hours}</td>
                <td className="py-3 font-mono">{score}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-5 text-lg text-text-secondary">
          Try this one independently: {transferProblem.question}
        </p>
        <p className="mt-4 text-2xl font-semibold text-success">
          {scene.primaryText}
        </p>
      </div>
      <EvidenceList scene={scene} />
    </div>
  );
}
