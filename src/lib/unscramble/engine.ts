import { normalizeWord } from "@/lib/content/normalize";
import {
  isTerminalGameStatus,
  seededRandomFromString,
  shuffleWithRandom,
  type GameDifficulty,
} from "@/lib/games";
import type {
  UnscrambleRound,
  UnscrambleSettings,
  UnscrambleState,
  UnscrambleSubmitOutcome,
} from "./types";

// Pure Unscramble domain. State in, state out; no clock, no Math.random.
//
// Rounds are built from real journey words: the day's word list feeds the
// route, this module only decides which words qualify, how their letters
// scramble (deterministically), and how a round plays out.

// gentle — short words, unlimited attempts, hint on.
// balanced — everyday lengths, a few attempts, hint on.
// challenging — longer words, fewer attempts, hint on.
// expert — the longest words, fewest attempts, no hint.
export const UNSCRAMBLE_DIFFICULTY_PRESETS: Record<GameDifficulty, UnscrambleSettings> = {
  gentle: { minLength: 3, maxLength: 5, maximumIncorrectAttempts: null, hintAvailable: true },
  balanced: { minLength: 4, maxLength: 7, maximumIncorrectAttempts: 5, hintAvailable: true },
  challenging: { minLength: 6, maxLength: 9, maximumIncorrectAttempts: 4, hintAvailable: true },
  expert: { minLength: 8, maxLength: null, maximumIncorrectAttempts: 3, hintAvailable: false },
};

export function resolveUnscrambleSettings(difficulty: GameDifficulty): UnscrambleSettings {
  return UNSCRAMBLE_DIFFICULTY_PRESETS[difficulty];
}

/** A word only makes a puzzle when reordering it is possible AND meaningful:
 * at least three letters, at least two distinct ones. */
export function isUnscrambleWord(word: string): boolean {
  const letters = Array.from(word.toLocaleUpperCase());
  return letters.length >= 3 && new Set(normalizeWord(word)).size >= 2;
}

/** Deterministically scrambles a word's letters, never returning the original
 * order. Bounded retries with a varied seed cover pathological shuffles. */
export function scrambleWord(word: string, seedKey: string): readonly string[] {
  const letters = Array.from(word.toLocaleUpperCase());
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const random = seededRandomFromString(`unscramble:${seedKey}:${word}:${attempt}`);
    const shuffled = shuffleWithRandom(letters, random);
    if (shuffled.join("") !== letters.join("")) return shuffled;
  }
  // Only reachable for words a filter should have rejected; rotating is still
  // a valid different order for any word with two distinct letters.
  return [...letters.slice(1), letters[0]!];
}

/**
 * Builds the day's rounds from a word list: prefer the difficulty's length
 * band, fall back to every eligible word when the band is empty, and order
 * deterministically by the seed so the same day plays the same everywhere.
 */
export function unscrambleRounds(
  words: readonly string[],
  difficulty: GameDifficulty,
  seedKey: string,
): UnscrambleRound[] {
  const settings = resolveUnscrambleSettings(difficulty);
  const eligible = [...new Set(words.map((w) => w.toLocaleUpperCase()))].filter(isUnscrambleWord);
  const banded = eligible.filter(
    (w) =>
      w.length >= settings.minLength &&
      (settings.maxLength == null || w.length <= settings.maxLength),
  );
  const pool = banded.length > 0 ? banded : eligible;
  const ordered = shuffleWithRandom(pool, seededRandomFromString(`unscramble:${seedKey}`));
  return ordered.map((word) => ({ word, letters: scrambleWord(word, seedKey) }));
}

export function createInitialUnscrambleState(round: UnscrambleRound): UnscrambleState {
  return {
    word: round.word,
    picked: [],
    incorrectAttempts: 0,
    hintsUsed: 0,
    status: "not_started",
  };
}

/** Places the letter at `index` of the scrambled pool as the next character. */
export function pickUnscrambleLetter(
  state: UnscrambleState,
  round: UnscrambleRound,
  index: number,
): UnscrambleState {
  if (isTerminalGameStatus(state.status)) return state;
  if (index < 0 || index >= round.letters.length) return state;
  if (state.picked.includes(index)) return state;
  return { ...state, picked: [...state.picked, index], status: "in_progress" };
}

/** Picks the first unpicked pool letter matching a typed character. */
export function pickUnscrambleByChar(
  state: UnscrambleState,
  round: UnscrambleRound,
  char: string,
): UnscrambleState {
  const wanted = normalizeWord(char);
  if (wanted.length !== 1) return state;
  const index = round.letters.findIndex(
    (letter, i) => !state.picked.includes(i) && normalizeWord(letter) === wanted,
  );
  return index === -1 ? state : pickUnscrambleLetter(state, round, index);
}

export function removeLastUnscrambleLetter(state: UnscrambleState): UnscrambleState {
  if (isTerminalGameStatus(state.status)) return state;
  if (state.picked.length === 0) return state;
  return { ...state, picked: state.picked.slice(0, -1) };
}

export function clearUnscramble(state: UnscrambleState): UnscrambleState {
  if (isTerminalGameStatus(state.status)) return state;
  return { ...state, picked: [] };
}

function builtWord(state: UnscrambleState, round: UnscrambleRound): string {
  return state.picked.map((i) => round.letters[i]!).join("");
}

export function submitUnscramble(
  state: UnscrambleState,
  round: UnscrambleRound,
  settings: UnscrambleSettings,
): UnscrambleSubmitOutcome {
  if (state.status === "revealed") return { state, result: "solution_revealed" };
  if (state.status === "completed" || state.status === "failed") {
    return { state, result: "already_completed" };
  }
  if (state.picked.length < round.letters.length) return { state, result: "incomplete" };

  if (normalizeWord(builtWord(state, round)) === normalizeWord(round.word)) {
    return { state: { ...state, status: "completed" }, result: "correct" };
  }

  const incorrectAttempts = state.incorrectAttempts + 1;
  const limit = settings.maximumIncorrectAttempts;
  const failed = limit != null && incorrectAttempts >= limit;
  return {
    state: { ...state, incorrectAttempts, status: failed ? "failed" : "in_progress" },
    result: "incorrect",
  };
}

/**
 * The hint trims the answer back to its longest correct prefix, then places
 * the next correct letter — always one honest step forward, deterministic
 * (lowest matching pool index). Filling the final letter completes the round:
 * a fully hinted word is still the correct word, and hintsUsed says how it
 * happened.
 */
export function applyUnscrambleHint(
  state: UnscrambleState,
  round: UnscrambleRound,
): UnscrambleState {
  if (isTerminalGameStatus(state.status)) return state;

  const target = Array.from(round.word.toLocaleUpperCase()).map((c) => normalizeWord(c));
  let prefix = 0;
  while (
    prefix < state.picked.length &&
    normalizeWord(round.letters[state.picked[prefix]!]!) === target[prefix]
  ) {
    prefix += 1;
  }
  const kept = state.picked.slice(0, prefix);
  const nextIndex = round.letters.findIndex(
    (letter, i) => !kept.includes(i) && normalizeWord(letter) === target[prefix],
  );
  if (nextIndex === -1) return state;

  const picked = [...kept, nextIndex];
  const complete = picked.length === round.letters.length;
  return {
    ...state,
    picked,
    hintsUsed: state.hintsUsed + 1,
    status: complete ? "completed" : "in_progress",
  };
}

export function revealUnscramble(state: UnscrambleState, round: UnscrambleRound): UnscrambleState {
  if (state.status === "completed" || state.status === "revealed") return state;
  // Show the solution in reading order: pool indexes arranged to spell the word.
  const target = Array.from(round.word.toLocaleUpperCase()).map((c) => normalizeWord(c));
  const picked: number[] = [];
  for (const wanted of target) {
    const index = round.letters.findIndex(
      (letter, i) => !picked.includes(i) && normalizeWord(letter) === wanted,
    );
    if (index !== -1) picked.push(index);
  }
  return { ...state, picked, status: "revealed" };
}

export function resetUnscramble(round: UnscrambleRound): UnscrambleState {
  return createInitialUnscrambleState(round);
}

/** Physical-keyboard mapping, pure and testable. */
export function mapUnscrambleKey(
  key: string,
): { type: "char"; char: string } | { type: "remove" } | { type: "submit" } | null {
  if (key === "Backspace") return { type: "remove" };
  if (key === "Enter") return { type: "submit" };
  if (key.length === 1 && normalizeWord(key).length === 1) return { type: "char", char: key };
  return null;
}
