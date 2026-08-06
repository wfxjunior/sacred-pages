import { useCallback, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { resolveWordGuessSettings } from "@/lib/word-guess/config";
import {
  answerCells,
  applyWordGuessHint,
  clearEnteredAnswer,
  createInitialWordGuessState,
  insertCharacter,
  mapWordGuessKey,
  removeCharacter,
  resetWordGuess,
  revealWordGuessLetter,
  revealWordGuessSolution,
  validateWordGuessAnswer,
  wordGuessKeyboardFeedback,
} from "@/lib/word-guess/engine";
import { playWordGuessSound } from "@/lib/word-guess/sound";
import type { WordGuessQuestion } from "@/lib/word-guess/types";
import { WordGuessAnswerCells } from "./WordGuessAnswerCells";
import { WordGuessCompletion } from "./WordGuessCompletion";
import { WordGuessControls } from "./WordGuessControls";
import { WordGuessHint } from "./WordGuessHint";
import { WordGuessKeyboard } from "./WordGuessKeyboard";
import { WordGuessQuestionHeader } from "./WordGuessQuestionHeader";

// Orchestrator: owns the round state and the physical-keyboard wiring, renders
// the domain's answer. All rules live in lib/word-guess — this component only
// dispatches pure transitions and narrates them for assistive tech.
//
// Mount with key={question.id} so a new question starts a clean round.

export function WordGuessGame({
  question,
  onContinue,
  onTryAnother,
}: {
  question: WordGuessQuestion;
  onContinue: () => void;
  onTryAnother: () => void;
}) {
  const { t, locale } = useI18n();
  const settings = useMemo(() => resolveWordGuessSettings(question), [question]);
  const cells = useMemo(() => answerCells(question), [question]);
  const [state, setState] = useState(() => createInitialWordGuessState(question, settings));
  const [announcement, setAnnouncement] = useState("");
  const [notice, setNotice] = useState<"incorrect" | "incomplete" | null>(null);
  const [nudge, setNudge] = useState(0);
  const boardRef = useRef<HTMLDivElement | null>(null);

  const over =
    state.status === "completed" || state.status === "revealed" || state.status === "failed";

  const submit = useCallback(() => {
    const { state: next, result } = validateWordGuessAnswer(state, question, settings);
    setState(next);
    if (result === "exact_match") {
      playWordGuessSound("correct");
      setNotice(null);
      setAnnouncement(`${t("wordguess.a11y.correctAnnouncement")} ${question.answer}.`);
    } else if (result === "incorrect") {
      playWordGuessSound("incorrect");
      setNotice("incorrect");
      setNudge((n) => n + 1);
      setAnnouncement(t("wordguess.a11y.incorrectAnnouncement"));
    } else if (result === "incomplete") {
      setNotice("incomplete");
      setAnnouncement(t("wordguess.incomplete"));
    }
  }, [state, question, settings, t]);

  const insert = useCallback(
    (char: string) => {
      setNotice(null);
      setState((current) => insertCharacter(current, question, char));
    },
    [question],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Shortcuts pass through untouched; the game only listens when focus is
    // inside its own container, never globally. Enter on a focused button must
    // keep activating that button rather than submitting the answer.
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === "Enter" && event.target !== event.currentTarget) return;
    const action = mapWordGuessKey(event.key);
    if (!action) return;
    event.preventDefault();
    if (action.type === "insert") insert(action.char);
    else if (action.type === "remove") setState((s) => removeCharacter(s));
    else submit();
  };

  const filled = state.entered.filter((c) => c != null).length;
  const hidden = cells.filter(
    (c) => c.kind === "letter" && !state.visibleIndexes.includes(c.index),
  ).length;

  return (
    <div
      ref={boardRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={t("wordguess.title")}
      className="mx-auto flex w-full max-w-2xl flex-col gap-5 rounded-2xl border border-border/60 bg-card/60 p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] sm:gap-6 sm:p-6"
    >
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>

      <WordGuessQuestionHeader question={question} settings={settings} state={state} />

      {over ? (
        <WordGuessCompletion
          question={question}
          state={state}
          onContinue={onContinue}
          onTryAnother={onTryAnother}
          onTryAgain={() => {
            setNotice(null);
            setAnnouncement("");
            setState(resetWordGuess(question));
          }}
          onRevealAnswer={() => setState((s) => revealWordGuessSolution(s, question))}
        />
      ) : (
        <>
          <WordGuessAnswerCells cells={cells} state={state} nudge={nudge} />

          <p
            className="text-center text-[12px] tabular-nums text-muted-foreground"
            aria-hidden="true"
          >
            {filled}/{hidden} {t("wordguess.letters")}
            {notice === "incorrect" && ` · ${t("wordguess.incorrect")}`}
            {notice === "incomplete" && ` · ${t("wordguess.incomplete")}`}
          </p>

          {question.hint && <WordGuessHint hint={question.hint} shown={state.hintUsed} />}

          <WordGuessKeyboard
            onInsert={insert}
            onRemove={() => setState((s) => removeCharacter(s))}
            onSubmit={submit}
            feedback={wordGuessKeyboardFeedback(state, question)}
            disabled={over}
            includeEnye={locale === "es"}
          />

          <WordGuessControls
            state={state}
            settings={settings}
            onHint={() => {
              setAnnouncement(t("wordguess.a11y.hintShown"));
              setState((s) => applyWordGuessHint(s));
            }}
            onRevealLetter={() => {
              playWordGuessSound("letter_revealed");
              setAnnouncement(t("wordguess.a11y.letterRevealed"));
              setState((s) => revealWordGuessLetter(s, question));
            }}
            onRevealAnswer={() => setState((s) => revealWordGuessSolution(s, question))}
            onClear={() => {
              setNotice(null);
              setState((s) => clearEnteredAnswer(s));
            }}
          />
        </>
      )}
    </div>
  );
}
