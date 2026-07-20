export function AfterState({ text }: { text: string }) {
  return (
    <section className="rounded-lg border border-success/40 bg-success/10 p-4">
      <p className="text-xs font-medium tracking-[0.14em] text-text-muted uppercase">
        Revised mental model
      </p>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{text}</p>
    </section>
  );
}
