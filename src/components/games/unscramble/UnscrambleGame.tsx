import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, CheckCircle2, Delete, Eye, Lightbulb, RefreshCw, Check } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { isTerminalGameStatus, type GameDifficulty } from "@/lib/games";
import { celebrateCompletion } from "@/lib/confetti";
import {
  applyUnscrambleHint,
  ghostLetterFor,
  clearUnscramble,
  createInitialUnscrambleState,
  mapUnscrambleKey,
  pickUnscrambleByChar,
  pickUnscrambleLetter,
  removeLastUnscrambleLetter,
  resetUnscramble,
  resolveUnscrambleSettings,
  revealUnscramble,
  submitUnscramble,
} from "@/lib/unscramble/engine";
import type { UnscrambleRound } from "@/lib/unscramble/types";

// Orchestrator for one Unscramble round. Rules live in lib/unscramble; this
// component renders tiles, wires the keyboards and narrates politely.
// Mount with a changing key so a new round starts clean.

const pillClass =
  "inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] disabled:pointer-events-none disabled:opacity-40";

export function UnscrambleGame({
  round,
  difficulty,
  scriptureReference,
  onContinue,
  onTryAnother,
}: {
  round: UnscrambleRound;
  difficulty: GameDifficulty;
  /** Where today's words come from — shown as calm context, when known. */
  scriptureReference?: string;
  onContinue: () => void;
  onTryAnother: () => void;
}) {
  const { t } = useI18n();
  const settings = useMemo(() => resolveUnscrambleSettings(difficulty), [difficulty]);
  const [state, setState] = useState(() => createInitialUnscrambleState(round));
  const [announcement, setAnnouncement] = useState("");
  const [notice, setNotice] = useState<"incorrect" | "incomplete" | null>(null);
  const [nudge, setNudge] = useState(0);

  const over = isTerminalGameStatus(state.status);
  const remaining =
    settings.maximumIncorrectAttempts == null
      ? null
      : Math.max(0, settings.maximumIncorrectAttempts - state.incorrectAttempts);

  const submit = () => {
    const { state: next, result } = submitUnscramble(state, round, settings);
    setState(next);
    if (result === "correct") {
      setNotice(null);
      celebrateCompletion();
      setAnnouncement(`${t("unscr.a11y.correct")} ${round.word}.`);
    } else if (result === "incorrect") {
      setNotice("incorrect");
      setNudge((n) => n + 1);
      setAnnouncement(t("unscr.a11y.incorrect"));
    } else if (result === "incomplete") {
      setNotice("incomplete");
      setAnnouncement(t("unscr.incomplete"));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === "Enter" && event.target !== event.currentTarget) return;
    const action = mapUnscrambleKey(event.key);
    if (!action) return;
    event.preventDefault();
    setNotice(null);
    if (action.type === "char") setState((s) => pickUnscrambleByChar(s, round, action.char));
    else if (action.type === "remove") setState((s) => removeLastUnscrambleLetter(s));
    else submit();
  };

  const spokenAnswer = state.picked.map((i) => round.letters[i]).join(", ");

  if (over) {
    const completed = state.status === "completed";
    const failed = state.status === "failed";
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border/60 bg-card p-6 text-center">
        {failed ? (
          <>
            <p className="font-serif text-xl">{t("games.failedTitle")}</p>
            <p className="mt-2 text-[13px] text-muted-foreground">{t("games.failedBody")}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button
                onClick={() => {
                  setNotice(null);
                  setAnnouncement("");
                  setState(resetUnscramble(round));
                }}
                variant="outline"
                className="rounded-full"
              >
                <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
                {t("games.tryAgain")}
              </Button>
              <Button
                onClick={() => setState((s) => revealUnscramble(s, round))}
                variant="outline"
                className="rounded-full"
              >
                <Eye className="mr-1.5 h-4 w-4" aria-hidden="true" />
                {t("games.revealAnswer")}
              </Button>
            </div>
          </>
        ) : (
          <>
            <span
              className="mx-auto grid h-10 w-10 place-items-center rounded-full"
              style={{ background: "color-mix(in oklab, var(--gold) 14%, transparent)" }}
            >
              <CheckCircle2
                className="h-5 w-5"
                style={{ color: "var(--gold)" }}
                aria-hidden="true"
              />
            </span>
            <p className="mt-3 font-serif text-2xl">
              {completed ? t("games.correct") : t("games.revealedTitle")}
            </p>
            <p
              className="mt-1 font-serif text-lg tracking-[0.08em]"
              style={{ color: "var(--walnut)" }}
            >
              {round.word}
            </p>
            {scriptureReference && (
              <p
                className="mt-2 inline-flex items-center gap-1.5 text-[12px] uppercase tracking-widest"
                style={{ color: "var(--walnut)" }}
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                {scriptureReference}
              </p>
            )}
            <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-border/60 pt-4 text-center">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {t("games.attemptsUsed")}
                </dt>
                <dd className="mt-1 text-sm font-medium tabular-nums">
                  {state.incorrectAttempts + (completed ? 1 : 0)}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {t("unscr.hintsUsed")}
                </dt>
                <dd className="mt-1 text-sm font-medium tabular-nums">{state.hintsUsed}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {t("games.difficultyLabel")}
                </dt>
                <dd className="mt-1 text-sm font-medium">{t(`diff.${difficulty}`)}</dd>
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
          </>
        )}
      </div>
    );
  }

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={t("games.unscramble.name")}
      className="mx-auto flex w-full max-w-2xl flex-col gap-5 rounded-2xl border border-border/60 bg-card/60 p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] sm:gap-6 sm:p-6"
    >
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>

      <header className="text-center">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: "var(--walnut)" }}
        >
          {t("games.unscramble.name")} · {t(`diff.${difficulty}`)}
        </p>
        <h2 className="mt-2 font-serif text-2xl leading-snug sm:text-3xl">{t("unscr.prompt")}</h2>
        {scriptureReference && (
          <p
            className="mt-2 inline-flex items-center gap-1.5 text-[12px] uppercase tracking-widest"
            style={{ color: "var(--walnut)" }}
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            {scriptureReference}
          </p>
        )}
        <p className="mt-2 text-[12px] text-muted-foreground" aria-live="polite">
          {round.word.length} {t("unscr.lettersLabel")} ·{" "}
          {remaining == null
            ? t("games.attemptsUnlimited")
            : `${t("games.attemptsRemaining")}: ${remaining}`}
        </p>
      </header>

      <p className="sr-only">
        {t("unscr.a11y.currentAnswer")}: {spokenAnswer || t("wordguess.a11y.blank")}
      </p>

      <div
        key={nudge}
        aria-hidden="true"
        className={`flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 ${
          nudge > 0 ? "motion-safe:animate-[wg-nudge_0.35s_ease-in-out]" : ""
        }`}
      >
        {Array.from(round.letters, (_, slot) => {
          const pickedIndex = state.picked[slot];
          const filled = pickedIndex !== undefined;
          const ghost = filled ? null : ghostLetterFor(round, settings, slot);
          return (
            <span
              key={slot}
              className="grid h-10 w-9 place-items-center rounded-lg border bg-card font-serif text-lg uppercase sm:h-12 sm:w-11 sm:text-xl"
              style={{
                borderColor:
                  slot === state.picked.length
                    ? "color-mix(in oklab, var(--gold) 70%, transparent)"
                    : "color-mix(in oklab, var(--border) 80%, transparent)",
                boxShadow: "0 1px 2px rgba(43,41,38,0.04)",
                color: filled ? "var(--ink)" : "var(--walnut)",
              }}
            >
              {filled ? (
                round.letters[pickedIndex]
              ) : ghost ? (
                <span aria-hidden className="opacity-40">
                  {ghost}
                </span>
              ) : (
                <span aria-hidden className="mb-1 inline-block h-px w-4 bg-current opacity-40" />
              )}
            </span>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {round.letters.map((letter, index) => {
          const used = state.picked.includes(index);
          return (
            <button
              key={index}
              type="button"
              disabled={used}
              onClick={() => {
                setNotice(null);
                setState((s) => pickUnscrambleLetter(s, round, index));
              }}
              aria-label={letter}
              className={`grid h-11 w-10 place-items-center rounded-xl border font-serif text-lg uppercase transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] sm:h-12 sm:w-11 ${
                used
                  ? "border-border/40 text-muted-foreground/40"
                  : "border-border bg-card hover:border-[color:var(--gold)]"
              }`}
              style={{ boxShadow: used ? undefined : "0 1px 2px rgba(43,41,38,0.04)" }}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {notice && (
        <p className="text-center text-[12px] text-muted-foreground" aria-hidden="true">
          {notice === "incorrect" ? t("unscr.incorrect") : t("unscr.incomplete")}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={submit} className="rounded-full">
          <Check className="mr-1.5 h-4 w-4" aria-hidden="true" />
          {t("unscr.submit")}
        </Button>
        <button
          type="button"
          onClick={() => setState((s) => removeLastUnscrambleLetter(s))}
          className={pillClass}
        >
          <Delete className="h-3.5 w-3.5" aria-hidden="true" />
          {t("unscr.erase")}
        </button>
        <button
          type="button"
          onClick={() => setState((s) => clearUnscramble(s))}
          className={pillClass}
        >
          {t("ui.clear")}
        </button>
        {settings.hintAvailable && (
          <button
            type="button"
            onClick={() => {
              setAnnouncement(t("unscr.a11y.hint"));
              setState((s) => applyUnscrambleHint(s, round));
            }}
            className={pillClass}
          >
            <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
            {t("unscr.hint")}
          </button>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button type="button" className={pillClass}>
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
              <AlertDialogAction onClick={() => setState((s) => revealUnscramble(s, round))}>
                {t("games.revealAnswer")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
