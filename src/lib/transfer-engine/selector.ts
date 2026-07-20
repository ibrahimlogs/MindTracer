import { getProblemById, getTransferProblems } from "@/data/education";
import type { SessionSnapshot } from "@/lib/session-engine";
import { SessionEngineError } from "@/lib/session-engine";

import type { TransferSelection } from "./schemas.ts";

export interface TransferProblemSelector {
  select(session: SessionSnapshot): TransferSelection;
}

export class CuratedTransferProblemSelector implements TransferProblemSelector {
  select(session: SessionSnapshot): TransferSelection {
    const source = getProblemById(session.currentProblemId);
    const completed = new Set(
      session.transfer ? [session.transfer.problemId] : [],
    );
    const selected = getTransferProblems(source.problemId).find(
      (candidate) =>
        candidate.status === "active" &&
        candidate.problemId !== source.problemId &&
        !completed.has(candidate.problemId) &&
        candidate.correctAnswer !== source.correctAnswer &&
        candidate.question !== source.question &&
        candidate.requiredConceptIds.some((conceptId) =>
          source.requiredConceptIds.includes(conceptId),
        ),
    );
    if (!selected) {
      throw new SessionEngineError(
        "TRANSFER_NOT_READY",
        "No valid curated transfer problem is available.",
      );
    }
    return {
      problemId: selected.problemId,
      supportState: "independent",
      selectorSource: "deterministic",
      selectionReason:
        "Selected from curated transfer mappings with a different context and shared core concept.",
      selectedAt: new Date().toISOString(),
    };
  }
}
