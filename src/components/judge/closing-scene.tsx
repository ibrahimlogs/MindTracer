import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { JudgeDemoScene } from "@/lib/judge-demo";

export function ClosingScene({ scene }: { scene: JudgeDemoScene }) {
  return (
    <div className="rounded-[2rem] bg-reasoning-soft p-8">
      <h2 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em]">
        MindTrace investigates why, verifies what support is needed, and checks
        transfer.
      </h2>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-text-secondary">
        {scene.narration}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/report/judge-demo">
            View report
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/technology/evaluation">Open evaluation summary</Link>
        </Button>
      </div>
    </div>
  );
}
