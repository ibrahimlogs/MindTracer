import { AnswerComparisonSection } from "@/components/landing/answer-comparison-section";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { PrinciplesSection } from "@/components/landing/principles-section";
import { ReasoningDeltaSection } from "@/components/landing/reasoning-delta-section";
import { SameAnswerSection } from "@/components/landing/same-answer-section";
import { TechnologyPreview } from "@/components/landing/technology-preview";
import { PageShell } from "@/components/layout/primitives";
import { SiteFooter } from "@/components/layout/site-footer";

export default function HomePage() {
  return (
    <PageShell>
      <Hero />
      <SameAnswerSection />
      <HowItWorksSection />
      <ReasoningDeltaSection />
      <AnswerComparisonSection />
      <PrinciplesSection />
      <TechnologyPreview />
      <FinalCta />
      <SiteFooter />
    </PageShell>
  );
}
