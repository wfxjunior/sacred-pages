import { CheckCircle2, Eye, RefreshCw } from "lucide-react";
import { gamePrimaryClass, gameSecondaryClass } from "@/components/games/controlStyles";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { GameDevotionalMoment } from "@/components/games/GameDevotionalMoment";
import type { WordGuessQuestion, WordGuessState } from "@/lib/word-guess/types";

// The end of a round, in Lumena's completion voice: the answer, one sentence
// of context, the reference, and the quiet facts. No confetti storm, no
// failure imagery — a failed round reads as an invitation to try again.

export function WordGuessCompletion({
  question,
  state,
  onContinue,
  onTryAnother,
  onTryAgain,
  onRevealAnswer,
}: {
  question: WordGuessQuestion;
  state: WordGuessState;
  /** Advances to the next question in order. */
  onContinue: () => void;
  /** Jumps to a different question further along the pool. */
  onTryAnother: () => void;
  /** Restarts the same question (failed rounds only). */
  onTryAgain: () => void;
  /** Ends a failed round by showing the answer. */
  onRevealAnswer: () => void;
}) {
  const { t } = useI18n();

  if (state.status === "failed") {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border/60 bg-card p-6 text-center">
        <p className="font-serif text-xl">{t("wordguess.failedTitle")}</p>
        <p className="mt-2 text-[13px] text-muted-foreground">{t("wordguess.failedBody")}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button onClick={onTryAgain} variant="outline" className={gameSecondaryClass}>
            <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {t("wordguess.tryAgain")}
          </Button>
          <Button onClick={onRevealAnswer} variant="outline" className={gameSecondaryClass}>
            <Eye className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {t("wordguess.revealAnswer")}
          </Button>
        </div>
      </div>
    );
  }

  const completed = state.status === "completed";
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border/60 bg-card p-6 text-center">
      <span
        className="mx-auto grid h-10 w-10 place-items-center rounded-full"
        style={{ background: "color-mix(in oklab, var(--gold) 14%, transparent)" }}
      >
        <CheckCircle2 className="h-5 w-5" style={{ color: "var(--gold)" }} aria-hidden="true" />
      </span>
      <p className="mt-3 font-serif text-2xl">
        {completed ? t("wordguess.correct") : t("wordguess.revealedTitle")}
      </p>
      <p className="mt-1 font-serif text-lg tracking-[0.08em]" style={{ color: "var(--walnut)" }}>
        {question.answer.toLocaleUpperCase()}
      </p>
      <GameDevotionalMoment
        reference={question.scriptureReference}
        explanation={question.explanation}
        prayer={question.prayer}
      />

      <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-border/60 pt-4 text-center">
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {t("wordguess.attemptsUsed")}
          </dt>
          <dd className="mt-1 text-sm font-medium tabular-nums">
            {state.incorrectAttempts + (completed ? 1 : 0)}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {t("wordguess.hint")}
          </dt>
          <dd className="mt-1 text-sm font-medium">{state.hintUsed ? t("wordguess.used") : "—"}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {t("wordguess.difficultyLabel")}
          </dt>
          <dd className="mt-1 text-sm font-medium">{t(`diff.${question.difficulty}`)}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={onContinue} className={gamePrimaryClass}>
          {t("ui.continue")}
        </Button>
        <Button onClick={onTryAnother} variant="outline" className={gameSecondaryClass}>
          {t("wordguess.tryAnother")}
        </Button>
        <Button asChild variant="ghost" className={gameSecondaryClass}>
          <Link to="/today">{t("wordguess.backToJourney")}</Link>
        </Button>
      </div>
    </div>
  );
}
