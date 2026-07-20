import { createHash } from "node:crypto";

import { getDemoLearner } from "@/data/demo/demo-learners";
import {
  buildReasoningAnalysisInput,
  createReasoningAnalyzer,
  logReasoningAnalysis,
  reasoningPromptVersion,
} from "@/lib/ai/reasoning";
import {
  buildInterventionEngineInput,
  createInterventionSelector,
  logInterventionEngineEvent,
} from "@/lib/intervention-engine";
import {
  buildCandidateRetrievalInput,
  buildHypothesisRankingInput,
  createMisconceptionRanker,
  DeterministicCandidateRetriever,
  DeterministicVerificationPolicy,
  DeterministicVerificationQuestionSelector,
  DeterministicVerificationResponseEvaluator,
  logMisconceptionEngineEvent,
} from "@/lib/misconception-engine";
import type {
  AttemptInput,
  CreateSessionInput,
  InterventionAcknowledgeInput,
  InterventionMoreHelpInput,
  TransferSubmitInput,
  VerificationSubmitInput,
} from "@/lib/session-engine/contracts";
import { SessionEngineError } from "@/lib/session-engine/errors";
import {
  inMemorySessionRepository,
  type SessionSnapshot,
} from "@/lib/session-engine/repository";
import type { SessionStage } from "@/lib/session-engine/stages";
import { canTransitionSession } from "@/lib/session-engine/transitions";

export interface HypothesisGenerator {
  generate(session: SessionSnapshot): Record<string, unknown>;
}

export interface VerificationService {
  create(session: SessionSnapshot): { templateId: string; question: string };
}

export interface InterventionSelector {
  select(session: SessionSnapshot): {
    misconceptionId: string;
    interventionRecordId: string;
    level: number;
    title: string;
  };
}

export interface ReasoningDeltaEvaluator {
  evaluate(session: SessionSnapshot): {
    learnerFacingSummary: string;
    remainingGaps: readonly string[];
  };
}

export interface TransferEvaluator {
  evaluateTransfer(answer: string): boolean;
}

function hashPayload(payload: unknown) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function assertTransition(from: SessionStage, to: SessionStage) {
  if (!canTransitionSession(from, to)) {
    throw new SessionEngineError(
      "INVALID_STATE_TRANSITION",
      `The session cannot move from ${from} to ${to}.`,
    );
  }
}

class DeterministicServices
  implements
    HypothesisGenerator,
    VerificationService,
    InterventionSelector,
    ReasoningDeltaEvaluator,
    TransferEvaluator
{
  generate(session: SessionSnapshot) {
    const learner = getDemoLearner(session.currentLearnerKey);
    return {
      hypotheses: learner.hypotheses,
      primaryMisconceptionIds: learner.primaryMisconceptionIds,
    };
  }

  create(session: SessionSnapshot) {
    const learner = getDemoLearner(session.currentLearnerKey);
    return {
      templateId: `${learner.primaryMisconceptionIds[0]}_demo_template`,
      question: learner.verification.question,
    };
  }

  select(session: SessionSnapshot) {
    const learner = getDemoLearner(session.currentLearnerKey);
    return {
      misconceptionId:
        learner.primaryMisconceptionIds[0] ?? "direction_without_rate",
      interventionRecordId: `${learner.primaryMisconceptionIds[0]}_demo_intervention`,
      level: 3,
      title: learner.intervention.title,
    };
  }

  evaluate(session: SessionSnapshot) {
    const learner = getDemoLearner(session.currentLearnerKey);
    return {
      learnerFacingSummary: learner.report.revised,
      remainingGaps: [learner.report.remainingGap],
    };
  }

  evaluateTransfer(answer: string) {
    return answer.trim() === "64";
  }
}

const deterministic = new DeterministicServices();

export class SessionEngineService {
  createSession(input: CreateSessionInput) {
    return inMemorySessionRepository.create(input);
  }

  getSession(sessionId: string) {
    return inMemorySessionRepository.get(sessionId);
  }

  submitInitialAttempt(
    sessionId: string,
    input: AttemptInput,
    idempotencyKey: string,
  ) {
    return inMemorySessionRepository.mutate(
      sessionId,
      idempotencyKey,
      hashPayload(input),
      (session) => {
        assertTransition(session.currentStage, "initial_attempt");
        inMemorySessionRepository.transition(
          session,
          "initial_attempt",
          "attempt.initial.started",
        );
        assertTransition(session.currentStage, "reasoning_analysis");
        inMemorySessionRepository.addAttempt(session, input, "initial");
        inMemorySessionRepository.transition(
          session,
          "reasoning_analysis",
          "attempt.initial.submitted",
        );
      },
    );
  }

  async generateAnalysis(
    sessionId: string,
    idempotencyKey: string,
    requestId = crypto.randomUUID(),
  ) {
    return inMemorySessionRepository.mutateAsync(
      sessionId,
      idempotencyKey,
      hashPayload({ action: "analysis" }),
      async (session) => {
        assertTransition(session.currentStage, "hypothesis_ready");
        if (session.analysis) {
          inMemorySessionRepository.transition(
            session,
            "hypothesis_ready",
            "analysis.reused",
            { analysisId: session.analysis.id },
          );
          return;
        }
        const snapshot = inMemorySessionRepository.get(session.publicId);
        const initialAttempt = snapshot.attempts.find(
          (attempt) => attempt.attemptType === "initial",
        );
        if (!initialAttempt) {
          throw new SessionEngineError(
            "INVALID_STATE_TRANSITION",
            "Analysis requires an initial learner attempt.",
          );
        }
        const input = buildReasoningAnalysisInput(
          snapshot,
          initialAttempt,
          requestId,
        );
        const output = await createReasoningAnalyzer().analyze(input);
        inMemorySessionRepository.setAnalysis(session, {
          attemptId: initialAttempt.id,
          source: output.source,
          result: output.result,
          summary: output.result.safeLearnerSummary,
          promptVersion: reasoningPromptVersion,
          metadata: output.metadata,
        });
        inMemorySessionRepository.transition(
          session,
          "hypothesis_ready",
          "analysis.generated",
          {
            analysisSource: output.source,
            extractionConfidenceBand: output.result.extractionConfidenceBand,
            needsClarification: output.result.needsClarification,
          },
        );
        logReasoningAnalysis({
          requestId,
          sessionPublicId: session.publicId,
          attemptId: initialAttempt.id,
          analyzerMode: output.metadata.analyzerMode,
          analysisSource: output.source,
          model: output.metadata.model,
          promptVersion: reasoningPromptVersion,
          latencyMs: output.metadata.latencyMs,
          retryCount: output.metadata.retryCount,
          errorCategory: output.metadata.errorCategory,
          fallbackUsed: output.source === "fallback",
          finalStatus: output.metadata.finishStatus,
        });
      },
    );
  }

  async generateHypotheses(sessionId: string, idempotencyKey: string) {
    return inMemorySessionRepository.mutateAsync(
      sessionId,
      idempotencyKey,
      hashPayload({ action: "hypotheses" }),
      async (session) => {
        if (!session.analysis) {
          throw new SessionEngineError(
            "INVALID_STATE_TRANSITION",
            "Hypothesis ranking requires structured reasoning analysis.",
          );
        }

        const snapshot = inMemorySessionRepository.get(session.publicId);
        const initialAttempt = snapshot.attempts.find(
          (attempt) => attempt.attemptType === "initial",
        );
        if (!initialAttempt) {
          throw new SessionEngineError(
            "INVALID_STATE_TRANSITION",
            "Hypothesis ranking requires an initial learner attempt.",
          );
        }

        const retrievalInput = buildCandidateRetrievalInput(
          snapshot,
          session.analysis.result,
        );
        const retriever = new DeterministicCandidateRetriever();
        const retrievedCandidates = retriever.retrieve(retrievalInput);
        const rankingInput = buildHypothesisRankingInput(
          retrievalInput,
          retrievedCandidates,
          snapshot,
        );
        const ranking = await createMisconceptionRanker().rank(rankingInput);
        const policy = new DeterministicVerificationPolicy();
        const verificationDecision = policy.decide({
          ranking,
          answerReasoningAlignment:
            session.analysis.result.answerReasoningAlignment,
          explanationQuality: session.analysis.result.explanationQuality,
          needsClarification: session.analysis.result.needsClarification,
          verificationHistoryCount: snapshot.verification ? 1 : 0,
        });
        inMemorySessionRepository.setHypotheses(session, {
          attemptId: initialAttempt.id,
          retrievedCandidates,
          ranking,
          verificationDecision,
        });

        const nextStage = verificationDecision.required
          ? "verification_required"
          : "intervention_ready";
        assertTransition(session.currentStage, nextStage);
        inMemorySessionRepository.transition(
          session,
          nextStage,
          "hypotheses.generated",
          {
            retrievedCandidateIds: retrievedCandidates.map(
              (candidate) => candidate.candidateId,
            ),
            rankedHypothesisIds: ranking.hypotheses.map(
              (hypothesis) => hypothesis.misconceptionId,
            ),
            rankerSource: ranking.rankerSource,
            verificationDecision,
          },
        );
        logMisconceptionEngineEvent({
          sessionPublicId: session.publicId,
          eventType: "hypotheses.generated",
          source: ranking.rankerSource,
          detail: {
            candidateCount: retrievedCandidates.length,
            hypothesisCount: ranking.hypotheses.length,
            verificationRequired: verificationDecision.required,
          },
        });
      },
    );
  }

  createVerificationQuestion(sessionId: string, idempotencyKey: string) {
    return inMemorySessionRepository.mutate(
      sessionId,
      idempotencyKey,
      hashPayload({ action: "verification.create" }),
      (session) => {
        if (!session.hypotheses) {
          throw new SessionEngineError(
            "INVALID_STATE_TRANSITION",
            "Verification requires ranked hypotheses.",
          );
        }
        if (!session.hypotheses.verificationDecision.required) {
          throw new SessionEngineError(
            "INVALID_STATE_TRANSITION",
            "Verification is not required for this hypothesis state.",
          );
        }
        if (
          session.verification?.status === "pending" &&
          session.verification.hypothesisBefore?.hypotheses
            .map((hypothesis) => hypothesis.misconceptionId)
            .join("|") ===
            session.hypotheses.ranking.hypotheses
              .map((hypothesis) => hypothesis.misconceptionId)
              .join("|")
        ) {
          return;
        }

        const snapshot = inMemorySessionRepository.get(session.publicId);
        if (!session.analysis) {
          throw new SessionEngineError(
            "INVALID_STATE_TRANSITION",
            "Verification requires analysis evidence.",
          );
        }
        const retrievalInput = buildCandidateRetrievalInput(
          snapshot,
          session.analysis.result,
        );
        const selector = new DeterministicVerificationQuestionSelector();
        const question = selector.select({
          problem: retrievalInput.problem,
          ranking: session.hypotheses.ranking,
          decision: session.hypotheses.verificationDecision,
          candidateRecords: retrievalInput.candidateRecords,
          verificationHistoryCount: session.verification ? 1 : 0,
        });
        const template = retrievalInput.candidateRecords
          .flatMap((record) => record.verificationQuestionTemplates)
          .find((candidate) => candidate.templateId === question.templateId);
        inMemorySessionRepository.setVerification(
          session,
          question,
          template?.expectedEvidence ??
            "Learner cites relevant table evidence.",
          template?.disconfirmingEvidence ??
            "Learner does not cite relevant table evidence.",
        );
        inMemorySessionRepository.recordAuditEvent(
          session,
          "verification.created",
          {
            templateId: question.templateId,
            targetHypothesisIds: question.targetHypothesisIds,
            adaptationSource: question.adaptationSource,
          },
        );
      },
    );
  }

  submitVerification(
    sessionId: string,
    input: VerificationSubmitInput,
    idempotencyKey: string,
  ) {
    return inMemorySessionRepository.mutate(
      sessionId,
      idempotencyKey,
      hashPayload(input),
      (session) => {
        if (
          !session.verification ||
          session.verification.status !== "pending"
        ) {
          throw new SessionEngineError(
            "VERIFICATION_NOT_PENDING",
            "There is no pending verification question for this session.",
          );
        }
        assertTransition(session.currentStage, "verification_submitted");
        if (!session.analysis || !session.hypotheses) {
          throw new SessionEngineError(
            "INVALID_STATE_TRANSITION",
            "Verification submission requires analysis and hypotheses.",
          );
        }
        const snapshot = inMemorySessionRepository.get(session.publicId);
        const retrievalInput = buildCandidateRetrievalInput(
          snapshot,
          session.analysis.result,
        );
        const evaluator = new DeterministicVerificationResponseEvaluator();
        const result = evaluator.evaluate({
          verificationInteractionId: session.verification.id,
          question: session.verification.question,
          verificationGoal: session.verification.verificationGoal,
          targetHypothesisIds: session.verification.targetHypothesisIds,
          expectedEvidence: session.verification.expectedEvidence,
          disconfirmingEvidence: session.verification.disconfirmingEvidence,
          learnerResponse: input.response,
          originalReasoningAnalysis: session.analysis.result,
          rankedHypotheses: session.hypotheses.ranking.hypotheses,
          problem: retrievalInput.problem,
          answerFormat: session.verification.answerFormat,
          verificationHistoryCount:
            snapshot.events.filter(
              (event) => event.eventType === "verification.answered",
            ).length + 1,
        });
        inMemorySessionRepository.answerVerification(
          session,
          input.response,
          result,
        );
        inMemorySessionRepository.transition(
          session,
          "verification_submitted",
          "verification.answered",
          {
            status: result.status,
            resolution: result.resolution,
            supportedHypothesisIds: result.supportedHypothesisIds,
            weakenedHypothesisIds: result.weakenedHypothesisIds,
            recommendedInterventionFamily: result.recommendedInterventionFamily,
            recommendedStartingLevel: result.recommendedStartingLevel,
          },
        );
        const nextStage = result.requiresAdditionalVerification
          ? "verification_required"
          : "intervention_ready";
        assertTransition(session.currentStage, nextStage);
        inMemorySessionRepository.transition(
          session,
          nextStage,
          result.requiresAdditionalVerification
            ? "verification.additional_required"
            : "verification.resolved",
          {
            status: result.status,
            resolution: result.resolution,
          },
        );
      },
    );
  }

  async selectIntervention(sessionId: string, idempotencyKey: string) {
    return inMemorySessionRepository.mutateAsync(
      sessionId,
      idempotencyKey,
      hashPayload({ action: "intervention" }),
      async (session) => {
        if (session.currentStage !== "intervention_ready") {
          throw new SessionEngineError(
            "INVALID_STATE_TRANSITION",
            `Intervention selection requires intervention_ready, received ${session.currentStage}.`,
            409,
          );
        }
        if (session.intervention) return;
        const snapshot = inMemorySessionRepository.get(session.publicId);
        const input = buildInterventionEngineInput(
          snapshot,
          snapshot.interventionHistory,
        );
        const selection = await createInterventionSelector().select(input);
        inMemorySessionRepository.setIntervention(
          session,
          selection,
          input.verifiedState?.confirmedMisconceptionId ??
            input.misconceptionRecord?.misconceptionId ??
            "arithmetic_only_error",
        );
        inMemorySessionRepository.transition(
          session,
          "intervention_shown",
          "intervention.selected",
          {
            family: selection.family,
            level: selection.level,
            interventionRecordId: selection.interventionRecordId,
            visualizerType: selection.visualizerType,
            revealsPartialAnswer: selection.revealsPartialAnswer,
            revealsFullAnswer: selection.revealsFullAnswer,
          },
        );
        logInterventionEngineEvent({
          sessionPublicId: session.publicId,
          eventType: "intervention.selected",
          detail: {
            family: selection.family,
            level: selection.level,
            source: selection.selectionSource,
          },
        });
      },
    );
  }

  async requestMoreHelp(
    sessionId: string,
    input: InterventionMoreHelpInput,
    idempotencyKey: string,
  ) {
    return inMemorySessionRepository.mutateAsync(
      sessionId,
      idempotencyKey,
      hashPayload(input),
      async (session) => {
        if (!session.intervention) {
          throw new SessionEngineError(
            "INTERVENTION_NOT_READY",
            "More help requires an existing intervention.",
          );
        }
        const snapshot = inMemorySessionRepository.get(session.publicId);
        const engineInput = buildInterventionEngineInput(
          snapshot,
          snapshot.interventionHistory,
          true,
        );
        const selection =
          await createInterventionSelector().select(engineInput);
        inMemorySessionRepository.setIntervention(
          session,
          selection,
          engineInput.verifiedState?.confirmedMisconceptionId ??
            engineInput.misconceptionRecord?.misconceptionId ??
            session.intervention.misconceptionId,
        );
        inMemorySessionRepository.recordAuditEvent(
          session,
          "intervention.more_help",
          {
            reason: input.reason,
            fromLevel: snapshot.intervention?.level,
            toLevel: selection.level,
            interventionRecordId: selection.interventionRecordId,
          },
        );
      },
    );
  }

  acknowledgeIntervention(
    sessionId: string,
    input: InterventionAcknowledgeInput,
    idempotencyKey: string,
  ) {
    return inMemorySessionRepository.mutate(
      sessionId,
      idempotencyKey,
      hashPayload(input),
      (session) => {
        if (!session.intervention) {
          throw new SessionEngineError(
            "INTERVENTION_NOT_READY",
            "No intervention is ready for this session.",
          );
        }
        assertTransition(session.currentStage, "retry_required");
        inMemorySessionRepository.acknowledgeIntervention(
          session,
          input.interactionType,
        );
        inMemorySessionRepository.transition(
          session,
          "retry_required",
          "intervention.acknowledged",
          {
            interactionType: input.interactionType,
            supportUsage: session.supportUsage,
          },
        );
      },
    );
  }

  submitRetry(sessionId: string, input: AttemptInput, idempotencyKey: string) {
    return inMemorySessionRepository.mutate(
      sessionId,
      idempotencyKey,
      hashPayload(input),
      (session) => {
        if (!session.intervention?.acknowledgedAt) {
          throw new SessionEngineError(
            "INTERVENTION_NOT_READY",
            "A retry cannot be saved before an intervention exists.",
          );
        }
        if (session.currentStage !== "retry_required") {
          throw new SessionEngineError(
            "INVALID_STATE_TRANSITION",
            `Retry submission requires retry_required, received ${session.currentStage}.`,
            409,
          );
        }
        inMemorySessionRepository.transition(
          session,
          "retry_required",
          "retry.started",
        );
        assertTransition(session.currentStage, "retry_submitted");
        inMemorySessionRepository.addAttempt(session, input, "retry");
        inMemorySessionRepository.transition(
          session,
          "retry_submitted",
          "retry.submitted",
        );
      },
    );
  }

  createDelta(sessionId: string, idempotencyKey: string) {
    return inMemorySessionRepository.mutate(
      sessionId,
      idempotencyKey,
      hashPayload({ action: "delta" }),
      (session) => {
        assertTransition(session.currentStage, "reasoning_delta");
        session.report = deterministic.evaluate(session);
        inMemorySessionRepository.transition(
          session,
          "reasoning_delta",
          "delta.created",
        );
      },
    );
  }

  startTransfer(sessionId: string, idempotencyKey: string) {
    return inMemorySessionRepository.mutate(
      sessionId,
      idempotencyKey,
      hashPayload({ action: "transfer.start" }),
      (session) => {
        if (!session.report) {
          throw new SessionEngineError(
            "TRANSFER_NOT_READY",
            "A transfer attempt cannot start before a Reasoning Delta report exists.",
          );
        }
        assertTransition(session.currentStage, "transfer_presented");
        inMemorySessionRepository.transition(
          session,
          "transfer_presented",
          "transfer.started",
        );
      },
    );
  }

  submitTransfer(
    sessionId: string,
    input: TransferSubmitInput,
    idempotencyKey: string,
  ) {
    return inMemorySessionRepository.mutate(
      sessionId,
      idempotencyKey,
      hashPayload(input),
      (session) => {
        if (!session.report) {
          throw new SessionEngineError(
            "TRANSFER_NOT_READY",
            "A transfer attempt cannot be saved before a Reasoning Delta report exists.",
          );
        }
        assertTransition(session.currentStage, "transfer_submitted");
        inMemorySessionRepository.addTransfer(session, input);
        inMemorySessionRepository.transition(
          session,
          "transfer_submitted",
          "transfer.submitted",
        );
        assertTransition(session.currentStage, "session_complete");
        inMemorySessionRepository.transition(
          session,
          "session_complete",
          "session.completed",
        );
      },
    );
  }

  restart(sessionId: string) {
    return inMemorySessionRepository.restart(sessionId);
  }
}

export const sessionEngine = new SessionEngineService();
