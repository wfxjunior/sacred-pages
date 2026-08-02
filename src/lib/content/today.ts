import { useEffect, useMemo } from "react";
import { useSearch } from "@tanstack/react-router";
import { TODAY } from "@/lib/mock-data";
import { useDailyJourney, useJourneyBySlug } from "./catalog";
import type { DifficultyLevel } from "./types";
import { dateKey, lastDraw, recentWords, rememberLastDraw, rememberWords } from "./word-history";

export type TodayContent = typeof TODAY;

/** Each step up keeps the previous words and adds the next tier on top. */
const TIERS: DifficultyLevel[] = ["gentle", "balanced", "challenging", "expert"];

/** How many words each tier asks for. */
const TIER_COUNT: Record<DifficultyLevel, number> = {
  gentle: 6,
  balanced: 9,
  challenging: 12,
  expert: 16,
};

/** Folds a journey's identity into the draw seed. */
function hashKey(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Seed for the day: derived from the calendar date, so every day starts from a
 * different draw instead of a fixed list.
 */
export function dayVariant(now: Date = new Date()): number {
  return hashKey(dateKey(now)) % 1_000_003;
}

/** Small deterministic PRNG so a given variant always yields the same draw. */
function seeded(seed: number) {
  let state = (seed * 2654435761) % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => (state = (state * 16807) % 2147483647) / 2147483647;
}

/**
 * Draws the word list for a difficulty.
 *
 * The tier fixes *how many* words appear, but not *which*. Journeys carry just
 * enough words that "everything at or below the tier" would always be the same
 * list, so the eligible pool deliberately reaches one tier higher: that leaves
 * spare words to rotate through, seeded by `variant`, while keeping the extra
 * words only a single step harder than the tier the reader picked.
 */
/** Exported for tests: the draw that feeds both the grid and the word list. */
export function wordsFor(
  words: { display: string; minDifficulty: DifficultyLevel }[],
  difficulty: DifficultyLevel,
  variant: number,
  /** Journey identity, so two journeys never rotate in lockstep. */
  seedKey = "",
  /** Words already shown today — skipped while the pool can spare them. */
  avoid: string[] = [],
  /** The exact previous list — pushed to the very back so the set turns over. */
  previous: string[] = [],
  day = dateKey(),
) {
  const ceiling = TIERS.indexOf(difficulty);
  const target = Math.min(TIER_COUNT[difficulty], words.length);
  const rank = (w: { minDifficulty: DifficultyLevel }) => TIERS.indexOf(w.minDifficulty);
  // Reach one tier higher for spare words, and one tier further still when that
  // is not enough to swap out a whole draw — variety beats a strict ceiling.
  let reach = 1;
  while (words.filter((w) => rank(w) <= ceiling + reach).length < target * 2 && ceiling + reach < TIERS.length) {
    reach += 1;
  }
  const eligible = words.filter((w) => rank(w) <= ceiling + reach);
  const rest = words.filter((w) => rank(w) > ceiling + reach);

  const random = seeded(hashKey(`${day}|${seedKey}|${difficulty}|${Math.abs(variant)}`));
  const shuffle = <T,>(list: T[]) => {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j]!, copy[i]!];
    }
    return copy;
  };

  // Three queues, in order of preference: never shown today, shown earlier but
  // not in the immediately previous draw, and finally the previous draw itself.
  // A shuffle therefore replaces as much of the list as the pool allows.
  const seen = new Set(avoid.map((w) => w.toUpperCase()));
  const last = new Set(previous.map((w) => w.toUpperCase()));
  const key = (w: { display: string }) => w.display.toUpperCase();
  const fresh = shuffle(eligible.filter((w) => !seen.has(key(w)) && !last.has(key(w))));
  const reused = shuffle(eligible.filter((w) => seen.has(key(w)) && !last.has(key(w))));
  const repeats = shuffle(eligible.filter((w) => last.has(key(w))));
  const picked = [...fresh, ...reused, ...repeats, ...shuffle(rest)].slice(0, target);
  // Re-shuffle the winners so the reading order changes even when the same
  // words come back around.
  return shuffle(picked).map((w) => w.display.toUpperCase());
}

/**
 * The Daily Journey as the Today screen renders it.
 *
 * Falls back to the sample journey while loading, or when no assignment exists
 * for the reader's language today, so the screen is never blank.
 */
/** The journey slug the reader chose in the library, if any (`/today?journey=…`). */
function useSelectedJourneySlug(): string | undefined {
  const search = useSearch({ strict: false }) as { journey?: string };
  return search?.journey;
}

export function useTodayContent(
  difficulty: DifficultyLevel = "gentle",
  variant: number = dayVariant(),
): TodayContent {
  const slug = useSelectedJourneySlug();
  const daily = useDailyJourney();
  const selected = useJourneyBySlug(slug);
  const data = slug ? selected.data : daily.data;

  const content = useMemo(() => {
    if (!data) return TODAY;
    const scripture = data.scripture[0];
    const identity = data.slug ?? data.id ?? data.title;
    const words = wordsFor(
      data.words,
      difficulty,
      variant,
      identity,
      recentWords(identity, difficulty),
      lastDraw(identity, difficulty),
    );
    return {
      title: data.title,
      reference: scripture?.display_reference ?? data.subtitle ?? "",
      scripture: scripture?.stored_text ?? data.subtitle ?? "",
      devotional: data.devotionalBody ?? "",
      reflection: data.reflectionPrompt ?? "",
      prayer: data.prayerBody ?? "",
      words: words.length > 0 ? words : TODAY.words,
    };
  }, [data, difficulty, variant]);

  const identity = data?.slug ?? data?.id ?? data?.title;
  const drawn = content.words.join(" ");
  useEffect(() => {
    if (!identity || !drawn) return;
    const list = drawn.split(" ");
    rememberWords(identity, difficulty, list);
    rememberLastDraw(identity, difficulty, list);
  }, [identity, difficulty, drawn]);

  return content;
}

/** True until the Daily Journey has resolved, so the screen can hold still. */
export function useTodayLoading(): boolean {
  const slug = useSelectedJourneySlug();
  const daily = useDailyJourney();
  const selected = useJourneyBySlug(slug);
  const { isLoading, isFetching, data } = slug ? selected : daily;
  return isLoading || (isFetching && !data);
}