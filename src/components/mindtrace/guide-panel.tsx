import { getStageIndex } from "@/lib/demo-learning/stages";
import type { DemoLearner, LearningStage } from "@/types/demo-learning";

interface GuidePanelProps {
  learner: DemoLearner;
  stage: LearningStage;
}

function GuideSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface-inset p-4">
      <h3 className="text-xs font-medium tracking-[0.14em] text-text-muted uppercase">
        {title}
      </h3>
      <div className="mt-3 text-sm leading-6 text-text-secondary">
        {children}
      </div>
    </section>
  );
}

export function GuidePanel({ learner, stage }: GuidePanelProps) {
  const index = getStageIndex(stage);

  return (
    <aside className="space-y-3" aria-label="MindTrace guide">
      <div>
        <p className="text-xs font-medium tracking-[0.14em] text-reasoning uppercase">
          MindTrace Guide
        </p>
        <h2 className="mt-2 text-xl font-semibold text-text-primary">
          Checking the reasoning behind {learner.answer}
        </h2>
      </div>
      <GuideSection title="What you already understand">
        You correctly noticed part of the relationship in the table.
      </GuideSection>
      {index >= getStageIndex("reasoning_analysis") ? (
        <GuideSection title="What I am checking">
          <ul className="space-y-2">
            {learner.analysis.interpretation.slice(0, 2).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </GuideSection>
      ) : null}
      {index >= getStageIndex("hypothesis_ready") ? (
        <GuideSection title="Possible explanations">
          <p>There are two possible ideas behind this answer.</p>
          <ul className="mt-2 space-y-2">
            {learner.hypotheses.map((hypothesis) => (
              <li key={hypothesis.id}>{hypothesis.label}</li>
            ))}
          </ul>
        </GuideSection>
      ) : null}
      {index >= getStageIndex("verification_required") ? (
        <GuideSection title="Verification">
          {learner.verification.question}
        </GuideSection>
      ) : null}
      {index >= getStageIndex("verification_submitted") ? (
        <GuideSection title="Confirmed learning need">
          {learner.confirmedLearningNeed}
        </GuideSection>
      ) : null}
      {index >= getStageIndex("intervention_shown") ? (
        <GuideSection title="Smallest useful intervention">
          {learner.intervention.summary}
        </GuideSection>
      ) : null}
      {index >= getStageIndex("retry_required") ? (
        <GuideSection title="Retry guidance">
          Your second explanation should use the checked evidence directly.
        </GuideSection>
      ) : null}
      {index >= getStageIndex("reasoning_delta") ? (
        <GuideSection title="Reasoning Delta">
          Your second explanation now uses the repeated relationship directly.
        </GuideSection>
      ) : null}
    </aside>
  );
}
