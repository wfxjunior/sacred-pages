import { useMemo } from "react";
import { TODAY } from "@/lib/mock-data";
import { useDailyJourney } from "./catalog";

export type TodayContent = typeof TODAY;

/**
 * The Daily Journey as the Today screen renders it.
 *
 * Falls back to the sample journey while loading, or when no assignment exists
 * for the reader's language today, so the screen is never blank.
 */
export function useTodayContent(): TodayContent {
  const { data } = useDailyJourney();

  return useMemo(() => {
    if (!data) return TODAY;
    const scripture = data.scripture[0];
    const words = data.words.map((w) => w.display.toUpperCase());
    return {
      title: data.title,
      reference: scripture?.display_reference ?? data.subtitle ?? "",
      scripture: scripture?.stored_text ?? data.subtitle ?? "",
      devotional: data.devotionalBody ?? "",
      reflection: data.reflectionPrompt ?? "",
      prayer: data.prayerBody ?? "",
      words: words.length > 0 ? words : TODAY.words,
    };
  }, [data]);
}