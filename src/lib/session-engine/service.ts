import { createHash } from "node:crypto";

import { getDemoLearner } from "@/data/demo/demo-learners";
import {
  buildReasoningAnalysisInput,
  createReasoningAnalyzer,
  logReasoningAnalysis,
  reasoningPromptVersion,
} from "@/lib/ai/reasoning";
import type {
  AttemptInput,
  CreateSessionInput,
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

  generateHypotheses(sessionId: string, idempotencyKey: string) {
    return inMemorySessionRepository.mutate(
      sessionId,
      idempotencyKey,
      hashPayload({ action: "hypotheses" }),
      (session) => {
        assertTransition(session.currentStage, "verification_required");
        const verification = deterministic.create(session);
        session.verification = {
          id: crypto.randomUUID(),
          questionTemplateId: verification.templateId,
          question: verification.question,
          response: null,
          status: "pending",
        };
        inMemorySessionRepository.transition(
          session,
          "verification_required",
          "hypotheses.generated",
          deterministic.generate(session),
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
        session.verification = {
          ...session.verification,
          response: input.response,
          status: "answered",
        };
        inMemorySessionRepository.transition(
          session,
          "verification_submitted",
          "verification.answered",
        );
      },
    );
  }

  selectIntervention(sessionId: string, idempotencyKey: string) {
    return inMemorySessionRepository.mutate(
      sessionId,
      idempotencyKey,
      hashPayload({ action: "intervention" }),
      (session) => {
        assertTransition(session.currentStage, "intervention_ready");
        const intervention = deterministic.select(session);
        session.intervention = {
          id: crypto.randomUUID(),
          ...intervention,
          acknowledgedAt: null,
        };
        inMemorySessionRepository.transition(
          session,
          "intervention_ready",
          "intervention.selected",
        );
      },
    );
  }

  acknowledgeIntervention(sessionId: string, idempotencyKey: string) {
    return inMemorySessionRepository.mutate(
      sessionId,
      idempotencyKey,
      hashPayload({ action: "acknowledge" }),
      (session) => {
        if (!session.intervention) {
          throw new SessionEngineError(
            "INTERVENTION_NOT_READY",
            "No intervention is ready for this session.",
          );
        }
        assertTransition(session.currentStage, "intervention_shown");
        session.intervention.acknowledgedAt = new Date().toISOString();
        inMemorySessionRepository.transition(
          session,
          "intervention_shown",
          "intervention.acknowledged",
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
        assertTransition(session.currentStage, "retry_required");
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
