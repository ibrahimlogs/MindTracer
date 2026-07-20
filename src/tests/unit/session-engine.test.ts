import { describe, expect, it } from "vitest";

import {
  allowedTransitions,
  canTransitionSession,
  createSessionSchema,
  SessionEngineError,
  sessionEngine,
  sessionStages,
} from "@/lib/session-engine";

const attempt = {
  answer: "10",
  explanation: "The values increase, so I extended the pattern.",
  selectedApproach: "pattern_extension",
  confidence: "medium",
  submissionKey: "initial-key-0001",
};

function createSession(learnerKey: "learner-a" | "learner-b" = "learner-a") {
  return sessionEngine.createSession({
    mode: "compare",
    learnerKey,
    problemId: "ads_sales_001",
  });
}

function progressToInterventionShown(sessionId: string) {
  sessionEngine.submitInitialAttempt(sessionId, attempt, "idem-initial-0001");
  sessionEngine.generateAnalysis(sessionId, "idem-analysis-0001");
  sessionEngine.generateHypotheses(sessionId, "idem-hypotheses-0001");
  sessionEngine.submitVerification(
    sessionId,
    { response: "The change is +2.", submissionKey: "verify-key-0001" },
    "idem-verify-0001",
  );
  sessionEngine.selectIntervention(sessionId, "idem-intervention-0001");
  return sessionEngine.acknowledgeIntervention(sessionId, "idem-ack-0001");
}

describe("session engine", () => {
  it("defines every legal transition explicitly", () => {
    for (const [from, targets] of Object.entries(allowedTransitions)) {
      for (const to of targets) {
        expect(
          canTransitionSession(from as keyof typeof allowedTransitions, to),
        ).toBe(true);
      }
    }
  });

  it("rejects illegal transitions", () => {
    for (const from of sessionStages) {
      for (const to of sessionStages) {
        const legal = (allowedTransitions[from] as readonly string[]).includes(
          to,
        );
        if (!legal && from !== to) {
          expect(canTransitionSession(from, to)).toBe(false);
        }
      }
    }
  });

  it("creates, resumes and persists demo learner selection", () => {
    const session = createSession("learner-b");
    const resumed = sessionEngine.getSession(session.publicId);

    expect(resumed.currentLearnerKey).toBe("learner-b");
    expect(resumed.currentStage).toBe("problem_presented");
    expect(resumed.fallbackMode).toBe(true);
  });

  it("uses stable request validation contracts", () => {
    expect(() => createSessionSchema.parse({ mode: "invalid" })).toThrow();
  });

  it("returns idempotent replay for exact duplicate writes", () => {
    const session = createSession();
    const first = sessionEngine.submitInitialAttempt(
      session.publicId,
      attempt,
      "idem-replay-0001",
    );
    const replay = sessionEngine.submitInitialAttempt(
      session.publicId,
      attempt,
      "idem-replay-0001",
    );

    expect(replay).toEqual(first);
  });

  it("rejects an idempotency key reused with a different payload", () => {
    const session = createSession();
    sessionEngine.submitInitialAttempt(
      session.publicId,
      attempt,
      "idem-mismatch-1",
    );

    expect(() =>
      sessionEngine.submitInitialAttempt(
        session.publicId,
        { ...attempt, answer: "11" },
        "idem-mismatch-1",
      ),
    ).toThrow(SessionEngineError);
  });

  it("rejects retry before intervention", () => {
    const session = createSession();

    expect(() =>
      sessionEngine.submitRetry(
        session.publicId,
        { ...attempt, submissionKey: "retry-before-1" },
        "idem-retry-before-1",
      ),
    ).toThrow(SessionEngineError);
  });

  it("rejects transfer before a delta report exists", () => {
    const session = createSession();

    expect(() =>
      sessionEngine.startTransfer(session.publicId, "idem-transfer-before-1"),
    ).toThrow(SessionEngineError);
  });

  it("rejects verification without a pending question", () => {
    const session = createSession();

    expect(() =>
      sessionEngine.submitVerification(
        session.publicId,
        { response: "No pending question.", submissionKey: "verify-none-1" },
        "idem-verify-none-1",
      ),
    ).toThrow(SessionEngineError);
  });

  it("completes the deterministic session and then rejects writes", () => {
    const session = createSession();
    progressToInterventionShown(session.publicId);
    sessionEngine.submitRetry(
      session.publicId,
      { ...attempt, answer: "11", submissionKey: "retry-complete-1" },
      "idem-retry-complete-1",
    );
    sessionEngine.createDelta(session.publicId, "idem-delta-complete-1");
    sessionEngine.startTransfer(
      session.publicId,
      "idem-transfer-start-complete-1",
    );
    const completed = sessionEngine.submitTransfer(
      session.publicId,
      {
        answer: "64",
        explanation: "The score increases by 3 each hour.",
        supportUsed: false,
        submissionKey: "transfer-complete-1",
      },
      "idem-transfer-submit-complete-1",
    );

    expect(completed.status).toBe("completed");
    expect(() =>
      sessionEngine.submitRetry(
        session.publicId,
        { ...attempt, submissionKey: "retry-after-complete-1" },
        "idem-retry-after-complete-1",
      ),
    ).toThrow(SessionEngineError);
  });

  it("restarts by cloning the session setup into a new active session", () => {
    const session = createSession("learner-b");
    const restarted = sessionEngine.restart(session.publicId);

    expect(restarted.publicId).not.toBe(session.publicId);
    expect(restarted.currentLearnerKey).toBe("learner-b");
    expect(restarted.currentStage).toBe("problem_presented");
  });
});
