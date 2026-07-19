export function PageSkeleton() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-6 py-20">
      <div className="w-full animate-pulse rounded-2xl border border-border bg-surface-elevated p-8 sm:p-12">
        <div className="h-4 w-40 rounded bg-surface-soft" />
        <div className="mt-9 h-12 max-w-xl rounded bg-surface-soft" />
        <div className="mt-5 h-5 max-w-2xl rounded bg-surface-soft" />
        <div className="mt-3 h-5 max-w-lg rounded bg-surface-soft" />
      </div>
    </main>
  );
}
