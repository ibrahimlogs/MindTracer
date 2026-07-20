export function VisualizerCaption({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md bg-surface-inset p-3 text-sm text-text-secondary">
      {children}
    </p>
  );
}
