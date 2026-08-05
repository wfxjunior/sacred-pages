import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n";
import { isTerminalGameStatus } from "@/lib/games";
import { resolveWhoAmISettings } from "@/lib/who-am-i/config";
import {
  createInitialWhoAmIState,
  isGuessedWhoAmIOption,
  resetWhoAmI,
  revealNextWhoAmIClue,
  revealWhoAmISolution,
  submitWhoAmIGuess,
  whoAmIOptions,
  whoAmISessionSummary,
} from "@/lib/who-am-i/engine";
import type { WhoAmIQuestion } from "@/lib/who-am-i/types";
import { WhoAmIClues } from "./WhoAmIClues";
import { WhoAmICompletion } from "./WhoAmICompletion";
import { WhoAmIFreeAnswer } from "./WhoAmIFreeAnswer";
import { WhoAmIOptions } from "./WhoAmIOptions";

// Orchestrator: owns the round state, renders the domain. All rules live in
// lib/who-am-i; announcements go through one polite aria-live region.
//
// Mount with a changing key so a new question starts a clean round.

export function WhoAmIGame({
  question,
  onContinue,
  onTryAnother,
}: {
  question: WhoAmIQuestion;
  onContinue: () => void;
  onTryAnother: () => void;
}) {
  const { t } = useI18n();
  const settings = useMemo(() => resolveWhoAmISettings(question), [question]);
  const options = useMemo(() => whoAmIOptions(question, settings), [question, settings]);
  const [state, setState] = useState(() => createInitialWhoAmIState(question, settings));
  const [announcement, setAnnouncement] = useState("");
  const [notice, setNotice] = useState(false);
  const [nudge, setNudge] = useState(0);

  const over = isTerminalGameStatus(state.status);
  const remaining =
    settings.maximumIncorrectAttempts == null
      ? null
      : Math.max(0, settings.maximumIncorrectAttempts - state.incorrectAttempts);

  const guess = (value: string) => {
    const { state: next, result } = submitWhoAmIGuess(state, question, value, settings);
    setState(next);
    if (result === "correct") {
      setNotice(false);
      setAnnouncement(`${t("whoami.a11y.correct")} ${question.answer}.`);
    } else if (result === "incorrect") {
      setNotice(true);
      setNudge((n) => n + 1);
      setAnnouncement(t("whoami.a11y.incorrect"));
    }
  };

  return (
    <div
      aria-label={t("games.who_am_i.name")}
      className="mx-auto flex w-full max-w-2xl flex-col gap-5 rounded-2xl border border-border/60 bg-card/60 p-4 sm:gap-6 sm:p-6"
    >
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>

      <header className="text-center">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: "var(--walnut)" }}
        >
          {t("games.who_am_i.name")} · {t(`diff.${question.difficulty}`)}
        </p>
        <p className="mt-2 text-[12px] text-muted-foreground" aria-live="polite">
          {remaining == null
            ? t("games.attemptsUnlimited")
            : `${t("games.attemptsRemaining")}: ${remaining}`}
        </p>
      </header>

      {over ? (
        <WhoAmICompletion
          question={question}
          summary={whoAmISessionSummary(state, question, settings)}
          onContinue={onContinue}
          onTryAnother={onTryAnother}
          onTryAgain={() => {
            setNotice(false);
            setAnnouncement("");
            setState(resetWhoAmI(question));
          }}
          onRevealAnswer={() => setState((s) => revealWhoAmISolution(s))}
        />
      ) : (
        <>
          <WhoAmIClues
            clues={question.clues}
            revealed={state.cluesRevealed}
            canRevealMore={state.cluesRevealed < question.clues.length}
            onRevealNext={() => {
              setAnnouncement(t("whoami.a11y.clueRevealed"));
              setState((s) => revealNextWhoAmIClue(s, question));
            }}
          />

          {settings.inputMode === "options" ? (
            <WhoAmIOptions
              options={options}
              isGuessed={(option) => isGuessedWhoAmIOption(state, option)}
              disabled={over}
              onGuess={guess}
            />
          ) : (
            <WhoAmIFreeAnswer disabled={over} nudge={nudge} onGuess={guess} />
          )}

          {notice && (
            <p className="text-center text-[12px] text-muted-foreground" aria-hidden="true">
              {t("whoami.incorrect")}
            </p>
          )}

          <div className="flex justify-center">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("games.revealAnswer")}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("games.revealConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("games.revealConfirmBody")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("ui.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => setState((s) => revealWhoAmISolution(s))}>
                    {t("games.revealAnswer")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  );
}
