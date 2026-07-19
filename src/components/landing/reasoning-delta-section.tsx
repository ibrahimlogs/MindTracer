import { SectionContainer } from "@/components/layout/primitives";
import { SectionHeader } from "@/components/layout/section-header";
import { ReasoningDeltaVisual } from "@/components/landing/reasoning-delta-visual";

export function ReasoningDeltaSection() {
  return (
    <section
      id="reasoning-system"
      className="py-20 sm:py-28"
      aria-labelledby="reasoning-delta-title"
    >
      <SectionContainer>
        <SectionHeader
          eyebrow="Reasoning delta"
          title="Measure the change in reasoning—not only the change in answer."
          description="The meaningful outcome is a repaired mental model that survives a new context, not a corrected response that disappears when support is removed."
        />
        <div className="mt-12">
          <ReasoningDeltaVisual />
        </div>
      </SectionContainer>
    </section>
  );
}
