import { cn } from "@/lib/utils";

interface BeforeAfterCardProps {
  label: string;
  quote: string;
  tone: "before" | "after";
}

export function BeforeAfterCard({ label, quote, tone }: BeforeAfterCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5 sm:p-6",
        tone === "before"
          ? "border-attention/20 bg-attention/5"
          : "border-success/20 bg-success/5",
      )}
    >
      <p
        className={cn(
          "font-mono text-[0.625rem] tracking-[0.16em] uppercase",
          tone === "before" ? "text-attention" : "text-success",
        )}
      >
        {label}
      </p>
      <blockquote className="mt-4 font-mono text-sm leading-7 text-text-primary">
        “{quote}”
      </blockquote>
    </div>
  );
}
