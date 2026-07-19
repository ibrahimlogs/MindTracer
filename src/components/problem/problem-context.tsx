import { demoProblem } from "@/data/demo/demo-problem";

import { DataTable } from "./data-table";

export function ProblemContext() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium tracking-[0.14em] text-text-muted uppercase">
          Problem context
        </p>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {demoProblem.context}
        </p>
      </div>
      <div className="rounded-lg border border-border bg-surface-inset p-3">
        <DataTable
          problem={demoProblem}
          caption="Advertising cost and sales table"
        />
      </div>
      <div>
        <p className="text-xs font-medium tracking-[0.14em] text-text-muted uppercase">
          Question
        </p>
        <h2 className="mt-2 text-lg leading-7 font-semibold text-text-primary">
          {demoProblem.question}
        </h2>
      </div>
    </div>
  );
}
