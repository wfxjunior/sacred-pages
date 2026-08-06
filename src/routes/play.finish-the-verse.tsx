import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { FinishTheVerseGame } from "@/components/games/finish-the-verse/FinishTheVerseGame";
import { useDailyJourney } from "@/lib/content/catalog";
import { dateKey } from "@/lib/content/word-history";
import {
  buildFinishVerseRound,
  resolveFinishVerseSettings,
  tokenizeVerse,
} from "@/lib/finish-the-verse/engine";
import type { VersePassage } from "@/lib/finish-the-verse/types";
import { finishVersePassagesForLocale } from "@/lib/finish-the-verse/verses";
import { GAME_REGISTRY, type GameDifficulty } from "@/lib/games";
import { useI18n } from "@/lib/i18n";
import { useGamePosition } from "@/lib/games/useGamePosition";

// Finish the Verse: progressive Scripture memorization. The day's real
// journey verse leads the pool when one is available; a curated public-domain
// set keeps the practice rich either way. Distractor words are drawn from the
// other verses, so the bank always sounds like Scripture.

const GAME = GAME_REGISTRY.finish_the_verse;

export const Route = createFileRoute("/play/finish-the-verse")({
  head: () => ({
    meta: [
      { title: "Finish the Verse — Lumena" },
      {
        name: "description",
        content: "Progressive Scripture memorization: the verse fades, your memory completes it.",
      },
    ],
  }),
  component: FinishTheVersePage,
});

function FinishTheVersePage() {
  const { t, locale } = useI18n();
  // Difficulty and place in the pool persist per device, so returning to
  // the journey and coming back resumes exactly where the reader stood.
  const { difficulty, chooseDifficulty, cursor, setCursor } = useGamePosition("finish_the_verse");
  // Date resolves after hydration so SSR and client never disagree at midnight.
  const [seed, setSeed] = useState(() => dateKey());
  useEffect(() => setSeed(dateKey()), []);

  const daily = useDailyJourney();
  const passages = useMemo(() => {
    const curated = finishVersePassagesForLocale(locale);
    const scripture = daily.data?.scripture[0];
    if (!scripture?.stored_text || !scripture.display_reference) return curated;
    const todays: VersePassage = {
      reference: scripture.display_reference,
      text: scripture.stored_text,
      journeyTitle: daily.data?.title,
    };
    // Enough words to hide at least a few — otherwise the curated set leads.
    if (tokenizeVerse(todays.text).filter((token) => token.matchable).length < 5) return curated;
    return [todays, ...curated.filter((p) => p.reference !== todays.reference)];
  }, [daily.data, locale]);

  const passage = passages[cursor % passages.length]!;

  const round = useMemo(() => {
    const distractors = passages
      .filter((p) => p.reference !== passage.reference)
      .flatMap((p) =>
        tokenizeVerse(p.text)
          .map((token) => token.matchable)
          .filter((word): word is string => word != null),
      );
    return buildFinishVerseRound(
      passage,
      resolveFinishVerseSettings(difficulty),
      distractors,
      `${seed}:${locale}`,
    );
  }, [passage, passages, difficulty, seed, locale]);

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
            {(cursor % passages.length) + 1} {t("ui.of")} {passages.length}
            {round.journeyTitle ? ` · ${round.journeyTitle}` : ""}
          </p>
        </header>

        <FinishTheVerseGame
          key={`${passage.reference}:${cursor}:${difficulty}`}
          round={round}
          difficulty={difficulty}
          onContinue={() => setCursor((c) => c + 1)}
          onTryAnother={() => setCursor((c) => c + Math.max(1, Math.floor(passages.length / 2)))}
        />
      </div>
    </AppShell>
  );
}
