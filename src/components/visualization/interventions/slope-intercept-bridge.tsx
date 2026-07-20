import type { SessionSnapshot } from "@/lib/session-engine";

import { VisualizerCaption } from "./visualizer-caption";

type Config = NonNullable<SessionSnapshot["intervention"]>["visualizerConfig"];

export function SlopeInterceptBridge({ config }: { config: Config }) {
  return (
    <div className="space-y-3 rounded-lg border border-reasoning/30 bg-reasoning/10 p-4 text-sm">
      <p className="font-medium text-text-primary">
        Slope and intercept bridge
      </p>
      <div className="flex flex-wrap gap-2 text-text-secondary">
        <span>table</span>
        <span aria-hidden="true">→</span>
        <span>repeated difference</span>
        <span aria-hidden="true">→</span>
        <span>Output = repeated change × input + starting offset</span>
        {config.showFinalEquation ? (
          <>
            <span aria-hidden="true">→</span>
            <span className="font-mono">equation</span>
          </>
        ) : null}
      </div>
      <VisualizerCaption>{config.caption}</VisualizerCaption>
    </div>
  );
}
