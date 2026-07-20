import { demoProblem } from "@/data/demo/demo-problem";

import { DataTable } from "./data-table";

export function ProblemContext() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-text-muted">
          Advertising and Sales
        </p>
        <p className="mt-2 text-base leading-7 text-text-secondary">
          {demoProblem.context}
        </p>
      </div>
      <div className="rounded-[1.25rem] bg-surface-soft p-4">
        <DataTable
          problem={demoProblem}
          caption="Advertising cost and sales table"
        />
      </div>
      <div>
        <p className="text-sm font-semibold text-text-muted">Your task</p>
        <h2 className="mt-2 text-2xl leading-tight font-semibold text-text-primary sm:text-3xl">
          {demoProblem.question}
        </h2>
      </div>
    </div>
  );
}
