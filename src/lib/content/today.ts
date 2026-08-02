import { useMemo } from "react";
import { useSearch } from "@tanstack/react-router";
import { TODAY } from "@/lib/mock-data";
import { useDailyJourney, useJourneyBySlug } from "./catalog";
import type { DifficultyLevel } from "./types";

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

/** Days since the epoch — the puzzle refreshes on its own each day. */
export function dayVariant(now: Date = new Date()): number {
  return Math.floor(now.getTime() / 86_400_000);
}

/** Folds a journey's identity into the draw seed. */
function hashKey(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
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
function wordsFor(
  words: { display: string; minDifficulty: DifficultyLevel }[],
  difficulty: DifficultyLevel,
  variant: number,
  /** Journey identity, so two journeys never rotate in lockstep. */
  seedKey = "",
) {
  const ceiling = TIERS.indexOf(difficulty);
  const target = Math.min(TIER_COUNT[difficulty], words.length);
  const rank = (w: { minDifficulty: DifficultyLevel }) => TIERS.indexOf(w.minDifficulty);
  const eligible = words.filter((w) => rank(w) <= ceiling + 1);
  const rest = words.filter((w) => rank(w) > ceiling + 1);

  const random = seeded((Math.abs(variant) + 1) ^ hashKey(`${seedKey}|${difficulty}`));
  const shuffle = <T,>(list: T[]) => {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j]!, copy[i]!];
    }
    return copy;
  };

  const picked = [...shuffle(eligible), ...shuffle(rest)].slice(0, target);
  return picked.map((w) => w.display.toUpperCase());
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

  return useMemo(() => {
    if (!data) return TODAY;
    const scripture = data.scripture[0];
    const words = wordsFor(data.words, difficulty, variant);
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
}

/** True until the Daily Journey has resolved, so the screen can hold still. */
export function useTodayLoading(): boolean {
  const slug = useSelectedJourneySlug();
  const daily = useDailyJourney();
  const selected = useJourneyBySlug(slug);
  const { isLoading, isFetching, data } = slug ? selected : daily;
  return isLoading || (isFetching && !data);
}