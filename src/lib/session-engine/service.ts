import { createHash } from "node:crypto";

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
  buildReasoningDeltaInput,
  createReasoningDeltaEvaluator,
  logReasoningDeltaEvent,
  type ReasoningDeltaOutput,
} from "@/lib/reasoning-delta";
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
  RetryAttemptInput,
} from "@/lib/session-engine/contracts";
import { SessionEngineError } from "@/lib/session-engine/errors";
import {
  inMemorySessionRepository,
  type SessionSnapshot,
} from "@/lib/session-engine/repository";
import type { SessionStage } from "@/lib/session-engine/stages";
import { canTransitionSession } from "@/lib/session-engine/transitions";
import {
  buildTransferEvaluationInput,
  createTransferEvaluator,
  CuratedTransferProblemSelector,
  logTransferEngineEvent,
  type TransferEvaluationOutput,
} from "@/lib/transfer-engine";
import { getProblemById } from "@/data/education";

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

function reportFromSession(
  session: SessionSnapshot,
  delta: ReasoningDeltaOutput,
  transferOutcome: TransferEvaluationOutput | null,
) {
  const initialAttempt = session.attempts.find(
    (attempt) => attempt.attemptType === "initial",
  );
  const retryAttempt = session.attempts.find(
    (attempt) => attempt.attemptType === "retry",
  );
  const transferProblem = session.transfer
    ? getProblemById(session.transfer.problemId)
    : null;
  const nextConcept =
    session.currentLearnerKey === "learner-b"
      ? "Slope-intercept form"
      : "Linear rate of change";

  return {
    delta,
    startingMentalModel:
      initialAttempt?.explanation ?? "Initial explanation was not available.",
    preservedUnderstanding: delta.preservedUnderstanding,
    hypothesesConsidered:
      session.hypotheses?.ranking.hypotheses.map(
        (hypothesis) => hypothesis.misconceptionId,
      ) ?? [],
    verificationEvidence:
      session.verification?.response ??
      "No verification response was recorded.",
    verifiedLearningNeed:
      session.verification?.hypothesisAfter?.safeLearnerSummary
        .verifiedLearningNeed ?? "Verified learning need was not available.",
    interventionFamily: session.intervention?.family ?? "none",
    interventionLevel: session.supportUsage.highestLevelUsed,
    revisedMentalModel:
      retryAttempt?.explanation ?? "Retry explanation was not available.",
    transferChallenge: transferProblem?.title ?? null,
    transferOutcome,
    supportUsed: session.supportUsage,
    nextConcept,
    learnerFacingSummary: transferOutcome
      ? `${delta.learnerFacingSummary} Transfer result: ${transferOutcome.learnerFacingSummary}`
      : delta.learnerFacingSummary,
    remainingGaps: transferOutcome?.remainingGap
      ? [...delta.remainingGaps, transferOutcome.remainingGap]
      : delta.remainingGaps,
    createdAt: new Date().toISOString(),
  };
}

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

  async submitRetry(
    sessionId: string,
    input: RetryAttemptInput,
    idempotencyKey: string,
    requestId = crypto.randomUUID(),
  ) {
    return inMemorySessionRepository.mutateAsync(
      sessionId,
      idempotencyKey,
      hashPayload(input),
      async (session) => {
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
        const retryAttempt = inMemorySessionRepository.addAttempt(
          session,
          input,
          "retry",
        );
        const snapshot = inMemorySessionRepository.get(session.publicId);
        const analysisInput = buildReasoningAnalysisInput(
          snapshot,
          retryAttempt,
          requestId,
        );
        const output = await createReasoningAnalyzer().analyze(analysisInput);
        inMemorySessionRepository.setAnalysis(
          session,
          {
            attemptId: retryAttempt.id,
            source: output.source,
            result: output.result,
            summary: output.result.safeLearnerSummary,
            promptVersion: reasoningPromptVersion,
            metadata: output.metadata,
          },
          "retry",
        );
        inMemorySessionRepository.transition(
          session,
          "retry_submitted",
          "retry.submitted_and_analyzed",
          {
            retryAnalysisSource: output.source,
            extractionConfidenceBand: output.result.extractionConfidenceBand,
          },
        );
        logReasoningAnalysis({
          requestId,
          sessionPublicId: session.publicId,
          attemptId: retryAttempt.id,
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

  async createDelta(sessionId: string, idempotencyKey: string) {
    return inMemorySessionRepository.mutateAsync(
      sessionId,
      idempotencyKey,
      hashPayload({ action: "delta" }),
      async (session) => {
        assertTransition(session.currentStage, "reasoning_delta");
        const snapshot = inMemorySessionRepository.get(session.publicId);
        const input = buildReasoningDeltaInput(snapshot);
        const delta = await createReasoningDeltaEvaluator().evaluate(input);
        inMemorySessionRepository.setReport(
          session,
          reportFromSession(snapshot, delta, null),
        );
        inMemorySessionRepository.transition(
          session,
          "reasoning_delta",
          "delta.created",
          {
            overallChange: delta.overallChange,
            transferReady: delta.transferReady,
          },
        );
        logReasoningDeltaEvent({
          sessionPublicId: session.publicId,
          overallChange: delta.overallChange,
          transferReady: delta.transferReady,
        });
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
        if (!session.report.delta.transferReady) {
          throw new SessionEngineError(
            "TRANSFER_NOT_READY",
            "Reasoning Delta did not mark this session transfer-ready.",
          );
        }
        const snapshot = inMemorySessionRepository.get(session.publicId);
        const selection = new CuratedTransferProblemSelector().select(snapshot);
        inMemorySessionRepository.setTransferSelection(session, selection);
        assertTransition(session.currentStage, "transfer_presented");
        inMemorySessionRepository.transition(
          session,
          "transfer_presented",
          "transfer.started",
          {
            transferProblemId: selection.problemId,
            supportState: selection.supportState,
            selectorSource: selection.selectorSource,
          },
        );
        logTransferEngineEvent({
          sessionPublicId: session.publicId,
          eventType: "transfer.selected",
          problemId: selection.problemId,
          supportState: selection.supportState,
        });
      },
    );
  }

  async submitTransfer(
    sessionId: string,
    input: TransferSubmitInput,
    idempotencyKey: string,
    requestId = crypto.randomUUID(),
  ) {
    return inMemorySessionRepository.mutateAsync(
      sessionId,
      idempotencyKey,
      hashPayload(input),
      async (session) => {
        if (!session.report) {
          throw new SessionEngineError(
            "TRANSFER_NOT_READY",
            "A transfer attempt cannot be saved before a Reasoning Delta report exists.",
          );
        }
        assertTransition(session.currentStage, "transfer_submitted");
        inMemorySessionRepository.addTransfer(session, input);
        const transfer = session.transfer;
        if (!transfer) {
          throw new SessionEngineError(
            "TRANSFER_NOT_READY",
            "Transfer selection is missing.",
          );
        }
        const transferAttempt = inMemorySessionRepository.addAttempt(
          session,
          {
            answer: input.answer,
            explanation: input.explanation,
            confidence: input.confidence,
            submissionKey: input.submissionKey,
          },
          "transfer",
          transfer.problemId,
        );
        const snapshotForAnalysis = inMemorySessionRepository.get(
          session.publicId,
        );
        const analysisInput = buildReasoningAnalysisInput(
          snapshotForAnalysis,
          transferAttempt,
          requestId,
        );
        const analysis = await createReasoningAnalyzer().analyze(analysisInput);
        inMemorySessionRepository.setTransferAnalysis(session, {
          attemptId: transferAttempt.id,
          source: analysis.source,
          result: analysis.result,
          summary: analysis.result.safeLearnerSummary,
          promptVersion: reasoningPromptVersion,
          metadata: analysis.metadata,
        });
        const transferInput = buildTransferEvaluationInput(
          inMemorySessionRepository.get(session.publicId),
        );
        const transferEvaluation =
          await createTransferEvaluator().evaluate(transferInput);
        inMemorySessionRepository.setTransferEvaluation(
          session,
          transferEvaluation,
        );
        const reportSnapshot = inMemorySessionRepository.get(session.publicId);
        if (!reportSnapshot.report?.delta) {
          throw new SessionEngineError(
            "TRANSFER_NOT_READY",
            "Final report requires an existing Reasoning Delta.",
          );
        }
        inMemorySessionRepository.setReport(
          session,
          reportFromSession(
            reportSnapshot,
            reportSnapshot.report.delta,
            transferEvaluation,
          ),
        );
        inMemorySessionRepository.transition(
          session,
          "transfer_submitted",
          "transfer.submitted",
          {
            answerCorrect: transferEvaluation.answerCorrect,
            transferStatus: transferEvaluation.transferStatus,
            independenceState: transferEvaluation.independenceState,
          },
        );
        assertTransition(session.currentStage, "session_complete");
        inMemorySessionRepository.transition(
          session,
          "session_complete",
          "session.completed",
          {
            reportReady: true,
          },
        );
        logTransferEngineEvent({
          sessionPublicId: session.publicId,
          eventType: "transfer.evaluated",
          transferStatus: transferEvaluation.transferStatus,
          independenceState: transferEvaluation.independenceState,
        });
      },
    );
  }

  restart(sessionId: string) {
    return inMemorySessionRepository.restart(sessionId);
  }
}

export const sessionEngine = new SessionEngineService();
