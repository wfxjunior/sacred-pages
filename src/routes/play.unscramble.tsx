import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { Button } from "@/components/ui/button";
import { UnscrambleGame } from "@/components/games/unscramble/UnscrambleGame";
import { dateKey } from "@/lib/content/word-history";
import { useDailyJourney } from "@/lib/content/catalog";
import { GAME_REGISTRY, type GameDifficulty } from "@/lib/games";
import { useI18n } from "@/lib/i18n";
import { GameDifficultyPicker } from "@/components/games/GameDifficultyPicker";
import { useGamePosition } from "@/lib/games/useGamePosition";
import { unscrambleRounds } from "@/lib/unscramble/engine";

// Unscramble draws its words from the day's real journey, so the game and the
// devotional speak the same vocabulary. The sample pool below only appears
// when no journey is available (offline/unconfigured), mirroring Today.

const GAME = GAME_REGISTRY.unscramble;

const FALLBACK_WORDS = [
  "GRACE",
  "FAITH",
  "PEACE",
  "PRAYER",
  "HOPE",
  "GRATITUDE",
  "THANKFUL",
  "TRUST",
  "PRESENCE",
  "WORSHIP",
  "PATIENCE",
  "KINDNESS",
  "CONTENTMENT",
  "GENEROSITY",
  "ABUNDANCE",
];

export const Route = createFileRoute("/play/unscramble")({
  head: () => ({
    meta: [
      { title: "Unscramble — Lumena" },
      {
        name: "description",
        content:
          "Put the letters of today's Scripture words back in order, one calm word at a time.",
      },
    ],
  }),
  component: UnscramblePage,
});

function UnscramblePage() {
  const { t, locale } = useI18n();
  // Difficulty and place in the pool persist per device, so returning to
  // the journey and coming back resumes exactly where the reader stood.
  const { difficulty, chooseDifficulty, cursor, setCursor } = useGamePosition("unscramble");
  // Date resolves after hydration so SSR and client never disagree at midnight.
  const [seed, setSeed] = useState(() => dateKey());
  useEffect(() => setSeed(dateKey()), []);

  const daily = useDailyJourney();
  const words = useMemo(
    () => (daily.data ? daily.data.words.map((w) => w.display) : FALLBACK_WORDS),
    [daily.data],
  );
  const scriptureReference = daily.data?.scripture[0]?.display_reference ?? undefined;

  const rounds = useMemo(
    () => unscrambleRounds(words, difficulty, `${seed}:${locale}`),
    [words, difficulty, seed, locale],
  );
  const round = rounds.length > 0 ? rounds[cursor % rounds.length]! : null;

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

          {rounds.length > 0 && (
            <p className="mt-3 text-[12px] tabular-nums text-muted-foreground">
              {(cursor % rounds.length) + 1} {t("ui.of")} {rounds.length}
            </p>
          )}
        </header>

        {round ? (
          <UnscrambleGame
            key={`${round.word}:${cursor}:${difficulty}`}
            round={round}
            difficulty={difficulty}
            scriptureReference={scriptureReference}
            devotional={daily.data?.devotionalBody ?? undefined}
            prayer={daily.data?.prayerBody ?? undefined}
            onContinue={() => setCursor((c) => c + 1)}
            onTryAnother={() => setCursor((c) => c + Math.max(1, Math.floor(rounds.length / 2)))}
          />
        ) : (
          <div className="mx-auto max-w-md rounded-2xl border border-border/60 bg-card p-6 text-center">
            <p className="text-[14px] text-muted-foreground">{t("unscr.empty")}</p>
            <Button asChild className="mt-4 rounded-full">
              <Link to="/today">{t("nav.today")}</Link>
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
