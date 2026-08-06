import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { WhoAmIGame } from "@/components/games/who-am-i/WhoAmIGame";
import { useI18n } from "@/lib/i18n";
import { useGamePosition } from "@/lib/games/useGamePosition";
import { GAME_REGISTRY, type GameDifficulty } from "@/lib/games";
import { whoAmIQuestionsForLocale } from "@/lib/who-am-i/questions";

// Who Am I lives under /play beside Word Guess, absent from primary
// navigation while the mode matures. The header renders from the shared game
// registry — the first surface to do so.

const GAME = GAME_REGISTRY.who_am_i;

export const Route = createFileRoute("/play/who-am-i")({
  head: () => ({
    meta: [
      { title: "Who Am I — Lumena" },
      {
        name: "description",
        content: "Progressive clues about a person from Scripture. Read, ponder, and name them.",
      },
    ],
  }),
  component: WhoAmIPage,
});

function WhoAmIPage() {
  const { t, locale } = useI18n();
  // Difficulty and place in the pool persist per device, so returning to
  // the journey and coming back resumes exactly where the reader stood.
  const { difficulty, chooseDifficulty, cursor, setCursor } = useGamePosition("who_am_i");

  const pool = useMemo(() => {
    const all = whoAmIQuestionsForLocale(locale);
    const filtered = all.filter((q) => q.difficulty === difficulty);
    return filtered.length > 0 ? filtered : all;
  }, [locale, difficulty]);

  const question = pool[cursor % pool.length]!;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl px-1 py-6 sm:py-10">
        <header className="mb-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--walnut)" }}>
            {t("games.eyebrow")}
          </p>
          <h1 className="mt-1 font-serif text-3xl leading-tight sm:text-4xl">{t(GAME.nameKey)}</h1>
          <p className="mx-auto mt-2 max-w-md text-[14px] text-muted-foreground">
            {t(GAME.descriptionKey)}
          </p>

          <div
            className="mx-auto mt-5 inline-flex flex-wrap items-center justify-center gap-1 rounded-full border border-border bg-card p-1"
            role="radiogroup"
            aria-label={t("games.difficultyLabel")}
          >
            {GAME.supportedDifficulties.map((level) => {
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

        <WhoAmIGame
          key={`${question.id}:${cursor}`}
          question={question}
          onContinue={() => setCursor((c) => c + 1)}
          onTryAnother={() => setCursor((c) => c + Math.max(1, Math.floor(pool.length / 2)))}
        />
      </div>
    </AppShell>
  );
}
