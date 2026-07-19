import { ArrowRight, Bot, BrainCircuit } from "lucide-react";

import { SectionContainer } from "@/components/layout/primitives";
import { SectionHeader } from "@/components/layout/section-header";
import { ElevatedSurface } from "@/components/ui/surface";

const answerFirst = [
  "Question",
  "Answer",
  "Explanation",
  "Current task completed",
] as const;
const mindTrace = [
  "Question",
  "Learner reasoning",
  "Verified learning need",
  "Minimum support",
  "Retry",
  "Transfer",
  "Greater independence",
] as const;

function CompactFlow({
  items,
  accent = false,
}: {
  items: readonly string[];
  accent?: boolean;
}) {
  return (
    <ol className="flex flex-col gap-2">
      {items.map((item, index) => (
        <li key={item} className="flex items-center gap-3">
          <span
            className={
              accent
                ? "grid size-6 shrink-0 place-items-center rounded-full border border-reasoning/30 font-mono text-[0.5625rem] text-reasoning"
                : "grid size-6 shrink-0 place-items-center rounded-full border border-border font-mono text-[0.5625rem] text-text-muted"
            }
          >
            {index + 1}
          </span>
          <span className="text-sm text-text-secondary">{item}</span>
          {index < items.length - 1 ? (
            <ArrowRight
              className="ml-auto size-3.5 text-text-muted"
              aria-hidden="true"
            />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export function AnswerComparisonSection() {
  return (
    <section className="border-y border-border/70 bg-surface-elevated/35 py-20 sm:py-28">
      <SectionContainer>
        <SectionHeader
          eyebrow="Designed objective"
          title="Answer completion and capability development are not the same objective."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <ElevatedSurface className="p-6 sm:p-8">
            <div className="mb-7 flex items-center gap-3">
              <Bot className="size-5 text-text-muted" aria-hidden="true" />
              <h3 className="text-lg font-medium">Answer-first interaction</h3>
            </div>
            <CompactFlow items={answerFirst} />
          </ElevatedSurface>
          <ElevatedSurface className="border-reasoning/25 p-6 sm:p-8">
            <div className="mb-7 flex items-center gap-3">
              <BrainCircuit
                className="size-5 text-reasoning"
                aria-hidden="true"
              />
              <h3 className="text-lg font-medium">MindTrace</h3>
            </div>
            <CompactFlow items={mindTrace} accent />
          </ElevatedSurface>
        </div>
        <p className="mt-7 max-w-4xl border-l border-border-strong pl-5 text-sm leading-7 text-text-secondary">
          General-purpose AI often optimizes for helping complete the current
          task. MindTrace is explicitly designed to observe whether the learner
          becomes more independent on the next task.
        </p>
      </SectionContainer>
    </section>
  );
}
