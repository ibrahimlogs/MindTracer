import type { DemoProblem } from "@/types/demo-learning";

interface DataTableProps {
  problem: Pick<DemoProblem, "columns" | "rows">;
  caption: string;
}

export function DataTable({ problem, caption }: DataTableProps) {
  return (
    <table className="w-full border-collapse text-left text-sm">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="border-b border-border text-xs text-text-muted uppercase">
          <th className="px-3 py-2 font-medium">{problem.columns[0]}</th>
          <th className="px-3 py-2 font-medium">{problem.columns[1]}</th>
        </tr>
      </thead>
      <tbody>
        {problem.rows.map((row) => (
          <tr
            key={`${row.input}-${row.output}`}
            className="border-b border-border/70 last:border-0"
          >
            <td className="px-3 py-3 font-mono text-text-primary">
              {row.input}
            </td>
            <td className="px-3 py-3 font-mono text-text-primary">
              {row.output}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
