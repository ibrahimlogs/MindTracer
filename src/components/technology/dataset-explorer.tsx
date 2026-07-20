"use client";

import { CheckCircle2, Library, Search } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { EvidenceChip } from "@/components/ui/evidence-chip";
import { StatusPill } from "@/components/ui/status-pill";
import { ElevatedSurface, InsetSurface } from "@/components/ui/surface";
import type { EducationValidationSummary } from "@/data/education";
import type {
  ConceptRecord,
  EvaluationCase,
  MisconceptionRecord,
  ProblemRecord,
  ReasoningRubric,
} from "@/types/education";
import type { InterventionLevel } from "@/types/intervention";

interface DatasetExplorerProps {
  concepts: readonly ConceptRecord[];
  problems: readonly ProblemRecord[];
  misconceptions: readonly MisconceptionRecord[];
  rubrics: readonly ReasoningRubric[];
  evaluationCases: readonly EvaluationCase[];
  summary: EducationValidationSummary;
}

type Detail =
  | { type: "concept"; id: string }
  | { type: "problem"; id: string }
  | { type: "misconception"; id: string }
  | { type: "rubric"; id: string }
  | { type: "evaluationCase"; id: string };

const allValue = "all";

function optionLabel(value: string) {
  return value.replaceAll("_", " ");
}

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-mono text-[0.625rem] tracking-[0.14em] text-text-muted uppercase">
        {label}
      </span>
      <select
        className="h-10 rounded-md border border-border bg-surface-inset px-3 text-sm text-text-primary"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value={allValue}>All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function DetailButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="w-full rounded-md border border-border bg-surface-inset px-4 py-3 text-left text-sm text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <InsetSurface className="p-4">
      <p className="font-mono text-[0.625rem] tracking-[0.14em] text-text-muted uppercase">
        {label}
      </p>
      <p className="mt-3 font-mono text-2xl text-text-primary">{value}</p>
    </InsetSurface>
  );
}

export function DatasetExplorer({
  concepts,
  problems,
  misconceptions,
  rubrics,
  evaluationCases,
  summary,
}: DatasetExplorerProps) {
  const [conceptFamily, setConceptFamily] = useState(allValue);
  const [difficulty, setDifficulty] = useState(allValue);
  const [misconceptionId, setMisconceptionId] = useState(allValue);
  const [interventionLevel, setInterventionLevel] = useState(allValue);
  const [reviewStatus, setReviewStatus] = useState(allValue);
  const [detail, setDetail] = useState<Detail>({
    type: "concept",
    id: concepts[0]?.conceptId ?? "",
  });

  const conceptFamilies = useMemo(
    () => [...new Set(concepts.map((concept) => concept.familyId))],
    [concepts],
  );
  const difficulties = useMemo(
    () => [...new Set(problems.map((problem) => problem.difficulty))],
    [problems],
  );
  const reviewStatuses = useMemo(
    () => [
      ...new Set(
        evaluationCases.map((evaluationCase) => evaluationCase.reviewStatus),
      ),
    ],
    [evaluationCases],
  );

  const filteredConcepts = concepts.filter(
    (concept) =>
      conceptFamily === allValue || concept.familyId === conceptFamily,
  );
  const filteredProblems = problems.filter((problem) => {
    const matchesDifficulty =
      difficulty === allValue || problem.difficulty === difficulty;
    const matchesMisconception =
      misconceptionId === allValue ||
      problem.targetMisconceptionIds.includes(misconceptionId);
    return matchesDifficulty && matchesMisconception;
  });
  const filteredMisconceptions = misconceptions.filter((misconception) => {
    const level = Number(interventionLevel) as InterventionLevel;
    return (
      (misconceptionId === allValue ||
        misconception.misconceptionId === misconceptionId) &&
      (interventionLevel === allValue ||
        misconception.interventionLadder.some(
          (intervention) => intervention.level === level,
        ))
    );
  });
  const filteredEvaluationCases = evaluationCases.filter(
    (evaluationCase) =>
      reviewStatus === allValue || evaluationCase.reviewStatus === reviewStatus,
  );

  const selected = {
    concept:
      concepts.find((concept) => concept.conceptId === detail.id) ??
      concepts[0],
    problem:
      problems.find((problem) => problem.problemId === detail.id) ??
      problems[0],
    misconception:
      misconceptions.find(
        (misconception) => misconception.misconceptionId === detail.id,
      ) ?? misconceptions[0],
    rubric:
      rubrics.find((rubric) => rubric.rubricId === detail.id) ?? rubrics[0],
    evaluationCase:
      evaluationCases.find(
        (evaluationCase) => evaluationCase.caseId === detail.id,
      ) ?? evaluationCases[0],
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Concepts" value={summary.conceptCount} />
        <Metric label="Problems" value={summary.problemCount} />
        <Metric label="Misconceptions" value={summary.misconceptionCount} />
        <Metric label="Evaluation cases" value={summary.evaluationCaseCount} />
      </div>

      <ElevatedSurface className="p-5">
        <div className="mb-5 flex items-center gap-2 text-sm text-text-secondary">
          <Search className="size-4 text-reasoning" aria-hidden="true" />
          Dataset filters
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          <SelectFilter
            label="Concept family"
            value={conceptFamily}
            options={conceptFamilies}
            onChange={setConceptFamily}
          />
          <SelectFilter
            label="Difficulty"
            value={difficulty}
            options={difficulties}
            onChange={setDifficulty}
          />
          <SelectFilter
            label="Misconception"
            value={misconceptionId}
            options={misconceptions.map(
              (misconception) => misconception.misconceptionId,
            )}
            onChange={setMisconceptionId}
          />
          <SelectFilter
            label="Intervention level"
            value={interventionLevel}
            options={["1", "2", "3", "4", "5", "6", "7", "8"]}
            onChange={setInterventionLevel}
          />
          <SelectFilter
            label="Review status"
            value={reviewStatus}
            options={reviewStatuses}
            onChange={setReviewStatus}
          />
        </div>
      </ElevatedSurface>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.88fr]">
        <div className="grid gap-5 lg:grid-cols-2">
          <ElevatedSurface className="p-5">
            <h2 className="text-lg font-medium">Concept list</h2>
            <div className="mt-4 grid gap-2">
              {filteredConcepts.map((concept) => (
                <DetailButton
                  key={concept.conceptId}
                  onClick={() =>
                    setDetail({ type: "concept", id: concept.conceptId })
                  }
                >
                  <span className="block text-text-primary">
                    {concept.title}
                  </span>
                  <span className="mt-1 block text-xs">
                    {concept.shortDescription}
                  </span>
                </DetailButton>
              ))}
            </div>
          </ElevatedSurface>

          <ElevatedSurface className="p-5">
            <h2 className="text-lg font-medium">Problem list</h2>
            <div className="mt-4 grid gap-2">
              {filteredProblems.map((problem) => (
                <DetailButton
                  key={problem.problemId}
                  onClick={() =>
                    setDetail({ type: "problem", id: problem.problemId })
                  }
                >
                  <span className="block text-text-primary">
                    {problem.title}
                  </span>
                  <span className="mt-1 block text-xs">
                    {optionLabel(problem.difficulty)} / {problem.correctAnswer}
                  </span>
                </DetailButton>
              ))}
            </div>
          </ElevatedSurface>

          <ElevatedSurface className="p-5">
            <h2 className="text-lg font-medium">Misconception list</h2>
            <div className="mt-4 grid gap-2">
              {filteredMisconceptions.map((misconception) => (
                <DetailButton
                  key={misconception.misconceptionId}
                  onClick={() =>
                    setDetail({
                      type: "misconception",
                      id: misconception.misconceptionId,
                    })
                  }
                >
                  <span className="block text-text-primary">
                    {misconception.title}
                  </span>
                  <span className="mt-1 block text-xs">
                    {misconception.verificationQuestionTemplates.length}{" "}
                    templates / {misconception.interventionLadder.length}{" "}
                    interventions
                  </span>
                </DetailButton>
              ))}
            </div>
          </ElevatedSurface>

          <ElevatedSurface className="p-5">
            <h2 className="text-lg font-medium">Evaluation-case explorer</h2>
            <div className="mt-4 grid gap-2">
              {filteredEvaluationCases.slice(0, 12).map((evaluationCase) => (
                <DetailButton
                  key={evaluationCase.caseId}
                  onClick={() =>
                    setDetail({
                      type: "evaluationCase",
                      id: evaluationCase.caseId,
                    })
                  }
                >
                  <span className="block text-text-primary">
                    {evaluationCase.caseId}
                  </span>
                  <span className="mt-1 block text-xs">
                    {evaluationCase.reviewStatus} / {evaluationCase.problemId}
                  </span>
                </DetailButton>
              ))}
            </div>
          </ElevatedSurface>

          <ElevatedSurface className="p-5 lg:col-span-2">
            <h2 className="text-lg font-medium">Rubric explorer</h2>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {rubrics.map((rubric) => (
                <DetailButton
                  key={rubric.rubricId}
                  onClick={() =>
                    setDetail({ type: "rubric", id: rubric.rubricId })
                  }
                >
                  <span className="block text-text-primary">
                    {rubric.title}
                  </span>
                  <span className="mt-1 block text-xs">
                    {rubric.dimensions.length} fixed dimensions
                  </span>
                </DetailButton>
              ))}
            </div>
          </ElevatedSurface>
        </div>

        <ElevatedSurface className="p-5 xl:sticky xl:top-24 xl:self-start">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Library className="size-4 text-reasoning" aria-hidden="true" />
              <h2 className="text-lg font-medium">Detail panel</h2>
            </div>
            <StatusPill tone="success">
              <CheckCircle2 className="size-3" aria-hidden="true" />
              Valid
            </StatusPill>
          </div>

          {detail.type === "concept" && selected.concept ? (
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">
                {selected.concept.title}
              </h3>
              <p className="text-sm leading-6 text-text-secondary">
                {selected.concept.fullDescription}
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.concept.learningObjectives.map((objective) => (
                  <EvidenceChip key={objective}>{objective}</EvidenceChip>
                ))}
              </div>
            </div>
          ) : null}

          {detail.type === "problem" && selected.problem ? (
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">
                {selected.problem.title}
              </h3>
              <p className="text-sm leading-6 text-text-secondary">
                {selected.problem.question}
              </p>
              <p className="font-mono text-sm text-success">
                Answer: {selected.problem.correctAnswer}
              </p>
              <div>
                <p className="mb-2 font-mono text-[0.625rem] tracking-[0.14em] text-text-muted uppercase">
                  Transfer mappings
                </p>
                <div className="flex flex-wrap gap-2">
                  {selected.problem.transferProblemIds.map(
                    (transferProblemId) => (
                      <EvidenceChip key={transferProblemId} state="confirmed">
                        {transferProblemId}
                      </EvidenceChip>
                    ),
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {detail.type === "misconception" && selected.misconception ? (
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">
                {selected.misconception.title}
              </h3>
              <p className="text-sm leading-6 text-text-secondary">
                {selected.misconception.fullDescription}
              </p>
              <div>
                <p className="mb-2 font-mono text-[0.625rem] tracking-[0.14em] text-text-muted uppercase">
                  Verification templates
                </p>
                <div className="grid gap-2">
                  {selected.misconception.verificationQuestionTemplates.map(
                    (template) => (
                      <InsetSurface key={template.templateId} className="p-3">
                        <p className="text-sm text-text-primary">
                          {template.promptTemplate}
                        </p>
                        <p className="mt-1 font-mono text-xs text-text-muted">
                          {template.type}
                        </p>
                      </InsetSurface>
                    ),
                  )}
                </div>
              </div>
              <div>
                <p className="mb-2 font-mono text-[0.625rem] tracking-[0.14em] text-text-muted uppercase">
                  Intervention ladders
                </p>
                <ol className="grid gap-2">
                  {selected.misconception.interventionLadder.map(
                    (intervention) => (
                      <li key={intervention.interventionId}>
                        <InsetSurface className="p-3">
                          <p className="font-mono text-xs text-reasoning">
                            Level {intervention.level}
                          </p>
                          <p className="mt-1 text-sm text-text-primary">
                            {intervention.title}
                          </p>
                        </InsetSurface>
                      </li>
                    ),
                  )}
                </ol>
              </div>
            </div>
          ) : null}

          {detail.type === "rubric" && selected.rubric ? (
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">
                {selected.rubric.title}
              </h3>
              <p className="text-sm leading-6 text-text-secondary">
                {selected.rubric.description}
              </p>
              <div className="grid gap-2">
                {selected.rubric.dimensions.map((dimension) => (
                  <EvidenceChip key={dimension.dimensionId}>
                    {dimension.title}
                  </EvidenceChip>
                ))}
              </div>
            </div>
          ) : null}

          {detail.type === "evaluationCase" && selected.evaluationCase ? (
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">
                {selected.evaluationCase.caseId}
              </h3>
              <p className="font-mono text-sm text-text-primary">
                Answer: {selected.evaluationCase.learnerAnswer || "empty"}
              </p>
              <p className="text-sm leading-6 text-text-secondary">
                {selected.evaluationCase.learnerExplanation ||
                  "No explanation provided."}
              </p>
              <StatusPill
                tone={
                  selected.evaluationCase.reviewStatus === "reviewed"
                    ? "success"
                    : "attention"
                }
              >
                {selected.evaluationCase.reviewStatus}
              </StatusPill>
            </div>
          ) : null}
        </ElevatedSurface>
      </div>
    </div>
  );
}
