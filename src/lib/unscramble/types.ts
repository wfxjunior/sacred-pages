// Unscramble domain types. Pure domain — no React, no DOM.
//
// A word from the day's journey has its letters shuffled; the reader rebuilds
// it in order. Difficulty, locale and lifecycle status come from the shared
// game platform (lib/games).

import type { GameDifficulty, GameStatus } from "@/lib/games";

/** One playable round: a word and its deterministic scrambled letter order. */
export interface UnscrambleRound {
  /** Display word, uppercase, accents intact. */
  word: string;
  /** The word's characters in scrambled order — indexes into this array are
   * what the reader picks. Guaranteed different from the original order. */
  letters: readonly string[];
}

/** Difficulty-resolved behaviour. Built by resolveUnscrambleSettings — the one
 * place difficulty is interpreted for this mode. */
export interface UnscrambleSettings {
  /** Word-length band the rounds prefer. `null` max means unbounded. */
  minLength: number;
  maxLength: number | null;
  /** `null` means unlimited attempts. */
  maximumIncorrectAttempts: number | null;
  hintAvailable: boolean;
}

export interface UnscrambleState {
  /** The word this state belongs to. */
  word: string;
  /** Indexes into round.letters, in the order the reader placed them. */
  picked: readonly number[];
  incorrectAttempts: number;
  hintsUsed: number;
  status: GameStatus;
}

export type UnscrambleSubmitResult =
  "correct" | "incorrect" | "incomplete" | "already_completed" | "solution_revealed";

export interface UnscrambleSubmitOutcome {
  state: UnscrambleState;
  result: UnscrambleSubmitResult;
}

export type UnscrambleDifficulty = GameDifficulty;
