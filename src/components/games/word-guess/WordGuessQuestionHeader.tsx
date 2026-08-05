import { BookOpen } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { WordGuessQuestion, WordGuessSettings, WordGuessState } from "@/lib/word-guess/types";

/** Question, Scripture context and the calm facts of the round. */
export function WordGuessQuestionHeader({
  question,
  settings,
  state,
}: {
  question: WordGuessQuestion;
  settings: WordGuessSettings;
  state: WordGuessState;
}) {
  const { t } = useI18n();
  const remaining =
    settings.maximumIncorrectAttempts == null
      ? null
      : Math.max(0, settings.maximumIncorrectAttempts - state.incorrectAttempts);

  return (
    <header className="text-center">
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: "var(--walnut)" }}
      >
        {t("wordguess.title")} · {t(`diff.${question.difficulty}`)}
      </p>
      <h2 className="mx-auto mt-2 max-w-xl font-serif text-2xl leading-snug sm:text-3xl">
        {question.question}
      </h2>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
        {question.scriptureReference && (
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            {question.scriptureReference}
          </span>
        )}
        <span aria-live="polite">
          {remaining == null
            ? t("wordguess.attemptsUnlimited")
            : `${t("wordguess.attemptsRemaining")}: ${remaining}`}
        </span>
      </div>
    </header>
  );
}
