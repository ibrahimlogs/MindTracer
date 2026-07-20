export function BeforeState({ text }: { text: string }) {
  return (
    <section className="rounded-lg border border-border bg-surface-inset p-4">
      <p className="text-xs font-medium tracking-[0.14em] text-text-muted uppercase">
        Before mental model
      </p>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{text}</p>
    </section>
  );
}
