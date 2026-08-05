// Word Guess domain types.
//
// The domain is framework-independent: nothing in src/lib/word-guess imports
// React or touches the DOM. Components render state; these modules own it.

/** Mirrors the app's Locale without importing the React-bound i18n module. */
export type WordGuessLocale = "en" | "pt" | "es";

export type WordGuessDifficulty = "gentle" | "balanced" | "challenging" | "expert";

export type WordGuessRevealMode =
  "first_letter" | "first_and_last" | "random_letters" | "custom" | "none";

export interface WordGuessQuestion {
  id: string;
  locale: WordGuessLocale;
  question: string;
  /** Display answer, accents and punctuation intact ("NOAH'S ARK", "ORAÇÃO"). */
  answer: string;
  scriptureReference?: string;
  hint?: string;
  /** Shown on completion — one calm sentence of context, never during play. */
  explanation?: string;
  difficulty: WordGuessDifficulty;
  /** Overrides the difficulty preset's reveal mode when present. */
  revealMode?: WordGuessRevealMode;
  /** For "custom": positions in the answer string that start revealed. */
  customVisibleIndexes?: readonly number[];
  /** Overrides the preset. `null` means unlimited attempts. */
  maximumIncorrectAttempts?: number | null;
  /** Stable seed for deterministic random reveals; falls back to `id`. */
  seed?: string;
  category?: string;
}

/** One position of the answer as the board renders it. */
export interface WordGuessCell {
  /** Position in the answer string. */
  index: number;
  /** Display character, casing and accents preserved. */
  char: string;
  /**
   * Normalized single-character matching form (see lib/content/normalize);
   * `null` for spaces and punctuation, which are never guessed.
   */
  matchable: string | null;
  kind: "letter" | "space" | "punctuation";
}

export type WordGuessStatus = "not_started" | "in_progress" | "completed" | "revealed" | "failed";

export interface WordGuessState {
  questionId: string;
  /**
   * Entered display characters aligned to answer positions — index-for-index
   * with the answer string. `null` marks an empty guessable position or a
   * fixed cell (visible letters, spaces, punctuation). Positional alignment is
   * deliberate: revealing a letter mid-game must not shift what the reader
   * already typed into other cells.
   */
  entered: readonly (string | null)[];
  /** Letter positions currently shown: the initial pattern plus reveal-letter uses. */
  visibleIndexes: readonly number[];
  incorrectAttempts: number;
  hintUsed: boolean;
  /** Letters revealed via reveal-letter (excludes the initial pattern). */
  revealedLetterCount: number;
  /** Normalized incorrect submissions — feeds keyboard used-letter feedback. */
  guesses: readonly string[];
  status: WordGuessStatus;
}

export type WordGuessValidation =
  | "exact_match"
  | "incomplete"
  | "incorrect"
  | "invalid_character"
  | "already_completed"
  | "solution_revealed";

export interface WordGuessValidationOutcome {
  state: WordGuessState;
  result: WordGuessValidation;
}

/** Difficulty-resolved behaviour. Built by resolveWordGuessSettings — the ONE
 * place difficulty is interpreted; UI components must not re-derive it. */
export interface WordGuessSettings {
  revealMode: WordGuessRevealMode;
  /** How many letters the "random_letters" mode reveals. */
  randomRevealCount: number;
  /** `null` means unlimited attempts. */
  maximumIncorrectAttempts: number | null;
  hintAvailable: boolean;
  revealLetterAvailable: boolean;
  /** Clear the entered answer after an incorrect submission. Off by default —
   * wiping the reader's work uninvited is punitive. */
  clearOnIncorrect: boolean;
}

/** Actions a physical key maps to. Kept in the domain so the mapping is testable. */
export type WordGuessKeyAction =
  { type: "insert"; char: string } | { type: "remove" } | { type: "submit" } | null;
