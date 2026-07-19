"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  shortResponseSchema,
  type ShortResponseValues,
} from "@/lib/demo-learning/forms";
import type { DemoLearner } from "@/types/demo-learning";

import { FieldErrorText, inputClassName, labelClassName } from "./field-parts";

interface VerificationResponseFormProps {
  learner: DemoLearner;
  onSubmit: (response: string) => void;
}

export function VerificationResponseForm({
  learner,
  onSubmit,
}: VerificationResponseFormProps) {
  const form = useForm<ShortResponseValues>({
    resolver: zodResolver(shortResponseSchema),
    defaultValues: { response: "" },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => onSubmit(values.response))}
    >
      <label className="block">
        <span className={labelClassName}>{learner.verification.question}</span>
        <textarea
          className={`${inputClassName} min-h-20`}
          {...form.register("response")}
        />
        <FieldErrorText
          id="verification-error"
          error={form.formState.errors.response}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            form.setValue("response", learner.verification.response)
          }
        >
          Load guided response
        </Button>
        <Button type="submit">Submit verification</Button>
      </div>
    </form>
  );
}
