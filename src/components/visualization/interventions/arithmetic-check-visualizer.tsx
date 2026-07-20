import { VisualizerCaption } from "./visualizer-caption";
import type { SessionSnapshot } from "@/lib/session-engine";

type Config = NonNullable<SessionSnapshot["intervention"]>["visualizerConfig"];

export function ArithmeticCheckVisualizer({ config }: { config: Config }) {
  return (
    <div className="space-y-3 rounded-lg border border-success/30 bg-success/10 p-4 text-sm">
      <p className="font-medium text-text-primary">Arithmetic check</p>
      <div className="rounded-md bg-surface-inset p-3">
        Keep the strategy local: inspect the arithmetic step before changing the
        concept.
      </div>
      <VisualizerCaption>{config.caption}</VisualizerCaption>
    </div>
  );
}
