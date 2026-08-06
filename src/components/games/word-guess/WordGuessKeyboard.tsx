import { Check, Delete } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// On-screen keyboard. QWERTY rows for familiarity, with Ñ appended for Spanish
// answers (accented vowels are unnecessary — matching is accent-insensitive).
// Feedback stays gentle: letters from submitted guesses are tinted gold when
// they exist in the answer and dimmed when they do not.

const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"] as const;

export function WordGuessKeyboard({
  onInsert,
  onRemove,
  onSubmit,
  feedback,
  disabled,
  includeEnye,
}: {
  onInsert: (char: string) => void;
  onRemove: () => void;
  onSubmit: () => void;
  /** Normalized letter → whether a submitted guess proved it present/absent. */
  feedback: Record<string, "present" | "absent">;
  disabled: boolean;
  /** Adds Ñ (needed only when the content locale can require it). */
  includeEnye: boolean;
}) {
  const { t } = useI18n();

  const keyClass =
    "inline-flex h-11 min-w-0 flex-1 items-center justify-center rounded-lg border text-[13px] font-medium uppercase transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] disabled:opacity-40 sm:h-12 sm:text-sm";

  const renderLetter = (letter: string) => {
    const mark = feedback[letter];
    return (
      <button
        key={letter}
        type="button"
        disabled={disabled}
        onClick={() => onInsert(letter)}
        aria-label={letter}
        className={keyClass}
        style={{
          borderColor:
            mark === "present"
              ? "color-mix(in oklab, var(--gold) 55%, transparent)"
              : "color-mix(in oklab, var(--border) 80%, transparent)",
          background:
            mark === "present"
              ? "color-mix(in oklab, var(--gold) 12%, transparent)"
              : "var(--card)",
          color:
            mark === "absent"
              ? "color-mix(in oklab, var(--walnut) 55%, transparent)"
              : "var(--ink)",
        }}
      >
        {letter}
      </button>
    );
  };

  return (
    <div
      role="group"
      aria-label={t("wordguess.keyboardLabel")}
      className="-mx-1.5 flex w-auto flex-col gap-1 sm:mx-auto sm:w-full sm:max-w-xl sm:gap-1.5"
    >
      <div className="flex gap-[3px] sm:gap-1.5">{Array.from(ROWS[0]).map(renderLetter)}</div>
      <div className="flex gap-[3px] px-[3%] sm:gap-1.5 sm:px-[4%]">
        {Array.from(ROWS[1]).map(renderLetter)}
        {includeEnye && renderLetter("Ñ")}
      </div>
      <div className="flex gap-[3px] sm:gap-1.5">
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          aria-label={t("wordguess.erase")}
          title={t("wordguess.erase")}
          className={`${keyClass} max-w-16 border-border bg-card text-muted-foreground`}
        >
          <Delete className="h-4 w-4" />
        </button>
        {Array.from(ROWS[2]).map(renderLetter)}
        <button
          type="button"
          disabled={disabled}
          onClick={onSubmit}
          aria-label={t("wordguess.submit")}
          title={t("wordguess.submit")}
          className={`${keyClass} max-w-16`}
          style={{ background: "var(--ink)", color: "var(--ivory)", borderColor: "var(--ink)" }}
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
