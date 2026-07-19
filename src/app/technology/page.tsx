import { Network } from "lucide-react";

import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function TechnologyPage() {
  return (
    <RoutePlaceholder
      eyebrow="System design"
      title="A testable reasoning pipeline."
      description="This area will explain hypothesis generation, discriminating questions, bounded interventions, and transfer evaluation—including where deterministic controls surround model behavior."
      icon={Network}
    />
  );
}
