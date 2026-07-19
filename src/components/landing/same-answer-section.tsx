import { AlertCircle, ArrowDown, CheckCircle2, GitBranch } from "lucide-react";

import { SectionContainer } from "@/components/layout/primitives";
import { SectionHeader } from "@/components/layout/section-header";
import { EvidenceChip } from "@/components/ui/evidence-chip";
import { ElevatedSurface, InsetSurface } from "@/components/ui/surface";

const learnerPaths = [
  {
    learner: "Learner A",
    reasoning:
      "The values keep increasing, so it should probably reach around 10.",
    model: "Notices direction, but does not compare consecutive change.",
    verification: "What changes between each pair of rows?",
    intervention: "Reveal +1 in advertising and +2 in sales.",
  },
  {
    learner: "Learner B",
    reasoning: "Sales appears to be exactly double advertising, so 5 × 2 = 10.",
    model: "Assumes direct multiplication and ignores the starting offset.",
    verification: "If advertising is 2, what does doubling predict?",
    intervention: "Contrast predicted 4 with the observed value 5.",
  },
] as const;

export function SameAnswerSection() {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="same-answer-title">
      <SectionContainer>
        <SectionHeader
          eyebrow="One output, two mental models"
          title="The answer is identical. The thinking is not."
          description="A wrong answer is evidence, but it is not yet a diagnosis. MindTrace is designed to inspect the reasoning that produced it."
        />

        <div className="mt-12 grid gap-5 xl:grid-cols-[0.74fr_1.26fr]">
          <ElevatedSurface className="p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-[0.6875rem] tracking-[0.14em] text-text-muted uppercase">
                Observed problem
              </p>
              <EvidenceChip>Same answer: 10</EvidenceChip>
            </div>
            <div className="mt-7 overflow-hidden rounded-xl border border-border">
              <table className="w-full border-collapse text-left font-mono text-sm">
                <caption className="sr-only">
                  Advertising cost and sales values
                </caption>
                <thead className="bg-surface-soft text-text-muted">
                  <tr>
                    <th className="border-r border-border px-4 py-3 font-medium">
                      Advertising cost
                    </th>
                    <th className="px-4 py-3 font-medium">Sales</th>
                  </tr>
                </thead>
                <tbody className="text-text-primary">
                  {[
                    [1, 3],
                    [2, 5],
                    [3, 7],
                  ].map(([cost, sales]) => (
                    <tr key={cost} className="border-t border-border">
                      <td className="border-r border-border px-4 py-3">
                        {cost}
                      </td>
                      <td className="px-4 py-3">{sales}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-base leading-7 text-text-secondary">
              If advertising cost becomes{" "}
              <span className="font-mono text-text-primary">5</span>, what sales
              value follows the pattern?
            </p>
          </ElevatedSurface>

          <div className="grid gap-5 md:grid-cols-2">
            {learnerPaths.map((path, index) => (
              <ElevatedSurface key={path.learner} className="overflow-hidden">
                <div className="border-b border-border p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{path.learner}</p>
                    <span className="font-mono text-xl text-attention">10</span>
                  </div>
                  <blockquote className="mt-4 font-mono text-xs leading-6 text-text-secondary">
                    “{path.reasoning}”
                  </blockquote>
                </div>
                <div className="space-y-2.5 p-5 sm:p-6">
                  <InsetSurface className="p-3.5">
                    <div className="flex gap-3">
                      <AlertCircle
                        className="mt-0.5 size-4 shrink-0 text-attention"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-mono text-[0.625rem] tracking-wider text-attention uppercase">
                          Mental model
                        </p>
                        <p className="mt-1.5 text-xs leading-5 text-text-secondary">
                          {path.model}
                        </p>
                      </div>
                    </div>
                  </InsetSurface>
                  <div
                    className="flex justify-center text-text-muted"
                    aria-hidden="true"
                  >
                    <ArrowDown className="size-4" />
                  </div>
                  <InsetSurface className="p-3.5">
                    <div className="flex gap-3">
                      <GitBranch
                        className="mt-0.5 size-4 shrink-0 text-reasoning"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-mono text-[0.625rem] tracking-wider text-reasoning uppercase">
                          Verification {index + 1}
                        </p>
                        <p className="mt-1.5 text-xs leading-5 text-text-secondary">
                          {path.verification}
                        </p>
                      </div>
                    </div>
                  </InsetSurface>
                  <div
                    className="flex justify-center text-text-muted"
                    aria-hidden="true"
                  >
                    <ArrowDown className="size-4" />
                  </div>
                  <InsetSurface className="p-3.5">
                    <div className="flex gap-3">
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-success"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-mono text-[0.625rem] tracking-wider text-success uppercase">
                          Different help
                        </p>
                        <p className="mt-1.5 text-xs leading-5 text-text-secondary">
                          {path.intervention}
                        </p>
                      </div>
                    </div>
                  </InsetSurface>
                </div>
              </ElevatedSurface>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
          {[
            "Same wrong answer",
            "Different mental model",
            "Different question",
            "Different help",
          ].map((item, index) => (
            <div key={item} className="bg-surface-inset px-4 py-4 text-center">
              <span className="font-mono text-[0.625rem] text-text-muted">
                0{index + 1}
              </span>
              <p className="mt-1 text-sm text-text-primary">{item}</p>
            </div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
