import { SectionContainer } from "@/components/layout/primitives";
import { SectionHeader } from "@/components/layout/section-header";
import { StatusPill } from "@/components/ui/status-pill";

const stages = [
  ["Problem", "A bounded task creates the evidence context."],
  ["Initial reasoning", "The learner explains how they reached the answer."],
  [
    "Misconception hypothesis",
    "Possible learning needs are ranked, not assumed.",
  ],
  ["Verification", "A discriminating question tests the leading hypothesis."],
  ["Minimal intervention", "Only the next useful contrast or cue is revealed."],
  ["Retry", "The learner reconstructs the answer with less support."],
  ["Transfer", "A distinct context tests whether the idea can travel."],
  [
    "Independence evidence",
    "Support falls away while reasoning remains sound.",
  ],
] as const;

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="border-y border-border/70 bg-surface-elevated/35 py-20 sm:py-28"
    >
      <SectionContainer>
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <SectionHeader
            eyebrow="How it works"
            title="A connected journey from response to independence."
            description="Each stage changes what the system knows or how much support the learner receives. The sequence is designed to stop explanation from masquerading as learning."
            className="lg:sticky lg:top-28 lg:self-start"
          />

          <ol className="relative grid gap-0 before:absolute before:inset-y-8 before:left-[1.18rem] before:w-px before:bg-border sm:before:left-6">
            {stages.map(([title, description], index) => {
              const final = index === stages.length - 1;
              return (
                <li
                  key={title}
                  className="relative grid grid-cols-[2.5rem_1fr] gap-4 py-4 sm:grid-cols-[3rem_1fr] sm:gap-5"
                >
                  <div
                    className={
                      final
                        ? "relative z-10 grid size-10 place-items-center rounded-full border border-success/40 bg-surface-elevated font-mono text-[0.625rem] text-success sm:size-12"
                        : "relative z-10 grid size-10 place-items-center rounded-full border border-border-strong bg-surface-elevated font-mono text-[0.625rem] text-text-muted sm:size-12"
                    }
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="rounded-xl border border-border bg-surface-inset px-5 py-4 sm:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-medium">{title}</h3>
                      {index === 2 ? (
                        <StatusPill tone="attention">Hypothesis</StatusPill>
                      ) : null}
                      {index === 3 ? (
                        <StatusPill tone="reasoning">Test</StatusPill>
                      ) : null}
                      {final ? (
                        <StatusPill tone="success">Evidence</StatusPill>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      {description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </SectionContainer>
    </section>
  );
}
