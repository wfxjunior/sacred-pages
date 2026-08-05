import type { GameDifficulty } from "@/lib/games";
import type { WhoAmIQuestion, WhoAmISettings } from "./types";

// Difficulty is configuration, not scattered conditionals — same rule as
// Word Guess. Components receive a resolved WhoAmISettings and never inspect
// the difficulty name again.
//
// gentle      — four options, two clues up front, unlimited attempts.
// balanced    — four options, one clue, a few attempts.
// challenging — six options, one clue, two attempts.
// expert      — no options: the reader types the name; three attempts.
export const WHO_AM_I_DIFFICULTY_PRESETS: Record<GameDifficulty, WhoAmISettings> = {
  gentle: {
    inputMode: "options",
    optionCount: 4,
    initialClues: 2,
    maximumIncorrectAttempts: null,
  },
  balanced: {
    inputMode: "options",
    optionCount: 4,
    initialClues: 1,
    maximumIncorrectAttempts: 3,
  },
  challenging: {
    inputMode: "options",
    optionCount: 6,
    initialClues: 1,
    maximumIncorrectAttempts: 2,
  },
  expert: {
    inputMode: "free_text",
    optionCount: 0,
    initialClues: 1,
    maximumIncorrectAttempts: 3,
  },
};

/** The single place a question's difficulty becomes behaviour. */
export function resolveWhoAmISettings(question: WhoAmIQuestion): WhoAmISettings {
  return WHO_AM_I_DIFFICULTY_PRESETS[question.difficulty];
}
