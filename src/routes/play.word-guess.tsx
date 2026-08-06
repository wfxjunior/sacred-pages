import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { WordGuessGame } from "@/components/games/word-guess/WordGuessGame";
import { useI18n } from "@/lib/i18n";
import { GameDifficultyPicker } from "@/components/games/GameDifficultyPicker";
import { useGamePosition } from "@/lib/games/useGamePosition";
import { wordGuessQuestionsForLocale } from "@/lib/word-guess/questions";
import type { WordGuessDifficulty } from "@/lib/word-guess/types";

// Word Guess lives under /play — a sibling experience to the Today word
// search, deliberately absent from primary navigation while the mode matures.
// The word-search experience is untouched by this route.

export const Route = createFileRoute("/play/word-guess")({
  head: () => ({
    meta: [
      { title: "Word Guess — Lumena" },
      {
        name: "description",
        content:
          "A quiet Scripture guessing game: a question, a hidden answer, one letter at a time.",
      },
    ],
  }),
  component: WordGuessPage,
});

const DIFFICULTIES: WordGuessDifficulty[] = ["gentle", "balanced", "challenging", "expert"];

function WordGuessPage() {
  const { t, locale } = useI18n();
  // Difficulty and place in the pool persist per device, so returning to
  // the journey and coming back resumes exactly where the reader stood.
  const { difficulty, chooseDifficulty, cursor, setCursor } = useGamePosition("word_guess");

  const pool = useMemo(() => {
    const all = wordGuessQuestionsForLocale(locale);
    const filtered = all.filter((q) => q.difficulty === difficulty);
    return filtered.length > 0 ? filtered : all;
  }, [locale, difficulty]);

  const question = pool[cursor % pool.length]!;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl px-1 py-6 sm:py-10">
        <header className="mb-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--walnut)" }}>
            {t("wordguess.eyebrow")}
          </p>
          <h1 className="mt-1 font-serif text-3xl leading-tight sm:text-4xl">
            {t("wordguess.title")}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-[14px] text-muted-foreground">
            {t("wordguess.subtitle")}
          </p>

          <GameDifficultyPicker
            value={difficulty}
            options={DIFFICULTIES}
            onChange={chooseDifficulty}
          />

          <p className="mt-3 text-[12px] tabular-nums text-muted-foreground">
            {(cursor % pool.length) + 1} {t("ui.of")} {pool.length}
          </p>
        </header>

        <WordGuessGame
          key={`${question.id}:${cursor}`}
          question={question}
          onContinue={() => setCursor((c) => c + 1)}
          onTryAnother={() => setCursor((c) => c + Math.max(1, Math.floor(pool.length / 2)))}
        />
      </div>
    </AppShell>
  );
}
