"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    logger.error("Route rendering failed", error, { digest: error.digest });
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-6 py-20">
      <section className="max-w-xl rounded-2xl border border-error/30 bg-surface-elevated p-8">
        <AlertTriangle className="size-6 text-error" aria-hidden="true" />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          The reasoning trail broke.
        </h1>
        <p className="mt-3 leading-7 text-text-secondary">
          The failure has been recorded. Retry this view to begin from the last
          safe boundary.
        </p>
        <Button className="mt-7" onClick={reset}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      </section>
    </main>
  );
}
