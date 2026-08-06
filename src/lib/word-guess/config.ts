import type { WordGuessDifficulty, WordGuessQuestion, WordGuessSettings } from "./types";

// Difficulty is configuration, not scattered conditionals. Components receive
// a resolved WordGuessSettings and never inspect the difficulty name again.
//
// gentle      — two revealed letters, unlimited attempts, hint on.
// balanced    — one revealed letter, a few attempts, hint on.
// challenging — one revealed letter, fewer attempts.
// expert      — nothing shown, fewest attempts, no hint and no reveal-letter;
//               a timed variant is prepared by the state model but not enabled.
//
// Reveals use random_letters everywhere: the revealed POSITIONS vary from
// question to question (deterministically, seeded per puzzle) instead of
// always showing first/last — a fixed pattern reads as a template, varied
// positions read as a puzzle. first_letter/first_and_last remain available
// as per-question overrides.
export const WORD_GUESS_DIFFICULTY_PRESETS: Record<WordGuessDifficulty, WordGuessSettings> = {
  gentle: {
    revealMode: "random_letters",
    randomRevealCount: 2,
    maximumIncorrectAttempts: null,
    hintAvailable: true,
    revealLetterAvailable: true,
    clearOnIncorrect: false,
  },
  balanced: {
    revealMode: "random_letters",
    randomRevealCount: 1,
    maximumIncorrectAttempts: 5,
    hintAvailable: true,
    revealLetterAvailable: true,
    clearOnIncorrect: false,
  },
  challenging: {
    revealMode: "random_letters",
    randomRevealCount: 1,
    maximumIncorrectAttempts: 4,
    hintAvailable: true,
    revealLetterAvailable: true,
    clearOnIncorrect: false,
  },
  expert: {
    revealMode: "none",
    randomRevealCount: 0,
    maximumIncorrectAttempts: 3,
    hintAvailable: false,
    revealLetterAvailable: false,
    clearOnIncorrect: false,
  },
};

/**
 * The single place a question's difficulty becomes behaviour. Question-level
 * fields override the preset; a hint can only be offered when the question
 * actually carries one.
 */
export function resolveWordGuessSettings(question: WordGuessQuestion): WordGuessSettings {
  const preset = WORD_GUESS_DIFFICULTY_PRESETS[question.difficulty];
  return {
    ...preset,
    revealMode: question.revealMode ?? preset.revealMode,
    maximumIncorrectAttempts:
      question.maximumIncorrectAttempts !== undefined
        ? question.maximumIncorrectAttempts
        : preset.maximumIncorrectAttempts,
    hintAvailable: preset.hintAvailable && Boolean(question.hint),
  };
}
