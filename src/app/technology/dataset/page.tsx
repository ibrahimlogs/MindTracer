import type { Metadata } from "next";

import { PageShell, SectionContainer } from "@/components/layout/primitives";
import { PageHeader } from "@/components/layout/section-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DatasetExplorer } from "@/components/technology/dataset-explorer";
import { StatusPill } from "@/components/ui/status-pill";
import {
  getAllConcepts,
  getAllMisconceptions,
  getAllProblems,
  getEducationValidationSummary,
  getEvaluationCases,
  loadEducationDataset,
} from "@/data/education";

export const metadata: Metadata = {
  title: "Development Dataset Explorer",
  description:
    "A development explorer for the prototype MindTrace educational dataset.",
};

export default function DatasetExplorerPage() {
  const dataset = loadEducationDataset();

  return (
    <PageShell>
      <section className="border-b border-border/70 py-16 sm:py-24">
        <SectionContainer>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <PageHeader
              eyebrow="Development dataset explorer"
              title="Curated records for the next reasoning engine."
              description="This prototype dataset keeps concept definitions, problems, misconceptions, verification templates, intervention ladders, rubrics, transfers, and evaluation cases auditable before any AI layer is connected."
            />
            <StatusPill tone="success">Validation passing</StatusPill>
          </div>
        </SectionContainer>
      </section>

      <section className="py-10 sm:py-14">
        <SectionContainer>
          <DatasetExplorer
            concepts={getAllConcepts()}
            problems={getAllProblems()}
            misconceptions={getAllMisconceptions()}
            rubrics={dataset.rubrics}
            evaluationCases={getEvaluationCases()}
            summary={getEducationValidationSummary()}
          />
        </SectionContainer>
      </section>
      <SiteFooter />
    </PageShell>
  );
}
