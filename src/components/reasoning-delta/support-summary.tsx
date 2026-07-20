import type { SupportUsageSummary } from "@/lib/session-engine";

export function SupportSummary({ support }: { support: SupportUsageSummary }) {
  return (
    <section className="rounded-lg border border-border bg-surface-inset p-4">
      <p className="text-xs font-medium tracking-[0.14em] text-text-muted uppercase">
        Support used
      </p>
      <p className="mt-2 text-sm text-text-secondary">
        {support.interventionCount} intervention(s), highest level{" "}
        {support.highestLevelUsed}. Learner-requested help count:{" "}
        {support.learnerRequestedHelpCount}.
      </p>
    </section>
  );
}
