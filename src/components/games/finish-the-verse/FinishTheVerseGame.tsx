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
import {
  applyFinishVerseHint,
  clearAllPlacements,
  clearSlot,
  createInitialFinishVerseState,
  mapFinishVerseKey,
  placeBankEntry,
  placeByChar,
  removeLastPlacement,
  resetFinishVerse,
  resolveFinishVerseSettings,
  revealFinishVerse,
  submitFinishVerse,
} from "@/lib/finish-the-verse/engine";
import type { FinishVerseRound } from "@/lib/finish-the-verse/types";

// The verse stays a verse: one flowing serif paragraph with the blanks inline,
// like a devotional page with spaces for the reader's memory — never a form.
// Rules live in lib/finish-the-verse; this component renders and narrates.
// Mount with a changing key so a new round starts clean.

const pillClass =
  "inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] disabled:pointer-events-none disabled:opacity-40";

export function FinishTheVerseGame({
  round,
  difficulty,
  onContinue,
  onTryAnother,
}: {
  round: FinishVerseRound;
  difficulty: GameDifficulty;
  onContinue: () => void;
  onTryAnother: () => void;
}) {
  const { t } = useI18n();
  const settings = useMemo(() => resolveFinishVerseSettings(difficulty), [difficulty]);
  const [state, setState] = useState(() => createInitialFinishVerseState(round));
  const [announcement, setAnnouncement] = useState("");
  const [notice, setNotice] = useState<"incorrect" | "incomplete" | null>(null);
  const [nudge, setNudge] = useState(0);

  const over = isTerminalGameStatus(state.status);
  const remaining =
    settings.maximumIncorrectAttempts == null
      ? null
      : Math.max(0, settings.maximumIncorrectAttempts - state.incorrectAttempts);

  const slotOfToken = useMemo(() => {
    const map = new Map<number, number>();
    round.hiddenSlots.forEach((tokenIndex, slotIndex) => map.set(tokenIndex, slotIndex));
    return map;
  }, [round.hiddenSlots]);

  const bankById = useMemo(
    () => new Map(round.bank.map((entry) => [entry.id, entry])),
    [round.bank],
  );
  const nextEmptySlot = state.placed.indexOf(null);

  const submit = () => {
    const { state: next, result } = submitFinishVerse(state, round, settings);
    setState(next);
    if (result === "correct") {
      setNotice(null);
      setAnnouncement(t("verse.a11y.correct"));
    } else if (result === "incorrect") {
      setNotice("incorrect");
      setNudge((n) => n + 1);
      setAnnouncement(t("verse.a11y.incorrect"));
    } else if (result === "incomplete") {
      setNotice("incomplete");
      setAnnouncement(t("verse.incomplete"));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === "Enter" && event.target !== event.currentTarget) return;
    const action = mapFinishVerseKey(event.key);
    if (!action) return;
    event.preventDefault();
    setNotice(null);
    if (action.type === "char") setState((s) => placeByChar(s, round, action.char));
    else if (action.type === "remove") setState((s) => removeLastPlacement(s));
    else submit();
  };

  if (over) {
    const completed = state.status === "completed";
    const failed = state.status === "failed";
    if (failed) {
      return (
        <div className="mx-auto max-w-md rounded-2xl border border-border/60 bg-card p-6 text-center">
          <p className="font-serif text-xl">{t("games.failedTitle")}</p>
          <p className="mt-2 text-[13px] text-muted-foreground">{t("games.failedBody")}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button
              onClick={() => {
                setNotice(null);
                setAnnouncement("");
                setState(resetFinishVerse(round));
              }}
              variant="outline"
              className="rounded-full"
            >
              <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {t("games.tryAgain")}
            </Button>
            <Button
              onClick={() => setState((s) => revealFinishVerse(s, round))}
              variant="outline"
              className="rounded-full"
            >
              <Eye className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {t("games.revealAnswer")}
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border/60 bg-card p-6 text-center">
        <span
          className="mx-auto grid h-10 w-10 place-items-center rounded-full"
          style={{ background: "color-mix(in oklab, var(--gold) 14%, transparent)" }}
        >
          <CheckCircle2 className="h-5 w-5" style={{ color: "var(--gold)" }} aria-hidden="true" />
        </span>
        <p className="mt-3 font-serif text-2xl">
          {completed ? t("games.correct") : t("games.revealedTitle")}
        </p>
        <blockquote
          className="mt-5 border-l-2 pl-5 text-left font-serif text-lg italic leading-relaxed"
          style={{ borderColor: "var(--gold)" }}
        >
          "{round.tokens.map((token) => token.text).join(" ")}"
          <footer
            className="mt-2 inline-flex items-center gap-1.5 text-xs not-italic uppercase tracking-widest"
            style={{ color: "var(--walnut)" }}
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            {round.reference}
          </footer>
        </blockquote>
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
              {t("verse.wordsHelped")}
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
      </div>
    );
  }

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={t("games.finish_the_verse.name")}
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
          {t("games.finish_the_verse.name")} · {t(`diff.${difficulty}`)}
        </p>
        <p
          className="mt-2 inline-flex items-center gap-1.5 text-[12px] uppercase tracking-widest"
          style={{ color: "var(--walnut)" }}
        >
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          {round.reference}
        </p>
        <p className="mt-2 text-[12px] text-muted-foreground" aria-live="polite">
          {remaining == null
            ? t("games.attemptsUnlimited")
            : `${t("games.attemptsRemaining")}: ${remaining}`}
        </p>
      </header>

      {/* The verse as a reading page: blanks live inside the flowing text. */}
      <div
        key={nudge}
        className={`rounded-xl border border-border/60 bg-card p-5 sm:p-6 ${
          nudge > 0 ? "motion-safe:animate-[wg-nudge_0.35s_ease-in-out]" : ""
        }`}
        style={{ boxShadow: "0 1px 2px rgba(43,41,38,0.04)" }}
      >
        <p className="font-serif text-lg leading-[2.1] sm:text-xl sm:leading-[2.2]">
          {round.tokens.map((token, tokenIndex) => {
            const slotIndex = slotOfToken.get(tokenIndex);
            if (slotIndex === undefined) {
              return <span key={tokenIndex}>{token.text} </span>;
            }
            const placedId = state.placed[slotIndex];
            const entry = placedId != null ? bankById.get(placedId) : undefined;
            const isNext = slotIndex === nextEmptySlot;
            const ghost = settings.showInitialLetter ? token.matchable![0] : null;
            return (
              <span key={tokenIndex}>
                <button
                  type="button"
                  onClick={() => {
                    setNotice(null);
                    setState((s) => clearSlot(s, slotIndex));
                  }}
                  disabled={entry == null}
                  aria-label={
                    entry ? `${t("verse.a11y.placed")} ${entry.word}` : t("verse.a11y.blank")
                  }
                  className="mx-0.5 inline-flex min-w-14 items-center justify-center rounded-lg border px-2 py-0.5 align-baseline font-serif uppercase tracking-[0.04em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                  style={{
                    borderColor: isNext
                      ? "color-mix(in oklab, var(--gold) 70%, transparent)"
                      : "color-mix(in oklab, var(--border) 80%, transparent)",
                    background: entry
                      ? "color-mix(in oklab, var(--gold) 10%, transparent)"
                      : "var(--surface-2)",
                    color: entry ? "var(--ink)" : "var(--walnut)",
                  }}
                >
                  {entry ? (
                    entry.word
                  ) : ghost ? (
                    <span className="opacity-50">{ghost}…</span>
                  ) : (
                    <span aria-hidden className="inline-block h-px w-8 bg-current opacity-40" />
                  )}
                </button>{" "}
              </span>
            );
          })}
        </p>
      </div>

      <div
        role="group"
        aria-label={t("verse.bankLabel")}
        className="flex flex-wrap items-center justify-center gap-2"
      >
        {round.bank.map((entry) => {
          const used = state.placed.includes(entry.id);
          return (
            <button
              key={entry.id}
              type="button"
              disabled={used}
              onClick={() => {
                setNotice(null);
                setState((s) => placeBankEntry(s, round, entry.id));
              }}
              className={`inline-flex min-h-10 items-center rounded-full border px-3.5 py-1.5 font-serif text-[15px] uppercase tracking-[0.06em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] ${
                used
                  ? "border-border/40 text-muted-foreground/40"
                  : "border-border bg-card hover:border-[color:var(--gold)]"
              }`}
              style={{ boxShadow: used ? undefined : "0 1px 2px rgba(43,41,38,0.04)" }}
            >
              {entry.word}
            </button>
          );
        })}
      </div>

      {notice && (
        <p className="text-center text-[12px] text-muted-foreground" aria-hidden="true">
          {notice === "incorrect" ? t("verse.incorrect") : t("verse.incomplete")}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={submit} className="rounded-full">
          <Check className="mr-1.5 h-4 w-4" aria-hidden="true" />
          {t("verse.submit")}
        </Button>
        <button
          type="button"
          onClick={() => setState((s) => removeLastPlacement(s))}
          className={pillClass}
        >
          <Delete className="h-3.5 w-3.5" aria-hidden="true" />
          {t("verse.erase")}
        </button>
        <button
          type="button"
          onClick={() => setState((s) => clearAllPlacements(s))}
          className={pillClass}
        >
          {t("ui.clear")}
        </button>
        {settings.hintAvailable && (
          <button
            type="button"
            onClick={() => {
              setAnnouncement(t("verse.a11y.hint"));
              setState((s) => applyFinishVerseHint(s, round));
            }}
            className={pillClass}
          >
            <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
            {t("verse.hint")}
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
              <AlertDialogAction onClick={() => setState((s) => revealFinishVerse(s, round))}>
                {t("games.revealAnswer")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
