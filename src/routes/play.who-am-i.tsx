import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { WhoAmIGame } from "@/components/games/who-am-i/WhoAmIGame";
import { useI18n } from "@/lib/i18n";
import { GameDifficultyPicker } from "@/components/games/GameDifficultyPicker";
import { useGamePosition } from "@/lib/games/useGamePosition";
import { GAME_REGISTRY, seededRandomFromString, shuffleWithRandom } from "@/lib/games";
import { dateKey } from "@/lib/content/word-history";
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

  // Every question is playable at every level (difficulty decides the clues
  // and attempts); the day decides the order.
  const [seed, setSeed] = useState(() => dateKey());
  useEffect(() => setSeed(dateKey()), []);
  const pool = useMemo(() => {
    const all = whoAmIQuestionsForLocale(locale);
    const random = seededRandomFromString(`who-am-i:${seed}:${locale}:${difficulty}`);
    return [
      ...shuffleWithRandom(
        all.filter((q) => q.difficulty === difficulty),
        random,
      ),
      ...shuffleWithRandom(
        all.filter((q) => q.difficulty !== difficulty),
        random,
      ),
    ];
  }, [locale, difficulty, seed]);

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

          <GameDifficultyPicker
            value={difficulty}
            options={GAME.supportedDifficulties}
            onChange={chooseDifficulty}
          />

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
