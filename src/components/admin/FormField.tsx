import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

// Accessible field wrapper: every control gets a real <label>, hints and errors
// are wired through aria-describedby, and errors are announced rather than
// signalled by color alone.

type ControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  required?: boolean;
};

export function FormField({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: ControlProps) => ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && (
          <span aria-hidden className="ml-1" style={{ color: "#B4542F" }}>
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>

      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}

      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        required,
      })}

      {error && (
        <p id={errorId} className="flex items-center gap-1.5 text-xs" style={{ color: "#B4542F" }}>
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Error summary shown at the top of a form. Focusable and announced, so
 * keyboard and screen-reader users learn what failed without hunting.
 */
export function FormErrorSummary({ errors }: { errors: Record<string, string> }) {
  const entries = Object.entries(errors);
  if (entries.length === 0) return null;

  return (
    <div
      role="alert"
      tabIndex={-1}
      className="rounded-xl border p-4"
      style={{
        borderColor: "color-mix(in oklab, #B4542F 40%, transparent)",
        background: "color-mix(in oklab, #B4542F 6%, transparent)",
      }}
    >
      <p className="text-sm font-medium" style={{ color: "#B4542F" }}>
        {entries.length === 1
          ? "There is 1 problem to fix"
          : `There are ${entries.length} problems to fix`}
      </p>
      <ul className="mt-2 space-y-1 text-xs">
        {entries.map(([field, message]) => (
          <li key={field}>
            <a href={`#${field}`} className="underline underline-offset-2">
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
