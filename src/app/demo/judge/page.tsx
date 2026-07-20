import type { Metadata } from "next";

import { JudgeDemoShell } from "@/components/judge";
import { PageShell } from "@/components/layout/primitives";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "Judge Mode",
  description:
    "A reliable two-minute MindTrace demo showing the same wrong answer from different learner reasoning.",
};

export default function JudgeDemoPage() {
  return (
    <PageShell>
      <JudgeDemoShell />
      <SiteFooter />
    </PageShell>
  );
}
