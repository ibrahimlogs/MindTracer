import { demoTransfer } from "@/data/demo/demo-transfer";
import { getProblemById } from "@/data/education";
import type {
  ReasoningAnalyzerMetadata,
  ReasoningAnalysisResult,
  ReasoningAnalysisSource,
  SafeLearnerSummary,
} from "@/lib/ai/reasoning";
import type {
  HypothesisRankingOutput,
  RetrievedCandidate,
  VerificationDecision,
  VerificationEvaluationOutput,
  VerificationQuestionOutput,
} from "@/lib/misconception-engine";
import type {
  InterventionSelection,
  SupportUsageSummary,
} from "@/lib/intervention-engine";
import type {
  AttemptInput,
  CreateSessionInput,
  TransferSubmitInput,
} from "@/lib/session-engine/contracts";
import { SessionEngineError } from "@/lib/session-engine/errors";
import type {
  AttemptType,
  SessionMode,
  SessionStage,
  SessionStatus,
} from "@/lib/session-engine/stages";

export const educationalDataVersion = "step-04-prototype-v1";
const retentionMs = 7 * 24 * 60 * 60 * 1000;

export interface SessionEventRecord {
  id: string;
  eventType: string;
  fromStage: SessionStage | null;
  toStage: SessionStage | null;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface PersistedAttempt {
  id: string;
  problemId: string;
  attemptType: AttemptType;
  answer: string;
  explanation: string;
  selectedApproach?: string;
  confidence?: string;
  submissionKey: string;
  createdAt: string;
}

export interface VerificationSnapshot {
  id: string;
  questionTemplateId: string;
  question: string;
  response: string | null;
  status: "pending" | "answered" | "skipped";
  answerFormat: VerificationQuestionOutput["answerFormat"];
  verificationGoal: string;
  targetHypothesisIds: readonly string[];
  expectedEvidence: string;
  disconfirmingEvidence: string;
  hypothesisBefore: HypothesisRankingOutput | null;
  hypothesisAfter: VerificationEvaluationOutput | null;
  createdAt: string;
  answeredAt: string | null;
}

export interface InterventionSnapshot {
  id: string;
  misconceptionId: string;
  interventionRecordId: string;
  family: InterventionSelection["family"];
  level: InterventionSelection["level"];
  type: string;
  title: string;
  instructionalGoal: string;
  preservedUnderstanding: readonly string[];
  learnerFacingContent: string;
  visualizerType: InterventionSelection["visualizerType"];
  visualizerConfig: InterventionSelection["visualizerConfig"];
  revealsPartialAnswer: boolean;
  revealsFullAnswer: boolean;
  escalationAvailable: boolean;
  nextAllowedLevel: InterventionSelection["nextAllowedLevel"];
  selectionSource: InterventionSelection["selectionSource"];
  selectionReason: string;
  supportLabel: string;
  safetyValidation: InterventionSelection["safetyValidation"];
  replayCount: number;
  interactions: readonly string[];
  acknowledgedAt: string | null;
  createdAt: string;
}

export interface ReasoningDeltaSnapshot {
  learnerFacingSummary: string;
  remainingGaps: readonly string[];
}

export interface ReasoningAnalysisSnapshot {
  id: string;
  attemptId: string;
  source: ReasoningAnalysisSource;
  result: ReasoningAnalysisResult;
  summary: SafeLearnerSummary;
  promptVersion: string;
  metadata: ReasoningAnalyzerMetadata;
  createdAt: string;
}

export interface HypothesisSnapshot {
  id: string;
  attemptId: string;
  retrievedCandidates: readonly RetrievedCandidate[];
  ranking: HypothesisRankingOutput;
  verificationDecision: VerificationDecision;
  createdAt: string;
}

export interface SessionSnapshot {
  sessionId: string;
  publicId: string;
  mode: SessionMode;
  currentProblemId: string;
  currentLearnerKey: "learner-a" | "learner-b";
  currentStage: SessionStage;
  status: SessionStatus;
  educationalDataVersion: string;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
  expiresAt: string;
  fallbackMode: boolean;
  completedStages: readonly SessionStage[];
  attempts: readonly PersistedAttempt[];
  analysis: ReasoningAnalysisSnapshot | null;
  hypotheses: HypothesisSnapshot | null;
  verification: VerificationSnapshot | null;
  intervention: InterventionSnapshot | null;
  interventionHistory: readonly InterventionSnapshot[];
  supportUsage: SupportUsageSummary;
  transfer: {
    problemId: string;
    answer: string;
    explanation: string;
    success: boolean;
  } | null;
  report: ReasoningDeltaSnapshot | null;
  events: readonly SessionEventRecord[];
}

interface MutableSession
  extends Omit<
    SessionSnapshot,
    | "completedStages"
    | "attempts"
    | "analysis"
    | "hypotheses"
    | "events"
    | "verification"
    | "intervention"
    | "interventionHistory"
    | "supportUsage"
    | "transfer"
    | "report"
  > {
  completedStages: SessionStage[];
  attempts: PersistedAttempt[];
  analysis: ReasoningAnalysisSnapshot | null;
  hypotheses: HypothesisSnapshot | null;
  verification: VerificationSnapshot | null;
  intervention: InterventionSnapshot | null;
  interventionHistory: InterventionSnapshot[];
  supportUsage: SupportUsageSummary;
  transfer: SessionSnapshot["transfer"];
  report: ReasoningDeltaSnapshot | null;
  events: SessionEventRecord[];
  idempotency: Map<string, { requestHash: string; response: SessionSnapshot }>;
}

const sessions = new Map<string, MutableSession>();

function nowIso() {
  return new Date().toISOString();
}

function createPublicId() {
  return `mt_${crypto.randomUUID().replaceAll("-", "").slice(0, 20)}`;
}

function emptySupportUsage(): SupportUsageSummary {
  return {
    interventionCount: 0,
    highestLevelUsed: 0,
    familiesUsed: [],
    visualizerTypesUsed: [],
    learnerRequestedHelpCount: 0,
    systemEscalationCount: 0,
    replayCount: 0,
    partialAnswerRevealed: false,
    fullAnswerRevealed: false,
  };
}

function summarizeInterventionUsage(
  interventions: readonly InterventionSnapshot[],
): SupportUsageSummary {
  return {
    interventionCount: interventions.length,
    highestLevelUsed: interventions.reduce(
      (highest, item) => Math.max(highest, item.level),
      0,
    ),
    familiesUsed: [...new Set(interventions.map((item) => item.family))],
    visualizerTypesUsed: [
      ...new Set(interventions.map((item) => item.visualizerType)),
    ],
    learnerRequestedHelpCount: interventions.filter((item) =>
      item.selectionReason.includes("LEARNER_REQUESTED_MORE_HELP"),
    ).length,
    systemEscalationCount: interventions.filter((item) =>
      item.selectionReason.includes("RETRY_UNSUCCESSFUL"),
    ).length,
    replayCount: interventions.reduce(
      (count, item) => count + item.replayCount,
      0,
    ),
    partialAnswerRevealed: interventions.some(
      (item) => item.revealsPartialAnswer,
    ),
    fullAnswerRevealed: interventions.some((item) => item.revealsFullAnswer),
  };
}

function cloneSession(session: MutableSession): SessionSnapshot {
  return {
    sessionId: session.sessionId,
    publicId: session.publicId,
    mode: session.mode,
    currentProblemId: session.currentProblemId,
    currentLearnerKey: session.currentLearnerKey,
    currentStage: session.currentStage,
    status: session.status,
    educationalDataVersion: session.educationalDataVersion,
    startedAt: session.startedAt,
    updatedAt: session.updatedAt,
    completedAt: session.completedAt,
    expiresAt: session.expiresAt,
    fallbackMode: session.fallbackMode,
    completedStages: [...session.completedStages],
    attempts: session.attempts.map((attempt) => ({ ...attempt })),
    analysis: session.analysis
      ? {
          ...session.analysis,
          summary: {
            preservedUnderstanding: [
              ...session.analysis.summary.preservedUnderstanding,
            ],
            stillUnclear: [...session.analysis.summary.stillUnclear],
            nextSystemAction: session.analysis.summary.nextSystemAction,
          },
        }
      : null,
    hypotheses: session.hypotheses
      ? {
          ...session.hypotheses,
          retrievedCandidates: session.hypotheses.retrievedCandidates.map(
            (candidate) => ({ ...candidate }),
          ),
          ranking: structuredClone(session.hypotheses.ranking),
          verificationDecision: {
            ...session.hypotheses.verificationDecision,
            targetHypothesisIds: [
              ...session.hypotheses.verificationDecision.targetHypothesisIds,
            ],
          },
        }
      : null,
    verification: session.verification ? { ...session.verification } : null,
    intervention: session.intervention
      ? structuredClone(session.intervention)
      : null,
    interventionHistory: session.interventionHistory.map((item) =>
      structuredClone(item),
    ),
    supportUsage: structuredClone(session.supportUsage),
    transfer: session.transfer ? { ...session.transfer } : null,
    report: session.report
      ? {
          learnerFacingSummary: session.report.learnerFacingSummary,
          remainingGaps: [...session.report.remainingGaps],
        }
      : null,
    events: session.events.map((event) => ({ ...event })),
  };
}

export class InMemorySessionRepository {
  create(input: CreateSessionInput) {
    try {
      getProblemById(input.problemId);
    } catch {
      throw new SessionEngineError(
        "PROBLEM_NOT_FOUND",
        `Problem ${input.problemId} was not found.`,
      );
    }

    const timestamp = nowIso();
    const session: MutableSession = {
      sessionId: createPublicId(),
      publicId: createPublicId(),
      mode: input.mode,
      currentProblemId: input.problemId,
      currentLearnerKey: input.learnerKey,
      currentStage: "problem_presented",
      status: "active",
      educationalDataVersion,
      startedAt: timestamp,
      updatedAt: timestamp,
      completedAt: null,
      expiresAt: new Date(Date.now() + retentionMs).toISOString(),
      fallbackMode: true,
      completedStages: [],
      attempts: [],
      analysis: null,
      hypotheses: null,
      verification: null,
      intervention: null,
      interventionHistory: [],
      supportUsage: emptySupportUsage(),
      transfer: null,
      report: null,
      events: [],
      idempotency: new Map(),
    };
    this.recordEvent(session, "session.created", null, "problem_presented", {
      mode: input.mode,
    });
    sessions.set(session.publicId, session);
    sessions.set(session.sessionId, session);
    return cloneSession(session);
  }

  get(sessionId: string) {
    const session = sessions.get(sessionId);
    if (!session) {
      if (sessionId === "demo-session") {
        return this.create({
          mode: "compare",
          learnerKey: "learner-a",
          problemId: "ads_sales_001",
        });
      }
      throw new SessionEngineError(
        "SESSION_NOT_FOUND",
        `Session ${sessionId} was not found.`,
      );
    }
    return cloneSession(this.assertWritableBase(session, false));
  }

  mutate(
    sessionId: string,
    idempotencyKey: string,
    requestHash: string,
    operation: (session: MutableSession) => void,
  ) {
    const session = sessions.get(sessionId);
    if (!session) {
      throw new SessionEngineError(
        "SESSION_NOT_FOUND",
        `Session ${sessionId} was not found.`,
      );
    }

    const replay = session.idempotency.get(idempotencyKey);
    if (replay) {
      if (replay.requestHash !== requestHash) {
        throw new SessionEngineError(
          "IDEMPOTENCY_PAYLOAD_MISMATCH",
          "This Idempotency-Key was already used with a different payload.",
        );
      }
      return replay.response;
    }

    this.assertWritableBase(session, true);
    operation(session);
    session.updatedAt = nowIso();
    const snapshot = cloneSession(session);
    session.idempotency.set(idempotencyKey, {
      requestHash,
      response: snapshot,
    });
    return snapshot;
  }

  async mutateAsync(
    sessionId: string,
    idempotencyKey: string,
    requestHash: string,
    operation: (session: MutableSession) => Promise<void>,
  ) {
    const session = sessions.get(sessionId);
    if (!session) {
      throw new SessionEngineError(
        "SESSION_NOT_FOUND",
        `Session ${sessionId} was not found.`,
      );
    }

    const replay = session.idempotency.get(idempotencyKey);
    if (replay) {
      if (replay.requestHash !== requestHash) {
        throw new SessionEngineError(
          "IDEMPOTENCY_PAYLOAD_MISMATCH",
          "This Idempotency-Key was already used with a different payload.",
        );
      }
      return replay.response;
    }

    this.assertWritableBase(session, true);
    await operation(session);
    session.updatedAt = nowIso();
    const snapshot = cloneSession(session);
    session.idempotency.set(idempotencyKey, {
      requestHash,
      response: snapshot,
    });
    return snapshot;
  }

  addAttempt(
    session: MutableSession,
    input: AttemptInput,
    attemptType: AttemptType,
    problemId = session.currentProblemId,
  ) {
    if (
      session.attempts.some(
        (attempt) => attempt.submissionKey === input.submissionKey,
      )
    ) {
      throw new SessionEngineError(
        "DUPLICATE_SUBMISSION",
        "This submission was already recorded.",
      );
    }
    const attempt: PersistedAttempt = {
      id: crypto.randomUUID(),
      problemId,
      attemptType,
      answer: input.answer,
      explanation: input.explanation,
      selectedApproach: input.selectedApproach,
      confidence: input.confidence,
      submissionKey: input.submissionKey,
      createdAt: nowIso(),
    };
    session.attempts.push(attempt);
    return attempt;
  }

  addTransfer(session: MutableSession, input: TransferSubmitInput) {
    if (session.transfer) {
      throw new SessionEngineError(
        "DUPLICATE_SUBMISSION",
        "Transfer was already submitted.",
      );
    }
    session.transfer = {
      problemId: demoTransfer.problemId,
      answer: input.answer,
      explanation: input.explanation,
      success: input.answer.trim() === demoTransfer.correctAnswer,
    };
  }

  setAnalysis(
    session: MutableSession,
    analysis: Omit<ReasoningAnalysisSnapshot, "id" | "createdAt">,
  ) {
    session.analysis = {
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      ...analysis,
    };
  }

  setHypotheses(
    session: MutableSession,
    snapshot: Omit<HypothesisSnapshot, "id" | "createdAt">,
  ) {
    session.hypotheses = {
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      ...snapshot,
    };
  }

  setVerification(
    session: MutableSession,
    question: VerificationQuestionOutput,
    expectedEvidence: string,
    disconfirmingEvidence: string,
  ) {
    if (
      session.verification?.status === "pending" &&
      session.verification.targetHypothesisIds.join("|") ===
        question.targetHypothesisIds.join("|")
    ) {
      return;
    }

    session.verification = {
      id: crypto.randomUUID(),
      questionTemplateId: question.templateId,
      question: question.question,
      response: null,
      status: "pending",
      answerFormat: question.answerFormat,
      verificationGoal: question.verificationGoal,
      targetHypothesisIds: [...question.targetHypothesisIds],
      expectedEvidence,
      disconfirmingEvidence,
      hypothesisBefore: session.hypotheses?.ranking ?? null,
      hypothesisAfter: null,
      createdAt: nowIso(),
      answeredAt: null,
    };
  }

  setIntervention(
    session: MutableSession,
    selection: InterventionSelection,
    misconceptionId: string,
  ) {
    const snapshot: InterventionSnapshot = {
      id: crypto.randomUUID(),
      misconceptionId,
      interventionRecordId: selection.interventionRecordId,
      family: selection.family,
      level: selection.level,
      type: selection.type,
      title: selection.title,
      instructionalGoal: selection.instructionalGoal,
      preservedUnderstanding: [...selection.preservedUnderstanding],
      learnerFacingContent: selection.learnerFacingContent,
      visualizerType: selection.visualizerType,
      visualizerConfig: structuredClone(selection.visualizerConfig),
      revealsPartialAnswer: selection.revealsPartialAnswer,
      revealsFullAnswer: selection.revealsFullAnswer,
      escalationAvailable: selection.escalationAvailable,
      nextAllowedLevel: selection.nextAllowedLevel,
      selectionSource: selection.selectionSource,
      selectionReason: selection.selectionReason,
      supportLabel: selection.supportLabel,
      safetyValidation: structuredClone(selection.safetyValidation),
      replayCount: 0,
      interactions: [],
      acknowledgedAt: null,
      createdAt: nowIso(),
    };
    session.intervention = snapshot;
    session.interventionHistory.push(snapshot);
    session.supportUsage = summarizeInterventionUsage(
      session.interventionHistory,
    );
  }

  acknowledgeIntervention(session: MutableSession, interactionType: string) {
    if (!session.intervention) {
      throw new SessionEngineError(
        "INTERVENTION_NOT_READY",
        "No intervention is ready for this session.",
      );
    }
    const acknowledged = {
      ...session.intervention,
      interactions: [...session.intervention.interactions, interactionType],
      acknowledgedAt: nowIso(),
    };
    session.intervention = acknowledged;
    session.interventionHistory = session.interventionHistory.map((item) =>
      item.id === acknowledged.id ? acknowledged : item,
    );
    session.supportUsage = summarizeInterventionUsage(
      session.interventionHistory,
    );
  }

  answerVerification(
    session: MutableSession,
    response: string,
    result: VerificationEvaluationOutput,
  ) {
    if (!session.verification || session.verification.status !== "pending") {
      throw new SessionEngineError(
        "VERIFICATION_NOT_PENDING",
        "There is no pending verification question for this session.",
      );
    }

    session.verification = {
      ...session.verification,
      response,
      status: "answered",
      hypothesisAfter: result,
      answeredAt: nowIso(),
    };
  }

  transition(
    session: MutableSession,
    toStage: SessionStage,
    eventType: string,
    payload: Record<string, unknown> = {},
  ) {
    const fromStage = session.currentStage;
    session.completedStages = session.completedStages.includes(fromStage)
      ? session.completedStages
      : [...session.completedStages, fromStage];
    session.currentStage = toStage;
    if (toStage === "session_complete") {
      session.status = "completed";
      session.completedAt = nowIso();
    }
    this.recordEvent(session, eventType, fromStage, toStage, payload);
  }

  recordAuditEvent(
    session: MutableSession,
    eventType: string,
    payload: Record<string, unknown> = {},
  ) {
    this.recordEvent(
      session,
      eventType,
      session.currentStage,
      session.currentStage,
      payload,
    );
  }

  restart(sessionId: string) {
    const current = this.get(sessionId);
    const next = this.create({
      mode: current.mode,
      learnerKey: current.currentLearnerKey,
      problemId: current.currentProblemId,
    });
    return next;
  }

  cleanupExpired(dryRun: boolean) {
    const now = Date.now();
    const expired = [...new Set(sessions.values())].filter(
      (session) => Date.parse(session.expiresAt) < now,
    );
    if (!dryRun) {
      for (const session of expired) {
        sessions.delete(session.sessionId);
        sessions.delete(session.publicId);
      }
    }
    return {
      expiredCount: expired.length,
      deletedCount: dryRun ? 0 : expired.length,
    };
  }

  private assertWritableBase(session: MutableSession, forWrite: boolean) {
    if (
      session.status === "expired" ||
      Date.parse(session.expiresAt) < Date.now()
    ) {
      session.status = "expired";
      throw new SessionEngineError(
        "SESSION_EXPIRED",
        "This session has expired.",
      );
    }
    if (forWrite && session.status === "completed") {
      throw new SessionEngineError(
        "SESSION_COMPLETED",
        "Completed sessions are read-only.",
      );
    }
    return session;
  }

  private recordEvent(
    session: MutableSession,
    eventType: string,
    fromStage: SessionStage | null,
    toStage: SessionStage | null,
    payload: Record<string, unknown>,
  ) {
    session.events.push({
      id: crypto.randomUUID(),
      eventType,
      fromStage,
      toStage,
      payload,
      createdAt: nowIso(),
    });
  }
}

export const inMemorySessionRepository = new InMemorySessionRepository();
