import { getStageIndex } from "@/lib/demo-learning/stages";
import type { SessionSnapshot } from "@/lib/session-engine";
import type {
  DemoLearner,
  DemoMode,
  LearningStage,
} from "@/types/demo-learning";

interface GuidePanelProps {
  learner: DemoLearner;
  stage: LearningStage;
  analysis: SessionSnapshot["analysis"];
  hypotheses: SessionSnapshot["hypotheses"];
  verification: SessionSnapshot["verification"];
  intervention: SessionSnapshot["intervention"];
  mode: DemoMode;
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

export function GuidePanel({
  learner,
  stage,
  analysis,
  hypotheses,
  verification,
  intervention,
  mode,
}: GuidePanelProps) {
  const index = getStageIndex(stage);
  const summary = analysis?.summary;

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
        {summary?.preservedUnderstanding.length ? (
          <ul className="space-y-2">
            {summary.preservedUnderstanding.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          "You correctly noticed part of the relationship in the table."
        )}
      </GuideSection>
      {index >= getStageIndex("reasoning_analysis") ? (
        <GuideSection title="What I am checking">
          {summary ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-muted">Still unclear</p>
                <ul className="mt-1 space-y-2">
                  {summary.stillUnclear.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <p>{summary.nextSystemAction}</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {learner.analysis.interpretation.slice(0, 2).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </GuideSection>
      ) : null}
      {mode === "pipeline" && analysis ? (
        <GuideSection title="Structured learner evidence">
          <div className="space-y-3">
            <p>Source: {analysis.source}</p>
            <p>Confidence: {analysis.result.extractionConfidenceBand}</p>
            <p>
              Clarification needed:{" "}
              {analysis.result.needsClarification ? "yes" : "no"}
            </p>
            <div>
              <p className="text-xs text-text-muted">Observed</p>
              <ul className="mt-1 space-y-1">
                {analysis.result.observedClaims.slice(0, 3).map((claim) => (
                  <li key={claim.claim}>{claim.claim}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs text-text-muted">Inferred</p>
              <ul className="mt-1 space-y-1">
                {analysis.result.inferredReasoningSteps
                  .slice(0, 3)
                  .map((step) => (
                    <li key={step.step}>{step.step}</li>
                  ))}
              </ul>
            </div>
          </div>
        </GuideSection>
      ) : null}
      {mode === "pipeline" && hypotheses ? (
        <GuideSection title="Retrieval and ranking">
          <div className="space-y-3">
            <p>Ranker source: {hypotheses.ranking.rankerSource}</p>
            <p>
              Policy: {hypotheses.verificationDecision.reasonCode} (
              {hypotheses.verificationDecision.riskIfSkipped} risk)
            </p>
            <div>
              <p className="text-xs text-text-muted">Retrieved candidates</p>
              <ul className="mt-1 space-y-1">
                {hypotheses.retrievedCandidates.map((candidate) => (
                  <li key={candidate.candidateId}>
                    {candidate.candidateId}: {candidate.retrievalScoreBand}
                    {candidate.matchedSignals.length
                      ? ` — ${candidate.matchedSignals[0]}`
                      : ""}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </GuideSection>
      ) : null}
      {index >= getStageIndex("hypothesis_ready") ? (
        <GuideSection title="Possible explanations">
          <p>
            {hypotheses?.ranking.safeLearnerMessage ??
              "There are two possible ideas behind this answer."}
          </p>
          <ul className="mt-2 space-y-2">
            {hypotheses
              ? hypotheses.ranking.hypotheses.map((hypothesis) => (
                  <li key={hypothesis.misconceptionId}>
                    Possible explanation {hypothesis.rank}:{" "}
                    {hypothesis.supportingEvidence[0] ??
                      "MindTrace found partial evidence."}
                    {hypothesis.conflictingEvidence[0] ? (
                      <span className="block text-text-muted">
                        Still checking: {hypothesis.conflictingEvidence[0]}
                      </span>
                    ) : null}
                  </li>
                ))
              : learner.hypotheses.map((hypothesis) => (
                  <li key={hypothesis.id}>{hypothesis.label}</li>
                ))}
          </ul>
        </GuideSection>
      ) : null}
      {index >= getStageIndex("verification_required") ? (
        <GuideSection title="Verification">
          <div className="space-y-2">
            <p className="text-text-primary">One small check</p>
            <p>{verification?.question ?? learner.verification.question}</p>
            <p className="text-xs text-text-muted">
              This helps MindTrace choose the right kind of support.
            </p>
          </div>
        </GuideSection>
      ) : null}
      {index >= getStageIndex("verification_submitted") ? (
        <GuideSection title="Confirmed learning need">
          {verification?.hypothesisAfter ? (
            <div className="space-y-2">
              <p>
                {
                  verification.hypothesisAfter.safeLearnerSummary
                    .verifiedLearningNeed
                }
              </p>
              <p>
                {
                  verification.hypothesisAfter.safeLearnerSummary
                    .nextSystemAction
                }
              </p>
            </div>
          ) : (
            learner.confirmedLearningNeed
          )}
        </GuideSection>
      ) : null}
      {index >= getStageIndex("intervention_shown") ? (
        <GuideSection title="Smallest useful intervention">
          {intervention ? (
            <div className="space-y-3">
              <p className="text-xs text-text-muted">
                Support level: {intervention.supportLabel}
              </p>
              <p>{intervention.learnerFacingContent}</p>
              {intervention.escalationAvailable ? (
                <p className="text-xs text-text-muted">
                  More help is available one step at a time.
                </p>
              ) : null}
            </div>
          ) : (
            learner.intervention.summary
          )}
        </GuideSection>
      ) : null}
      {mode === "pipeline" && intervention ? (
        <GuideSection title="Intervention policy">
          <div className="space-y-2">
            <p>Family: {intervention.family}</p>
            <p>Level: {intervention.level}</p>
            <p>Source: {intervention.selectionSource}</p>
            <p>Visualizer: {intervention.visualizerType}</p>
            <p>
              Reveal: partial {intervention.revealsPartialAnswer ? "yes" : "no"}
              , full {intervention.revealsFullAnswer ? "yes" : "no"}
            </p>
            <p>
              Safety:{" "}
              {intervention.safetyValidation.passed ? "passed" : "failed"}
            </p>
          </div>
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
