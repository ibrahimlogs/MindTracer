import type { Metadata } from "next";

import { WorkspaceShell } from "@/components/demo";
import type { DemoMode } from "@/types/demo-learning";

export const metadata: Metadata = {
  title: "Learning Workspace",
  description:
    "A complete deterministic MindTrace learning session using mocked reasoning data.",
};

interface SessionPageProps {
  searchParams: Promise<{ mode?: string }>;
}

function normalizeMode(mode?: string): DemoMode {
  if (mode === "learner" || mode === "pipeline") return mode;
  return "compare";
}

export default async function SessionPage({ searchParams }: SessionPageProps) {
  const { mode } = await searchParams;

  return <WorkspaceShell mode={normalizeMode(mode)} />;
}
