import { FlaskConical } from "lucide-react";

import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function DemoPage() {
  return (
    <RoutePlaceholder
      eyebrow="Interactive demo"
      title="A controlled space for tracing reasoning."
      description="This entry point will introduce a concept, collect an answer and confidence signal, then open a focused diagnostic session. The full learning workflow arrives in the next product steps."
      icon={FlaskConical}
    />
  );
}
