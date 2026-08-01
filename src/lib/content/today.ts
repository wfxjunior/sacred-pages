import { useMemo } from "react";
import { TODAY } from "@/lib/mock-data";
import { useDailyJourney } from "./catalog";
import type { DifficultyLevel } from "./types";

export type TodayContent = typeof TODAY;

/** Each step up keeps the previous words and adds the next tier on top. */
const TIERS: DifficultyLevel[] = ["gentle", "balanced", "challenging", "expert"];

function wordsFor(
  words: { display: string; minDifficulty: DifficultyLevel }[],
  difficulty: DifficultyLevel,
) {
  const ceiling = TIERS.indexOf(difficulty);
  return words
    .filter((w) => TIERS.indexOf(w.minDifficulty) <= ceiling)
    .map((w) => w.display.toUpperCase());
}

/**
 * The Daily Journey as the Today screen renders it.
 *
 * Falls back to the sample journey while loading, or when no assignment exists
 * for the reader's language today, so the screen is never blank.
 */
export function useTodayContent(difficulty: DifficultyLevel = "gentle"): TodayContent {
  const { data } = useDailyJourney();

  return useMemo(() => {
    if (!data) return TODAY;
    const scripture = data.scripture[0];
    const words = wordsFor(data.words, difficulty);
    return {
      title: data.title,
      reference: scripture?.display_reference ?? data.subtitle ?? "",
      scripture: scripture?.stored_text ?? data.subtitle ?? "",
      devotional: data.devotionalBody ?? "",
      reflection: data.reflectionPrompt ?? "",
      prayer: data.prayerBody ?? "",
      words: words.length > 0 ? words : TODAY.words,
    };
  }, [data, difficulty]);
}

/** True until the Daily Journey has resolved, so the screen can hold still. */
export function useTodayLoading(): boolean {
  const { isLoading, isFetching, data } = useDailyJourney();
  return isLoading || (isFetching && !data);
}