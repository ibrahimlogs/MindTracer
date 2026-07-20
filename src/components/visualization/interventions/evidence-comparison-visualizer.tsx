import { VisualizerCaption } from "./visualizer-caption";
import type { SessionSnapshot } from "@/lib/session-engine";

type Config = NonNullable<SessionSnapshot["intervention"]>["visualizerConfig"];

export function EvidenceComparisonVisualizer({ config }: { config: Config }) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface-inset p-4 text-sm">
      <p className="font-medium text-text-primary">Evidence comparison</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-md bg-surface-elevated p-3">
          Evidence for one interpretation
        </div>
        <div className="rounded-md bg-surface-elevated p-3">
          Evidence for another interpretation
        </div>
      </div>
      <VisualizerCaption>{config.caption}</VisualizerCaption>
    </div>
  );
}
