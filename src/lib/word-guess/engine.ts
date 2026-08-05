import { normalizeWord } from "@/lib/content/normalize";
import { isTerminalGameStatus, seededRandomFromString, shuffleWithRandom } from "@/lib/games";
import { resolveWordGuessSettings } from "./config";
import type {
  WordGuessCell,
  WordGuessKeyAction,
  WordGuessQuestion,
  WordGuessSettings,
  WordGuessState,
  WordGuessValidationOutcome,
} from "./types";

// Pure Word Guess domain. Every function takes state in and returns state out;
// nothing here reads a clock, Math.random, React or the DOM.
//
// Matching strategy (documented per the content rules in lib/content/normalize):
// the display answer is preserved exactly; matching happens on normalizeWord's
// folded form — uppercase, accents folded (ORAÇÃO ⇢ ORACAO, JESÚS ⇢ JESUS),
// N-tilde kept distinct, spaces/apostrophes/hyphens stripped. Composed and
// decomposed Unicode agree because normalizeWord round-trips through NFC/NFD.

/** Normalizes a full answer or assembled guess into its matching form. */
export function normalizeWordGuessAnswer(input: string): string {
  return normalizeWord(input);
}

/** Splits the display answer into renderable cells. Punctuation and spaces are
 * fixed scenery — shown automatically, never typed, never revealed. */
export function answerCells(question: WordGuessQuestion): WordGuessCell[] {
  return Array.from(question.answer.toLocaleUpperCase()).map((char, index) => {
    if (/\s/.test(char)) return { index, char: " ", matchable: null, kind: "space" as const };
    const matchable = normalizeWord(char);
    return matchable.length === 1
      ? { index, char, matchable, kind: "letter" as const }
      : { index, char, matchable: null, kind: "punctuation" as const };
  });
}

/**
 * Which letter positions start revealed, per the resolved reveal mode. The
 * result is deterministic: random_letters draws from a PRNG seeded by
 * `question.seed ?? question.id`, so a puzzle always reveals the same letters.
 */
export function resolveVisibleIndexes(
  question: WordGuessQuestion,
  settings: WordGuessSettings = resolveWordGuessSettings(question),
): number[] {
  const letters = answerCells(question).filter((cell) => cell.kind === "letter");
  if (letters.length === 0) return [];

  switch (settings.revealMode) {
    case "none":
      return [];
    case "first_letter":
      return [letters[0]!.index];
    case "first_and_last": {
      const first = letters[0]!.index;
      const last = letters[letters.length - 1]!.index;
      return first === last ? [first] : [first, last];
    }
    case "custom": {
      const wanted = new Set(question.customVisibleIndexes ?? []);
      return letters.filter((cell) => wanted.has(cell.index)).map((cell) => cell.index);
    }
    case "random_letters": {
      const random = seededRandomFromString(question.seed ?? question.id);
      const pool = shuffleWithRandom(
        letters.map((cell) => cell.index),
        random,
      );
      const count = Math.min(settings.randomRevealCount, Math.max(0, pool.length - 1));
      return pool.slice(0, count).sort((a, b) => a - b);
    }
  }
}

export function createInitialWordGuessState(
  question: WordGuessQuestion,
  settings: WordGuessSettings = resolveWordGuessSettings(question),
): WordGuessState {
  return {
    questionId: question.id,
    entered: Array.from(question.answer, () => null),
    visibleIndexes: resolveVisibleIndexes(question, settings),
    incorrectAttempts: 0,
    hintUsed: false,
    revealedLetterCount: 0,
    guesses: [],
    status: "not_started",
  };
}

function isTerminal(state: WordGuessState): boolean {
  return isTerminalGameStatus(state.status);
}

function hiddenLetterIndexes(state: WordGuessState, cells: WordGuessCell[]): number[] {
  const visible = new Set(state.visibleIndexes);
  return cells
    .filter((cell) => cell.kind === "letter" && !visible.has(cell.index))
    .map((c) => c.index);
}

/** Fills the leftmost empty hidden position. Non-letter input is ignored —
 * quietly, because mistyping punctuation is not an error worth announcing. */
export function insertCharacter(
  state: WordGuessState,
  question: WordGuessQuestion,
  char: string,
): WordGuessState {
  if (isTerminal(state)) return state;
  if (normalizeWord(char).length !== 1) return state;

  const cells = answerCells(question);
  const target = hiddenLetterIndexes(state, cells).find((index) => state.entered[index] == null);
  if (target === undefined) return state;

  const entered = [...state.entered];
  entered[target] = char.toLocaleUpperCase();
  return { ...state, entered, status: "in_progress" };
}

/** Clears the rightmost entered character. */
export function removeCharacter(state: WordGuessState): WordGuessState {
  if (isTerminal(state)) return state;
  const last = state.entered.reduce((found, value, index) => (value != null ? index : found), -1);
  if (last < 0) return state;
  const entered = [...state.entered];
  entered[last] = null;
  return { ...state, entered };
}

export function clearEnteredAnswer(state: WordGuessState): WordGuessState {
  if (isTerminal(state)) return state;
  return { ...state, entered: state.entered.map(() => null) };
}

/** The full answer as currently shown: visible letters, entered letters and
 * fixed punctuation. `null` when any guessable position is still empty. */
export function assembleGuess(state: WordGuessState, cells: WordGuessCell[]): string | null {
  const visible = new Set(state.visibleIndexes);
  let guess = "";
  for (const cell of cells) {
    if (cell.kind !== "letter" || visible.has(cell.index)) {
      guess += cell.char;
      continue;
    }
    const typed = state.entered[cell.index];
    if (typed == null) return null;
    guess += typed;
  }
  return guess;
}

export function validateWordGuessAnswer(
  state: WordGuessState,
  question: WordGuessQuestion,
  settings: WordGuessSettings = resolveWordGuessSettings(question),
): WordGuessValidationOutcome {
  if (state.status === "revealed") return { state, result: "solution_revealed" };
  if (state.status === "completed" || state.status === "failed") {
    return { state, result: "already_completed" };
  }

  const cells = answerCells(question);
  for (const cell of cells) {
    const typed = state.entered[cell.index];
    if (typed != null && normalizeWord(typed).length !== 1) {
      return { state, result: "invalid_character" };
    }
  }

  const guess = assembleGuess(state, cells);
  if (guess == null) return { state, result: "incomplete" };

  if (normalizeWord(guess) === normalizeWord(question.answer)) {
    return { state: { ...state, status: "completed" }, result: "exact_match" };
  }

  const incorrectAttempts = state.incorrectAttempts + 1;
  const limit = settings.maximumIncorrectAttempts;
  const failed = limit != null && incorrectAttempts >= limit;
  return {
    state: {
      ...state,
      incorrectAttempts,
      guesses: [...state.guesses, normalizeWord(guess)],
      entered: settings.clearOnIncorrect ? state.entered.map(() => null) : state.entered,
      status: failed ? "failed" : "in_progress",
    },
    result: "incorrect",
  };
}

/**
 * Reveals the leftmost still-hidden letter — deterministic by construction, so
 * two taps on two devices agree. Never touches punctuation or spaces. A typed
 * character occupying that position is discarded in favour of the true letter.
 * Revealing the final hidden letter ends the round as "revealed", not
 * "completed": the reader should finish by guessing at least one letter.
 */
export function revealWordGuessLetter(
  state: WordGuessState,
  question: WordGuessQuestion,
): WordGuessState {
  if (isTerminal(state)) return state;
  const cells = answerCells(question);
  const hidden = hiddenLetterIndexes(state, cells);
  const target = hidden[0];
  if (target === undefined) return state;

  const entered = [...state.entered];
  entered[target] = null;
  const visibleIndexes = [...state.visibleIndexes, target].sort((a, b) => a - b);
  const everythingShown = hidden.length === 1;
  return {
    ...state,
    entered,
    visibleIndexes,
    revealedLetterCount: state.revealedLetterCount + 1,
    status: everythingShown ? "revealed" : "in_progress",
  };
}

/** Marks the hint as used. Idempotent — reading it twice costs nothing more. */
export function applyWordGuessHint(state: WordGuessState): WordGuessState {
  if (isTerminal(state)) return state;
  return { ...state, hintUsed: true, status: "in_progress" };
}

/** Shows the whole answer. The UI asks for confirmation before calling this. */
export function revealWordGuessSolution(
  state: WordGuessState,
  question: WordGuessQuestion,
): WordGuessState {
  if (state.status === "completed" || state.status === "revealed") return state;
  const cells = answerCells(question);
  return {
    ...state,
    entered: state.entered.map(() => null),
    visibleIndexes: cells.filter((c) => c.kind === "letter").map((c) => c.index),
    status: "revealed",
  };
}

export function resetWordGuess(question: WordGuessQuestion): WordGuessState {
  return createInitialWordGuessState(question);
}

/**
 * Keyboard feedback derived from submitted guesses: a used letter is "present"
 * when the answer contains it anywhere, "absent" otherwise. Gentle by design —
 * no per-position grading.
 */
export function wordGuessKeyboardFeedback(
  state: WordGuessState,
  question: WordGuessQuestion,
): Record<string, "present" | "absent"> {
  const answer = new Set(normalizeWord(question.answer));
  const feedback: Record<string, "present" | "absent"> = {};
  for (const guess of state.guesses) {
    for (const letter of guess) {
      feedback[letter] = answer.has(letter) ? "present" : "absent";
    }
  }
  return feedback;
}

/** Maps a physical key to a game action. Modifier handling stays in the
 * component (shortcuts must pass through); this mapping is pure and testable. */
export function mapWordGuessKey(key: string): WordGuessKeyAction {
  if (key === "Backspace") return { type: "remove" };
  if (key === "Enter") return { type: "submit" };
  if (key.length === 1 && normalizeWord(key).length === 1) return { type: "insert", char: key };
  return null;
}
