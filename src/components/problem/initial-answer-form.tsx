"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { WandSparkles } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  approachOptions,
  confidenceOptions,
  initialAttemptSchema,
  type InitialAttemptValues,
} from "@/lib/demo-learning/forms";
import type { DemoLearner } from "@/types/demo-learning";

import { FieldErrorText, inputClassName, labelClassName } from "./field-parts";

interface InitialAnswerFormProps {
  learner: DemoLearner;
  mode: string;
  onSubmit: (values: InitialAttemptValues) => void;
}

export function InitialAnswerForm({
  learner,
  mode,
  onSubmit,
}: InitialAnswerFormProps) {
  const form = useForm<InitialAttemptValues>({
    resolver: zodResolver(initialAttemptSchema),
    defaultValues: {
      answer: "",
      explanation: "",
      approach: undefined,
      confidence: undefined,
    },
  });

  useEffect(() => {
    form.reset();
  }, [form, learner.id]);

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xl font-semibold text-text-primary">
          Share your first thought
        </p>
        {mode === "compare" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              form.reset({
                answer: learner.answer,
                explanation: learner.explanation,
                approach:
                  learner.selectedApproach as InitialAttemptValues["approach"],
                confidence:
                  learner.confidence as InitialAttemptValues["confidence"],
              })
            }
          >
            <WandSparkles className="size-4" aria-hidden="true" />
            Load learner response
          </Button>
        ) : null}
      </div>
      {mode === "learner" ? (
        <p className="rounded-2xl bg-attention-soft p-4 text-sm leading-6 text-text-secondary">
          Prototype simulation: typed responses are mapped to one of the
          reviewed mocked paths. No live AI analysis is running.
        </p>
      ) : null}
      <label className="block">
        <span className={labelClassName}>Your answer</span>
        <input
          className={inputClassName}
          aria-invalid={Boolean(form.formState.errors.answer)}
          aria-describedby="answer-error"
          {...form.register("answer")}
        />
        <FieldErrorText
          id="answer-error"
          error={form.formState.errors.answer}
        />
      </label>
      <label className="block">
        <span className={labelClassName}>Explain your thinking</span>
        <textarea
          className={`${inputClassName} min-h-24 resize-y`}
          aria-invalid={Boolean(form.formState.errors.explanation)}
          aria-describedby="explanation-error"
          {...form.register("explanation")}
        />
        <FieldErrorText
          id="explanation-error"
          error={form.formState.errors.explanation}
        />
      </label>
      <label className="block">
        <span className={labelClassName}>How did you approach it?</span>
        <select className={inputClassName} {...form.register("approach")}>
          <option value="">Choose an approach</option>
          {approachOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <FieldErrorText
          id="approach-error"
          error={form.formState.errors.approach}
        />
      </label>
      <label className="block">
        <span className={labelClassName}>How confident are you?</span>
        <select className={inputClassName} {...form.register("confidence")}>
          <option value="">Choose confidence</option>
          {confidenceOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <FieldErrorText
          id="confidence-error"
          error={form.formState.errors.confidence}
        />
      </label>
      <Button type="submit" className="w-full">
        Submit my reasoning
      </Button>
    </form>
  );
}
