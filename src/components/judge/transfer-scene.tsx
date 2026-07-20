import type { JudgeDemoScene } from "@/lib/judge-demo";
import { transferProblem } from "@/lib/judge-demo";

import { EvidenceList } from "./learner-scene";

export function TransferScene({ scene }: { scene: JudgeDemoScene }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.8fr_1fr]">
      <div className="rounded-3xl border border-border bg-surface-inset p-6">
        <p className="font-mono text-xs tracking-[0.2em] text-text-muted uppercase">
          {transferProblem.title}
        </p>
        <table className="mt-5 w-full text-left text-sm">
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
        <p className="mt-5 text-text-secondary">{transferProblem.question}</p>
        <p className="mt-4 text-2xl font-semibold text-success">
          {scene.primaryText}
        </p>
      </div>
      <EvidenceList scene={scene} />
    </div>
  );
}
