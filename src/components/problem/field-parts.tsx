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
  "mt-2 w-full rounded-md border border-border bg-surface-inset px-3 py-2 text-sm text-text-primary placeholder:text-text-muted";

export const labelClassName = "text-sm font-medium text-text-primary";
