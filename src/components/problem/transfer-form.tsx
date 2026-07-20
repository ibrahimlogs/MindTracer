"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { demoTransfer } from "@/data/demo/demo-transfer";
import { transferSchema, type RetryValues } from "@/lib/demo-learning/forms";

import { FieldErrorText, inputClassName, labelClassName } from "./field-parts";

interface TransferFormProps {
  onSubmit: (values: RetryValues) => void;
}

export function TransferForm({ onSubmit }: TransferFormProps) {
  const form = useForm<RetryValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: { answer: "", explanation: "", confidence: "Confident" },
  });

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <label className="block">
        <span className={labelClassName}>Transfer answer</span>
        <input className={inputClassName} {...form.register("answer")} />
        <FieldErrorText
          id="transfer-answer-error"
          error={form.formState.errors.answer}
        />
      </label>
      <label className="block">
        <span className={labelClassName}>Transfer explanation</span>
        <textarea
          className={`${inputClassName} min-h-24`}
          {...form.register("explanation")}
        />
        <FieldErrorText
          id="transfer-explanation-error"
          error={form.formState.errors.explanation}
        />
      </label>
      <label className="block">
        <span className={labelClassName}>Transfer confidence</span>
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
              answer: demoTransfer.correctAnswer,
              explanation: demoTransfer.explanation,
              confidence: "Confident",
            })
          }
        >
          Load transfer response
        </Button>
        <Button type="submit">Submit transfer</Button>
      </div>
    </form>
  );
}
