import { ReasoningNetworkEnhancement } from "@/components/visualization/reasoning-network-enhancement";
import { ReducedMotionFallback } from "@/components/visualization/reduced-motion-fallback";

export function ReasoningNetwork() {
  return (
    <div className="relative min-h-[24rem] overflow-hidden rounded-2xl border border-border bg-surface-inset sm:min-h-[31rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,color-mix(in_srgb,var(--reasoning)_10%,transparent),transparent_58%)]" />
      <ReducedMotionFallback />
      <ReasoningNetworkEnhancement />
      <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 flex items-center justify-between font-mono text-[0.5625rem] tracking-[0.12em] text-text-muted uppercase">
        <span>Response enters</span>
        <span>Independence observed</span>
      </div>
      <p className="sr-only">
        A learner response branches into two misconception hypotheses.
        Verification confirms one path, a minimal intervention follows, and the
        sequence ends with independent transfer.
      </p>
    </div>
  );
}
