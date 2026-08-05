// Who Am I domain types. Pure domain — no React, no DOM.
//
// The mode presents progressive clues about a person from Scripture; the
// reader names them, either by choosing among options or (expert) by typing
// the name. Difficulty, locale and lifecycle status come from the shared game
// platform (lib/games).

import type { GameDifficulty, GameLocale, GameStatus } from "@/lib/games";

export interface WhoAmIQuestion {
  id: string;
  locale: GameLocale;
  /** Ordered vaguest → most revealing; later clues give more away. */
  clues: readonly string[];
  /** Display name of the person ("JOHN THE BAPTIST"). */
  answer: string;
  /** Alternative names that also count as correct ("SIMON", "CEPHAS"…). */
  acceptedAnswers?: readonly string[];
  /** Wrong names the option mode draws from. Must not contain the answer. */
  distractors: readonly string[];
  scriptureReference?: string;
  /** Shown on completion — one calm sentence, never during play. */
  explanation?: string;
  difficulty: GameDifficulty;
  category?: string;
}

export type WhoAmIInputMode = "options" | "free_text";

/** Difficulty-resolved behaviour. Built by resolveWhoAmISettings — the one
 * place difficulty is interpreted for this mode. */
export interface WhoAmISettings {
  inputMode: WhoAmIInputMode;
  /** Names shown in option mode, correct answer included. */
  optionCount: number;
  /** Clues visible before the reader asks for more. */
  initialClues: number;
  /** `null` means unlimited attempts. */
  maximumIncorrectAttempts: number | null;
}

export interface WhoAmIState {
  questionId: string;
  cluesRevealed: number;
  incorrectAttempts: number;
  /** Normalized wrong guesses — dims tried options, feeds announcements. */
  guesses: readonly string[];
  status: GameStatus;
}

export type WhoAmIGuessResult =
  "correct" | "incorrect" | "empty" | "already_completed" | "solution_revealed";

export interface WhoAmIGuessOutcome {
  state: WhoAmIState;
  result: WhoAmIGuessResult;
}
