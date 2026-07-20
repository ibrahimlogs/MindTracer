CREATE TYPE "RecordStatus" AS ENUM ('active', 'experimental', 'archived');
CREATE TYPE "MisconceptionSeverity" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "SessionMode" AS ENUM ('compare', 'learner', 'pipeline', 'judge');
CREATE TYPE "SessionStatus" AS ENUM ('active', 'completed', 'abandoned', 'expired');
CREATE TYPE "LearningStage" AS ENUM ('problem_presented', 'initial_attempt', 'reasoning_analysis', 'hypothesis_ready', 'verification_required', 'verification_submitted', 'intervention_ready', 'intervention_shown', 'retry_required', 'retry_submitted', 'reasoning_delta', 'transfer_presented', 'transfer_submitted', 'session_complete');
CREATE TYPE "AttemptType" AS ENUM ('initial', 'retry', 'transfer');
CREATE TYPE "AnalysisSource" AS ENUM ('deterministic', 'fallback');
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'answered', 'skipped');

CREATE TABLE "Concept" (
  "id" TEXT NOT NULL,
  "familyId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" "RecordStatus" NOT NULL,
  "sourceVersion" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Concept_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Problem" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "conceptFamilyId" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL,
  "contentJson" JSONB NOT NULL,
  "correctAnswerJson" JSONB NOT NULL,
  "solutionModelJson" JSONB NOT NULL,
  "rubricId" TEXT NOT NULL,
  "status" "RecordStatus" NOT NULL,
  "sourceVersion" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Misconception" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "severity" "MisconceptionSeverity" NOT NULL,
  "contentJson" JSONB NOT NULL,
  "status" "RecordStatus" NOT NULL,
  "sourceVersion" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Misconception_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProblemMisconception" (
  "problemId" TEXT NOT NULL,
  "misconceptionId" TEXT NOT NULL,
  "priority" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProblemMisconception_pkey" PRIMARY KEY ("problemId", "misconceptionId")
);

CREATE TABLE "LearningSession" (
  "id" TEXT NOT NULL,
  "publicId" TEXT NOT NULL,
  "mode" "SessionMode" NOT NULL,
  "currentProblemId" TEXT NOT NULL,
  "currentLearnerKey" TEXT NOT NULL,
  "currentStage" "LearningStage" NOT NULL,
  "status" "SessionStatus" NOT NULL,
  "educationalDataVersion" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "metadataJson" JSONB NOT NULL,
  CONSTRAINT "LearningSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LearnerAttempt" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "problemId" TEXT NOT NULL,
  "attemptType" "AttemptType" NOT NULL,
  "answerJson" JSONB NOT NULL,
  "explanation" TEXT NOT NULL,
  "selectedApproach" TEXT,
  "confidence" TEXT,
  "submissionKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LearnerAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReasoningAnalysis" (
  "id" TEXT NOT NULL,
  "attemptId" TEXT NOT NULL,
  "source" "AnalysisSource" NOT NULL,
  "extractedEvidenceJson" JSONB NOT NULL,
  "safeSummaryJson" JSONB NOT NULL,
  "promptVersion" TEXT NOT NULL,
  "modelMetadataJson" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReasoningAnalysis_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MisconceptionHypothesis" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "attemptId" TEXT NOT NULL,
  "misconceptionId" TEXT NOT NULL,
  "rank" INTEGER NOT NULL,
  "confidenceBand" TEXT NOT NULL,
  "supportingEvidenceJson" JSONB NOT NULL,
  "conflictingEvidenceJson" JSONB NOT NULL,
  "verificationNeeded" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MisconceptionHypothesis_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VerificationInteraction" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "questionTemplateId" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "response" TEXT,
  "status" "VerificationStatus" NOT NULL,
  "hypothesisBeforeJson" JSONB NOT NULL,
  "hypothesisAfterJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "answeredAt" TIMESTAMP(3),
  CONSTRAINT "VerificationInteraction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Intervention" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "misconceptionId" TEXT NOT NULL,
  "interventionRecordId" TEXT NOT NULL,
  "level" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "contentJson" JSONB NOT NULL,
  "visualizerConfigJson" JSONB NOT NULL,
  "acknowledgedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Intervention_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TransferAttempt" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "problemId" TEXT NOT NULL,
  "answerJson" JSONB NOT NULL,
  "explanation" TEXT NOT NULL,
  "supportUsed" BOOLEAN NOT NULL,
  "success" BOOLEAN NOT NULL,
  "evaluationJson" JSONB NOT NULL,
  "submissionKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TransferAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReasoningDeltaReport" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "beforeJson" JSONB NOT NULL,
  "afterJson" JSONB NOT NULL,
  "dimensionsJson" JSONB NOT NULL,
  "learnerFacingSummary" TEXT NOT NULL,
  "remainingGapsJson" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReasoningDeltaReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SessionEvent" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "fromStage" "LearningStage",
  "toStage" "LearningStage",
  "payloadJson" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SessionEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IdempotencyRecord" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "requestHash" TEXT NOT NULL,
  "responseJson" JSONB NOT NULL,
  "statusCode" INTEGER NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IdempotencyRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LearningSession_publicId_key" ON "LearningSession"("publicId");
CREATE UNIQUE INDEX "LearnerAttempt_sessionId_submissionKey_key" ON "LearnerAttempt"("sessionId", "submissionKey");
CREATE UNIQUE INDEX "ReasoningAnalysis_attemptId_key" ON "ReasoningAnalysis"("attemptId");
CREATE UNIQUE INDEX "TransferAttempt_sessionId_submissionKey_key" ON "TransferAttempt"("sessionId", "submissionKey");
CREATE UNIQUE INDEX "ReasoningDeltaReport_sessionId_key" ON "ReasoningDeltaReport"("sessionId");
CREATE UNIQUE INDEX "IdempotencyRecord_scope_key_key" ON "IdempotencyRecord"("scope", "key");

CREATE INDEX "Concept_familyId_idx" ON "Concept"("familyId");
CREATE INDEX "Concept_status_idx" ON "Concept"("status");
CREATE INDEX "Problem_conceptFamilyId_idx" ON "Problem"("conceptFamilyId");
CREATE INDEX "Problem_rubricId_idx" ON "Problem"("rubricId");
CREATE INDEX "Problem_status_idx" ON "Problem"("status");
CREATE INDEX "Misconception_severity_idx" ON "Misconception"("severity");
CREATE INDEX "Misconception_status_idx" ON "Misconception"("status");
CREATE INDEX "ProblemMisconception_misconceptionId_idx" ON "ProblemMisconception"("misconceptionId");
CREATE INDEX "LearningSession_publicId_idx" ON "LearningSession"("publicId");
CREATE INDEX "LearningSession_status_idx" ON "LearningSession"("status");
CREATE INDEX "LearningSession_expiresAt_idx" ON "LearningSession"("expiresAt");
CREATE INDEX "LearningSession_currentStage_idx" ON "LearningSession"("currentStage");
CREATE INDEX "LearnerAttempt_sessionId_attemptType_idx" ON "LearnerAttempt"("sessionId", "attemptType");
CREATE INDEX "MisconceptionHypothesis_sessionId_rank_idx" ON "MisconceptionHypothesis"("sessionId", "rank");
CREATE INDEX "MisconceptionHypothesis_misconceptionId_idx" ON "MisconceptionHypothesis"("misconceptionId");
CREATE INDEX "VerificationInteraction_sessionId_status_idx" ON "VerificationInteraction"("sessionId", "status");
CREATE INDEX "VerificationInteraction_questionTemplateId_idx" ON "VerificationInteraction"("questionTemplateId");
CREATE INDEX "Intervention_sessionId_level_idx" ON "Intervention"("sessionId", "level");
CREATE INDEX "Intervention_misconceptionId_idx" ON "Intervention"("misconceptionId");
CREATE INDEX "TransferAttempt_sessionId_idx" ON "TransferAttempt"("sessionId");
CREATE INDEX "SessionEvent_sessionId_createdAt_idx" ON "SessionEvent"("sessionId", "createdAt");
CREATE INDEX "SessionEvent_eventType_idx" ON "SessionEvent"("eventType");
CREATE INDEX "IdempotencyRecord_expiresAt_idx" ON "IdempotencyRecord"("expiresAt");

ALTER TABLE "ProblemMisconception" ADD CONSTRAINT "ProblemMisconception_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProblemMisconception" ADD CONSTRAINT "ProblemMisconception_misconceptionId_fkey" FOREIGN KEY ("misconceptionId") REFERENCES "Misconception"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearningSession" ADD CONSTRAINT "LearningSession_currentProblemId_fkey" FOREIGN KEY ("currentProblemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LearnerAttempt" ADD CONSTRAINT "LearnerAttempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LearningSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearnerAttempt" ADD CONSTRAINT "LearnerAttempt_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReasoningAnalysis" ADD CONSTRAINT "ReasoningAnalysis_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "LearnerAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MisconceptionHypothesis" ADD CONSTRAINT "MisconceptionHypothesis_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LearningSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MisconceptionHypothesis" ADD CONSTRAINT "MisconceptionHypothesis_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "LearnerAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MisconceptionHypothesis" ADD CONSTRAINT "MisconceptionHypothesis_misconceptionId_fkey" FOREIGN KEY ("misconceptionId") REFERENCES "Misconception"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VerificationInteraction" ADD CONSTRAINT "VerificationInteraction_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LearningSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LearningSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_misconceptionId_fkey" FOREIGN KEY ("misconceptionId") REFERENCES "Misconception"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TransferAttempt" ADD CONSTRAINT "TransferAttempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LearningSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TransferAttempt" ADD CONSTRAINT "TransferAttempt_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReasoningDeltaReport" ADD CONSTRAINT "ReasoningDeltaReport_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LearningSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SessionEvent" ADD CONSTRAINT "SessionEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LearningSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
