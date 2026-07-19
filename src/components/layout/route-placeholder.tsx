import type { LucideIcon } from "lucide-react";

interface RoutePlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  reference?: string;
}

export function RoutePlaceholder({
  eyebrow,
  title,
  description,
  icon: Icon,
  reference,
}: RoutePlaceholderProps) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-6 py-20">
      <section className="relative w-full overflow-hidden rounded-2xl border border-border bg-surface-elevated/80 p-8 sm:p-12">
        <div className="absolute -top-32 -right-32 size-80 rounded-full bg-reasoning/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <div className="mb-8 flex items-center gap-2 font-mono text-xs tracking-[0.16em] text-reasoning uppercase">
            <Icon className="size-4" aria-hidden="true" />
            {eyebrow}
          </div>
          <h1 className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-text-secondary">
            {description}
          </p>
          {reference ? (
            <p className="mt-8 font-mono text-xs text-text-muted">
              Reference: {reference}
            </p>
          ) : null}
          <div className="mt-12 grid grid-cols-3 gap-2" aria-hidden="true">
            <div className="h-1 rounded-full bg-attention/70" />
            <div className="h-1 rounded-full bg-reasoning/70" />
            <div className="h-1 rounded-full bg-success/70" />
          </div>
        </div>
      </section>
    </main>
  );
}
