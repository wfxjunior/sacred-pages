// Finish the Verse domain types. Pure domain — no React, no DOM.
//
// The mode is progressive Scripture memorization: the same verse returns with
// more of itself hidden as difficulty rises (the "fading" method). Difficulty
// and lifecycle status come from the shared game platform (lib/games).

import type { GameStatus } from "@/lib/games";

/** A verse as content: reference plus full display text. */
export interface VersePassage {
  reference: string;
  text: string;
  /** The journey this verse came from, when it is the day's passage. */
  journeyTitle?: string;
  /** Devotional explanation shown after the round — what the verse means. */
  explanation?: string;
  /** Closing prayer — echoes the verse, ends the moment. */
  prayer?: string;
}

/** One display token of the verse. Punctuation stays attached to its word
 * ("heart," renders whole); `matchable` is the normalized word or null for
 * tokens that are pure punctuation and can never be hidden. */
export interface VerseToken {
  text: string;
  matchable: string | null;
}

/** A word chip in the bank. Ids are stable indexes — two "AND" entries are
 * distinct chips. */
export interface VerseBankEntry {
  id: number;
  word: string;
}

export interface FinishVerseRound {
  reference: string;
  journeyTitle?: string;
  /** Passage devotional, shown after the round in the fixed sequence. */
  explanation?: string;
  prayer?: string;
  tokens: readonly VerseToken[];
  /** Token indexes hidden for this round, ascending. */
  hiddenSlots: readonly number[];
  /** Shuffled bank: every hidden word plus distractors from other verses. */
  bank: readonly VerseBankEntry[];
}

/** Difficulty-resolved behaviour — the memorization ladder, in one place. */
export interface FinishVerseSettings {
  /** Portion of the verse's words hidden (0..1). */
  hiddenRatio: number;
  /** Hard cap on hidden words, so long verses stay kind. */
  maxHidden: number;
  /** Challenging rung: empty slots show the word's first letter as a ghost. */
  showInitialLetter: boolean;
  /** Distractor words mixed into the bank. */
  bankExtras: number;
  /** `null` means unlimited attempts. */
  maximumIncorrectAttempts: number | null;
  hintAvailable: boolean;
}

export interface FinishVerseState {
  /** Per hidden slot (by position in round.hiddenSlots): the bank id placed
   * there, or null while empty. */
  placed: readonly (number | null)[];
  incorrectAttempts: number;
  hintsUsed: number;
  status: GameStatus;
}

/** One gap, judged: what belonged there and what the reader put. */
export interface VerseSlotReview {
  slotIndex: number;
  /** Position in round.tokens, for rendering inside the verse. */
  tokenIndex: number;
  /** The true word as the verse displays it ("Yahweh", "heart,"). */
  correctText: string;
  /** Its normalized matching form. */
  correctWord: string;
  /** What the reader placed, or null if they left it empty. */
  placedWord: string | null;
  status: "correct" | "wrong" | "empty";
}

export type FinishVerseSubmitResult =
  "correct" | "incorrect" | "incomplete" | "already_completed" | "solution_revealed";

export interface FinishVerseSubmitOutcome {
  state: FinishVerseState;
  result: FinishVerseSubmitResult;
  /** On "incorrect": which slots survived (true) and which were cleared. */
  slotCorrect?: readonly boolean[];
}
