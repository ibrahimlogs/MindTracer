"use client";

import { motion } from "framer-motion";

import type { SessionSnapshot } from "@/lib/session-engine";

import { AfterState } from "./after-state";
import { BeforeState } from "./before-state";
import { ConflictState } from "./conflict-state";
import { InterventionState } from "./intervention-state";
import { RubricDimensions } from "./rubric-dimensions";
import { SupportSummary } from "./support-summary";
import { TransferEvidence } from "./transfer-evidence";

export function DeltaOverview({
  report,
}: {
  report: NonNullable<SessionSnapshot["report"]>;
}) {
  return (
    <motion.div layout className="grid gap-3">
      <BeforeState text={report.startingMentalModel} />
      <ConflictState text={report.verificationEvidence} />
      <InterventionState
        family={report.interventionFamily}
        level={report.interventionLevel}
      />
      <AfterState text={report.revisedMentalModel} />
      <RubricDimensions dimensions={report.delta.dimensions} />
      <SupportSummary support={report.supportUsed} />
      <TransferEvidence outcome={report.transferOutcome} />
    </motion.div>
  );
}
