"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { DemoMode, LearnerId } from "@/types/demo-learning";

interface StartSessionButtonProps {
  mode: DemoMode;
  learnerKey?: LearnerId;
  children: string;
  featured?: boolean;
}

export function StartSessionButton({
  mode,
  learnerKey = "learner-a",
  children,
  featured = false,
}: StartSessionButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startSession() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          learnerKey,
          problemId: "ads_sales_001",
        }),
      });
      const payload = (await response.json()) as {
        success: boolean;
        data: { publicId: string } | null;
        error: { message: string } | null;
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error?.message ?? "Unable to start session.");
      }

      router.push(`/demo/session/${payload.data.publicId}?mode=${mode}`);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to start session.",
      );
      setPending(false);
    }
  }

  return (
    <div className="mt-5 space-y-2">
      <Button
        type="button"
        className="w-full"
        variant={featured ? "default" : "outline"}
        onClick={startSession}
        disabled={pending}
      >
        {pending ? "Starting session..." : children}
      </Button>
      {error ? <p className="text-xs text-error">{error}</p> : null}
    </div>
  );
}
