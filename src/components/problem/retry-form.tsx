"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { retrySchema, type RetryValues } from "@/lib/demo-learning/forms";
import type { DemoLearner } from "@/types/demo-learning";

import { FieldErrorText, inputClassName, labelClassName } from "./field-parts";

interface RetryFormProps {
  learner: DemoLearner;
  onSubmit: (values: RetryValues) => void;
}

export function RetryForm({ learner, onSubmit }: RetryFormProps) {
  const form = useForm<RetryValues>({
    resolver: zodResolver(retrySchema),
    defaultValues: {
      answer: "",
      explanation: "",
      confidence: "Somewhat confident",
    },
  });

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <label className="block">
        <span className={labelClassName}>Revised answer</span>
        <input className={inputClassName} {...form.register("answer")} />
        <FieldErrorText
          id="retry-answer-error"
          error={form.formState.errors.answer}
        />
      </label>
      <label className="block">
        <span className={labelClassName}>Revised explanation</span>
        <textarea
          className={`${inputClassName} min-h-24`}
          {...form.register("explanation")}
        />
        <FieldErrorText
          id="retry-explanation-error"
          error={form.formState.errors.explanation}
        />
      </label>
      <label className="block">
        <span className={labelClassName}>Updated confidence</span>
        <select className={inputClassName} {...form.register("confidence")}>
          <option>Confident</option>
          <option>Somewhat confident</option>
          <option>Unsure</option>
          <option>Guessing</option>
        </select>
      </label>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            form.reset({
              answer: learner.revisedAnswer,
              explanation: learner.revisedExplanation,
              confidence: "Somewhat confident",
            })
          }
        >
          Load revised response
        </Button>
        <Button type="submit">Submit retry</Button>
      </div>
    </form>
  );
}
