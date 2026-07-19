import { GitBranch } from "lucide-react";

import { RoutePlaceholder } from "@/components/layout/route-placeholder";

interface SessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;

  return (
    <RoutePlaceholder
      eyebrow="Reasoning session"
      title="The misconception interview will live here."
      description="This workspace is reserved for targeted verification questions, confidence tracking, and the smallest useful intervention. No diagnostic claims are generated in this foundation step."
      icon={GitBranch}
      reference={sessionId}
    />
  );
}
