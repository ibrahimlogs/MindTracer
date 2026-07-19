import { SectionContainer } from "@/components/layout/primitives";
import { SectionHeader } from "@/components/layout/section-header";

const principles = [
  ["Preserve", "Preserve correct thinking before correcting mistakes."],
  ["Hypothesize", "Treat the first diagnosis as a hypothesis."],
  ["Verify", "Verify before intervening."],
  ["Restrain", "Reveal only the next useful step."],
  ["Transfer", "Measure transfer, not repetition."],
  ["Withdraw", "Reduce support as capability grows."],
] as const;

export function PrinciplesSection() {
  return (
    <section className="py-20 sm:py-28">
      <SectionContainer>
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <SectionHeader
            eyebrow="System principles"
            title="Learning safety is a product behavior."
            description="The system is being designed around restraint: inference is labeled, support is earned by evidence, and success requires less dependence over time."
          />
          <ol className="border-t border-border">
            {principles.map(([verb, principle], index) => (
              <li
                key={verb}
                className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-border py-5 sm:grid-cols-[3rem_8rem_1fr] sm:items-center sm:gap-5"
              >
                <span className="font-mono text-[0.625rem] text-text-muted">
                  0{index + 1}
                </span>
                <span className="hidden font-mono text-[0.6875rem] tracking-wider text-reasoning uppercase sm:block">
                  {verb}
                </span>
                <p className="text-base leading-7 text-text-primary">
                  {principle}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </SectionContainer>
    </section>
  );
}
