import { dateKey } from "@/lib/content/word-history";
import { seededRandomFromString, type GameLocale } from "@/lib/games";
import { wordGuessQuestionsForLocale } from "@/lib/word-guess/questions";
import type { WordGuessQuestion } from "@/lib/word-guess/types";
import { whoAmIQuestionsForLocale } from "@/lib/who-am-i/questions";
import type { WhoAmIQuestion } from "@/lib/who-am-i/types";

// The Daily Challenge: one curated round each day, drawn deterministically
// from the shipped game modes. Same date, same locale → the same challenge on
// every device, with no server round-trip — the seed is the calendar date.
//
// Word-search days point the reader at Today's Journey (the word search of
// the day IS the daily puzzle); question days embed the round directly.

export type DailyChallenge =
  | { date: string; mode: "word_search" }
  | { date: string; mode: "word_guess"; question: WordGuessQuestion }
  | { date: string; mode: "who_am_i"; question: WhoAmIQuestion };

export { dateKey as dailyChallengeDateKey };

export function dailyChallengeFor(date: string, locale: GameLocale): DailyChallenge {
  const random = seededRandomFromString(`daily-challenge:${date}`);
  const roll = random();
  if (roll < 1 / 3) return { date, mode: "word_search" };

  if (roll < 2 / 3) {
    const pool = wordGuessQuestionsForLocale(locale);
    return { date, mode: "word_guess", question: pool[Math.floor(random() * pool.length)]! };
  }

  const pool = whoAmIQuestionsForLocale(locale);
  return { date, mode: "who_am_i", question: pool[Math.floor(random() * pool.length)]! };
}

const STORAGE_PREFIX = "lumena:daily-challenge:";

/** Whether today's challenge was already finished on this device. Local-only
 * for now — the platform's GameProgressStore contract is the upgrade path. */
export function isDailyChallengeDone(date: string): boolean {
  try {
    return window.localStorage.getItem(`${STORAGE_PREFIX}${date}`) === "done";
  } catch {
    return false;
  }
}

export function markDailyChallengeDone(date: string): void {
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${date}`, "done");
  } catch {
    /* storage unavailable — the panel simply will not persist */
  }
}
