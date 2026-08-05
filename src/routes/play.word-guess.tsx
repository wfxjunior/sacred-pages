import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { WordGuessGame } from "@/components/games/word-guess/WordGuessGame";
import { useI18n } from "@/lib/i18n";
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
  const [difficulty, setDifficulty] = useState<WordGuessDifficulty>("gentle");
  const [cursor, setCursor] = useState(0);

  const pool = useMemo(() => {
    const all = wordGuessQuestionsForLocale(locale);
    const filtered = all.filter((q) => q.difficulty === difficulty);
    return filtered.length > 0 ? filtered : all;
  }, [locale, difficulty]);

  const question = pool[cursor % pool.length]!;

  const chooseDifficulty = (next: WordGuessDifficulty) => {
    setDifficulty(next);
    setCursor(0);
  };

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

          <div
            className="mx-auto mt-5 inline-flex flex-wrap items-center justify-center gap-1 rounded-full border border-border bg-card p-1"
            role="radiogroup"
            aria-label={t("wordguess.difficultyLabel")}
          >
            {DIFFICULTIES.map((level) => {
              const active = level === difficulty;
              return (
                <button
                  key={level}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => chooseDifficulty(level)}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={{
                    background: active
                      ? "color-mix(in oklab, var(--gold) 14%, transparent)"
                      : undefined,
                  }}
                >
                  {t(`diff.${level}`)}
                </button>
              );
            })}
          </div>

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
