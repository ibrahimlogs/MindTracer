import { ChartNoAxesCombined } from "lucide-react";

import { RoutePlaceholder } from "@/components/layout/route-placeholder";

interface ReportPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { sessionId } = await params;

  return (
    <RoutePlaceholder
      eyebrow="Learning report"
      title="Evidence, not just a score."
      description="The report will show the tested misconception hypothesis, the intervention given, and independent transfer evidence. It will distinguish observations from model inference."
      icon={ChartNoAxesCombined}
      reference={sessionId}
    />
  );
}
