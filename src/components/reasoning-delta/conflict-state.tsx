export function ConflictState({ text }: { text: string }) {
  return (
    <section className="rounded-lg border border-attention/40 bg-attention/10 p-4">
      <p className="text-xs font-medium tracking-[0.14em] text-text-muted uppercase">
        Evidence conflict
      </p>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{text}</p>
    </section>
  );
}
