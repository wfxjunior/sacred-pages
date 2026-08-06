import { normalizeWord } from "@/lib/content/normalize";
import {
  isTerminalGameStatus,
  seededRandomFromString,
  shuffleWithRandom,
  type GameDifficulty,
} from "@/lib/games";
import type {
  FinishVerseRound,
  FinishVerseSettings,
  FinishVerseState,
  FinishVerseSubmitOutcome,
  VerseBankEntry,
  VersePassage,
  VerseSlotReview,
  VerseToken,
} from "./types";

// Pure Finish the Verse domain. State in, state out; no clock, no Math.random.
//
// The pedagogy is progressive fading — the proven memorization method: the
// same verse hides more of itself as difficulty rises, until expert asks for
// most of it from memory. Blanks are chosen deterministically per day, so one
// day's practice is one day's puzzle everywhere.

// gentle      — a fifth hidden, unlimited attempts, hint on.
// balanced    — a third hidden, a few attempts, hint on.
// challenging — half hidden, first letters ghosted in the blanks.
// expert      — three quarters hidden, fewest attempts, no hint.
export const FINISH_VERSE_DIFFICULTY_PRESETS: Record<GameDifficulty, FinishVerseSettings> = {
  gentle: {
    hiddenRatio: 0.2,
    maxHidden: 6,
    showInitialLetter: false,
    bankExtras: 2,
    maximumIncorrectAttempts: null,
    hintAvailable: true,
  },
  balanced: {
    hiddenRatio: 0.35,
    maxHidden: 8,
    showInitialLetter: false,
    bankExtras: 3,
    maximumIncorrectAttempts: 5,
    hintAvailable: true,
  },
  challenging: {
    hiddenRatio: 0.5,
    maxHidden: 10,
    showInitialLetter: true,
    bankExtras: 4,
    maximumIncorrectAttempts: 4,
    hintAvailable: true,
  },
  expert: {
    hiddenRatio: 0.75,
    maxHidden: 12,
    showInitialLetter: false,
    bankExtras: 5,
    maximumIncorrectAttempts: 3,
    hintAvailable: false,
  },
};

export function resolveFinishVerseSettings(difficulty: GameDifficulty): FinishVerseSettings {
  return FINISH_VERSE_DIFFICULTY_PRESETS[difficulty];
}

/** Splits a verse into display tokens, punctuation attached to its word. */
export function tokenizeVerse(text: string): VerseToken[] {
  return text
    .split(/\s+/)
    .filter((piece) => piece.length > 0)
    .map((piece) => {
      const matchable = normalizeWord(piece);
      return { text: piece, matchable: matchable.length > 0 ? matchable : null };
    });
}

/**
 * Builds one playable round for a verse.
 *
 * Hidden slots: a deterministic seeded sample of the verse's word tokens,
 * spread by shuffle, capped by the settings, never the reference and never
 * pure punctuation. Distractors come from the other verses of the pool so
 * every bank word sounds like Scripture, not filler.
 */
export function buildFinishVerseRound(
  passage: VersePassage,
  settings: FinishVerseSettings,
  distractorPool: readonly string[],
  seedKey: string,
): FinishVerseRound {
  const tokens = tokenizeVerse(passage.text);
  const wordIndexes = tokens
    .map((token, index) => (token.matchable ? index : -1))
    .filter((index) => index >= 0);

  const random = seededRandomFromString(`verse:${seedKey}:${passage.reference}`);
  const hiddenCount = Math.max(
    1,
    Math.min(settings.maxHidden, Math.round(wordIndexes.length * settings.hiddenRatio)),
  );
  const hiddenSlots = shuffleWithRandom(wordIndexes, random)
    .slice(0, hiddenCount)
    .sort((a, b) => a - b);

  const hiddenWords = hiddenSlots.map((slot) => tokens[slot]!.matchable!);
  const hiddenSet = new Set(hiddenWords);
  const extras = shuffleWithRandom(
    [...new Set(distractorPool.map((w) => normalizeWord(w)))].filter(
      (w) => w.length > 1 && !hiddenSet.has(w),
    ),
    random,
  ).slice(0, settings.bankExtras);

  const bank = shuffleWithRandom([...hiddenWords, ...extras], random).map((word, id) => ({
    id,
    word,
  }));

  return {
    reference: passage.reference,
    journeyTitle: passage.journeyTitle,
    tokens,
    hiddenSlots,
    bank,
  };
}

export function createInitialFinishVerseState(round: FinishVerseRound): FinishVerseState {
  return {
    placed: round.hiddenSlots.map(() => null),
    incorrectAttempts: 0,
    hintsUsed: 0,
    status: "not_started",
  };
}

function bankEntryAvailable(state: FinishVerseState, id: number): boolean {
  return !state.placed.includes(id);
}

/** Places a bank chip into the first empty slot (reading order). */
export function placeBankEntry(
  state: FinishVerseState,
  round: FinishVerseRound,
  bankId: number,
): FinishVerseState {
  if (isTerminalGameStatus(state.status)) return state;
  if (!round.bank.some((entry) => entry.id === bankId)) return state;
  if (!bankEntryAvailable(state, bankId)) return state;
  const slot = state.placed.indexOf(null);
  if (slot === -1) return state;
  const placed = [...state.placed];
  placed[slot] = bankId;
  return { ...state, placed, status: "in_progress" };
}

/** Places the first available bank chip starting with a typed letter. */
export function placeByChar(
  state: FinishVerseState,
  round: FinishVerseRound,
  char: string,
): FinishVerseState {
  const wanted = normalizeWord(char);
  if (wanted.length !== 1) return state;
  const entry = round.bank.find(
    (candidate) => bankEntryAvailable(state, candidate.id) && candidate.word.startsWith(wanted),
  );
  return entry ? placeBankEntry(state, round, entry.id) : state;
}

/** Empties one slot, returning its chip to the bank. */
export function clearSlot(state: FinishVerseState, slotIndex: number): FinishVerseState {
  if (isTerminalGameStatus(state.status)) return state;
  if (slotIndex < 0 || slotIndex >= state.placed.length) return state;
  if (state.placed[slotIndex] == null) return state;
  const placed = [...state.placed];
  placed[slotIndex] = null;
  return { ...state, placed };
}

/** Empties the last filled slot in reading order. */
export function removeLastPlacement(state: FinishVerseState): FinishVerseState {
  if (isTerminalGameStatus(state.status)) return state;
  const last = state.placed.reduce<number>(
    (found, value, index) => (value != null ? index : found),
    -1,
  );
  return last === -1 ? state : clearSlot(state, last);
}

export function clearAllPlacements(state: FinishVerseState): FinishVerseState {
  if (isTerminalGameStatus(state.status)) return state;
  return { ...state, placed: state.placed.map(() => null) };
}

function slotWord(round: FinishVerseRound, slotIndex: number): string {
  return round.tokens[round.hiddenSlots[slotIndex]!]!.matchable!;
}

function bankWord(round: FinishVerseRound, id: number): string {
  return round.bank.find((entry) => entry.id === id)!.word;
}

/**
 * Checks the verse. On a wrong attempt the correct placements survive and the
 * wrong ones return to the bank — honest feedback that never wipes progress.
 */
export function submitFinishVerse(
  state: FinishVerseState,
  round: FinishVerseRound,
  settings: FinishVerseSettings,
): FinishVerseSubmitOutcome {
  if (state.status === "revealed") return { state, result: "solution_revealed" };
  if (state.status === "completed" || state.status === "failed") {
    return { state, result: "already_completed" };
  }
  if (state.placed.some((value) => value == null)) return { state, result: "incomplete" };

  const slotCorrect = state.placed.map(
    (id, slotIndex) => bankWord(round, id!) === slotWord(round, slotIndex),
  );
  if (slotCorrect.every(Boolean)) {
    return { state: { ...state, status: "completed" }, result: "correct", slotCorrect };
  }

  const incorrectAttempts = state.incorrectAttempts + 1;
  const limit = settings.maximumIncorrectAttempts;
  const failed = limit != null && incorrectAttempts >= limit;
  return {
    state: {
      ...state,
      placed: state.placed.map((id, slotIndex) => (slotCorrect[slotIndex] ? id : null)),
      incorrectAttempts,
      status: failed ? "failed" : "in_progress",
    },
    result: "incorrect",
    slotCorrect,
  };
}

/**
 * Fills the first empty or wrong slot with its true word — one honest step,
 * deterministic (lowest matching available bank id). Completing the verse via
 * hints ends as completed, with hintsUsed telling the story.
 */
export function applyFinishVerseHint(
  state: FinishVerseState,
  round: FinishVerseRound,
): FinishVerseState {
  if (isTerminalGameStatus(state.status)) return state;

  let target = -1;
  for (let slotIndex = 0; slotIndex < state.placed.length; slotIndex += 1) {
    const id = state.placed[slotIndex];
    if (id == null || bankWord(round, id) !== slotWord(round, slotIndex)) {
      target = slotIndex;
      break;
    }
  }
  if (target === -1) return state;

  const placed = [...state.placed];
  placed[target] = null;
  const wanted = slotWord(round, target);
  const entry = round.bank.find(
    (candidate) => !placed.includes(candidate.id) && candidate.word === wanted,
  );
  if (!entry) return state;
  placed[target] = entry.id;

  const complete = placed.every(
    (id, slotIndex) => id != null && bankWord(round, id) === slotWord(round, slotIndex),
  );
  return {
    ...state,
    placed,
    hintsUsed: state.hintsUsed + 1,
    status: complete ? "completed" : "in_progress",
  };
}

export function revealFinishVerse(
  state: FinishVerseState,
  round: FinishVerseRound,
): FinishVerseState {
  if (state.status === "completed" || state.status === "revealed") return state;
  const used: number[] = [];
  const placed = round.hiddenSlots.map((_, slotIndex) => {
    const wanted = slotWord(round, slotIndex);
    const entry = round.bank.find(
      (candidate) => !used.includes(candidate.id) && candidate.word === wanted,
    );
    if (!entry) return null;
    used.push(entry.id);
    return entry.id;
  });
  return { ...state, placed, status: "revealed" };
}

export function resetFinishVerse(round: FinishVerseRound): FinishVerseState {
  return createInitialFinishVerseState(round);
}

/** Physical-keyboard mapping, pure and testable. */
export function mapFinishVerseKey(
  key: string,
): { type: "char"; char: string } | { type: "remove" } | { type: "submit" } | null {
  if (key === "Backspace") return { type: "remove" };
  if (key === "Enter") return { type: "submit" };
  if (key.length === 1 && normalizeWord(key).length === 1) return { type: "char", char: key };
  return null;
}

/** How many bank chips are still unplaced — the UI's "remaining" counter. */
export function availableBankEntries(
  state: FinishVerseState,
  round: FinishVerseRound,
): VerseBankEntry[] {
  return round.bank.filter((entry) => bankEntryAvailable(state, entry.id));
}

/**
 * What the reader got right and wrong, slot by slot — the material for the
 * end-of-round review.
 *
 * Takes the placements to judge explicitly rather than reading them from the
 * state, because the interesting array is the reader's own last attempt: by
 * the time a round is revealed, state.placed already holds the solution.
 */
export function reviewFinishVerse(
  round: FinishVerseRound,
  placed: readonly (number | null)[],
): VerseSlotReview[] {
  return round.hiddenSlots.map((tokenIndex, slotIndex) => {
    const truth = round.tokens[tokenIndex]!;
    const id = placed[slotIndex] ?? null;
    // Looked up defensively rather than through bankWord: a stale snapshot
    // must produce an "empty" slot, never a crash mid-review.
    const placedWord = id == null ? null : (round.bank.find((e) => e.id === id)?.word ?? null);
    const status: VerseSlotReview["status"] =
      placedWord == null ? "empty" : placedWord === truth.matchable ? "correct" : "wrong";
    return {
      slotIndex,
      tokenIndex,
      correctText: truth.text,
      correctWord: truth.matchable!,
      placedWord,
      status,
    };
  });
}

/** Counts of the review, for the summary line. */
export function summarizeFinishVerseReview(review: readonly VerseSlotReview[]): {
  correct: number;
  wrong: number;
  empty: number;
  total: number;
} {
  return {
    correct: review.filter((slot) => slot.status === "correct").length,
    wrong: review.filter((slot) => slot.status === "wrong").length,
    empty: review.filter((slot) => slot.status === "empty").length,
    total: review.length,
  };
}
