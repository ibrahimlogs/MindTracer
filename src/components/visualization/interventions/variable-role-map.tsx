import { VisualizerCaption } from "./visualizer-caption";
import type { SessionSnapshot } from "@/lib/session-engine";

type Config = NonNullable<SessionSnapshot["intervention"]>["visualizerConfig"];

export function VariableRoleMap({ config }: { config: Config }) {
  return (
    <div className="space-y-3 rounded-lg border border-reasoning/30 bg-reasoning/10 p-4 text-sm">
      <p className="font-medium text-text-primary">Variable role map</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-md bg-surface-inset p-3">Input</div>
        <div className="rounded-md bg-surface-inset p-3">Transformation</div>
        <div className="rounded-md bg-surface-inset p-3">Output</div>
      </div>
      <VisualizerCaption>{config.caption}</VisualizerCaption>
    </div>
  );
}
