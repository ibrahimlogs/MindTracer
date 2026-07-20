import type { FieldError } from "react-hook-form";

interface FieldErrorTextProps {
  error?: FieldError;
  id: string;
}

export function FieldErrorText({ error, id }: FieldErrorTextProps) {
  if (!error?.message) return null;

  return (
    <p id={id} className="mt-2 text-sm text-error" role="alert">
      {error.message}
    </p>
  );
}

export const inputClassName =
  "mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-base text-text-primary placeholder:text-text-muted focus:border-reasoning focus:outline-none focus:ring-4 focus:ring-reasoning/15";

export const labelClassName = "text-base font-semibold text-text-primary";
