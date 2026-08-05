import { BookOpen, CheckCircle2, Eye, RefreshCw } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import type { GameSessionSummary } from "@/lib/games";
import type { WhoAmIQuestion } from "@/lib/who-am-i/types";

// End of a round, rendered from the shared GameSessionSummary — the platform
// contract's first UI consumer. Calm voice, no confetti, and a failed round
// reads as an invitation to try again.

export function WhoAmICompletion({
  question,
  summary,
  onContinue,
  onTryAnother,
  onTryAgain,
  onRevealAnswer,
}: {
  question: WhoAmIQuestion;
  summary: GameSessionSummary;
  onContinue: () => void;
  onTryAnother: () => void;
  onTryAgain: () => void;
  onRevealAnswer: () => void;
}) {
  const { t } = useI18n();

  if (summary.status === "failed") {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border/60 bg-card p-6 text-center">
        <p className="font-serif text-xl">{t("games.failedTitle")}</p>
        <p className="mt-2 text-[13px] text-muted-foreground">{t("games.failedBody")}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button onClick={onTryAgain} variant="outline" className="rounded-full">
            <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {t("games.tryAgain")}
          </Button>
          <Button onClick={onRevealAnswer} variant="outline" className="rounded-full">
            <Eye className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {t("games.revealAnswer")}
          </Button>
        </div>
      </div>
    );
  }

  const completed = summary.status === "completed";
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border/60 bg-card p-6 text-center">
      <span
        className="mx-auto grid h-10 w-10 place-items-center rounded-full"
        style={{ background: "color-mix(in oklab, var(--gold) 14%, transparent)" }}
      >
        <CheckCircle2 className="h-5 w-5" style={{ color: "var(--gold)" }} aria-hidden="true" />
      </span>
      <p className="mt-3 font-serif text-2xl">
        {completed ? t("games.correct") : t("games.revealedTitle")}
      </p>
      <p className="mt-1 font-serif text-lg tracking-[0.08em]" style={{ color: "var(--walnut)" }}>
        {question.answer.toLocaleUpperCase()}
      </p>
      {question.explanation && (
        <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
          {question.explanation}
        </p>
      )}
      {question.scriptureReference && (
        <p
          className="mt-2 inline-flex items-center gap-1.5 text-[12px] uppercase tracking-widest"
          style={{ color: "var(--walnut)" }}
        >
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          {question.scriptureReference}
        </p>
      )}

      <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-border/60 pt-4 text-center">
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {t("games.attemptsUsed")}
          </dt>
          <dd className="mt-1 text-sm font-medium tabular-nums">{summary.attemptsUsed}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {t("whoami.extraClues")}
          </dt>
          <dd className="mt-1 text-sm font-medium tabular-nums">{summary.hintsUsed}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {t("games.difficultyLabel")}
          </dt>
          <dd className="mt-1 text-sm font-medium">{t(`diff.${summary.difficulty}`)}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={onContinue} className="rounded-full">
          {t("ui.continue")}
        </Button>
        <Button onClick={onTryAnother} variant="outline" className="rounded-full">
          {t("games.tryAnother")}
        </Button>
        <Button asChild variant="ghost" className="rounded-full">
          <Link to="/today">{t("games.backToJourney")}</Link>
        </Button>
      </div>
    </div>
  );
}
