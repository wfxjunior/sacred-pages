import {
  seededRandomFromString,
  shuffleWithRandom,
  type GameDifficulty,
  type GameLocale,
} from "@/lib/games";
import { wordGuessQuestionsForLocale } from "./questions";
import type { WordGuessQuestion } from "./types";

// Which questions a reader meets, and in what order.
//
// Difficulty in this mode is how much of the answer is revealed and how many
// attempts are allowed — not which questions exist. Filtering the pool by the
// question's own difficulty tag shrank some levels to a handful and made the
// order identical on every visit. So every level draws from the whole pool;
// the tag only decides what comes first, and the day reshuffles the rest.

/**
 * The playable pool: questions whose own tag matches the chosen level lead,
 * the rest follow, each group shuffled deterministically by `seedKey` (the
 * calendar date) so an order holds for a day and changes tomorrow.
 */
export function wordGuessPool(
  locale: GameLocale,
  difficulty: GameDifficulty,
  seedKey: string,
): WordGuessQuestion[] {
  const all = wordGuessQuestionsForLocale(locale);
  const random = seededRandomFromString(`word-guess:${seedKey}:${locale}:${difficulty}`);
  const matching = shuffleWithRandom(
    all.filter((question) => question.difficulty === difficulty),
    random,
  );
  const rest = shuffleWithRandom(
    all.filter((question) => question.difficulty !== difficulty),
    random,
  );
  return [...matching, ...rest];
}
