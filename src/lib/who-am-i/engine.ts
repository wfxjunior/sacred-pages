import { normalizeWord } from "@/lib/content/normalize";
import {
  isTerminalGameStatus,
  seededRandomFromString,
  shuffleWithRandom,
  type GameSessionSummary,
} from "@/lib/games";
import { resolveWhoAmISettings } from "./config";
import type { WhoAmIGuessOutcome, WhoAmIQuestion, WhoAmISettings, WhoAmIState } from "./types";

// Pure Who Am I domain. State in, state out; no clock, no Math.random, no DOM.
//
// Matching strategy: guesses match on normalizeWord's folded form (uppercase,
// accents folded, Ñ distinct, punctuation/spaces stripped), against the answer
// and any acceptedAnswers alias — "Simão Pedro" matches "SIMAO PEDRO" matches
// the alias "SIMON PETER" only if the content lists it. Display names are
// never altered.

export function createInitialWhoAmIState(
  question: WhoAmIQuestion,
  settings: WhoAmISettings = resolveWhoAmISettings(question),
): WhoAmIState {
  return {
    questionId: question.id,
    cluesRevealed: Math.min(Math.max(settings.initialClues, 1), question.clues.length),
    incorrectAttempts: 0,
    guesses: [],
    status: "not_started",
  };
}

/**
 * The names shown in option mode: the answer plus enough distractors, in a
 * deterministic per-question order (seeded shuffle) so two devices — or a
 * reload — always show the same list.
 */
export function whoAmIOptions(
  question: WhoAmIQuestion,
  settings: WhoAmISettings = resolveWhoAmISettings(question),
): string[] {
  if (settings.inputMode !== "options") return [];
  const random = seededRandomFromString(question.id);
  const distractors = shuffleWithRandom(question.distractors, random).slice(
    0,
    Math.max(0, settings.optionCount - 1),
  );
  return shuffleWithRandom([question.answer, ...distractors], random);
}

/** Shows the next clue. Clues are this mode's hint mechanism — the count above
 * the initial reveal is what completion reports as hints used. */
export function revealNextWhoAmIClue(state: WhoAmIState, question: WhoAmIQuestion): WhoAmIState {
  if (isTerminalGameStatus(state.status)) return state;
  if (state.cluesRevealed >= question.clues.length) return state;
  return { ...state, cluesRevealed: state.cluesRevealed + 1, status: "in_progress" };
}

function acceptedForms(question: WhoAmIQuestion): string[] {
  return [question.answer, ...(question.acceptedAnswers ?? [])].map(normalizeWord);
}

export function submitWhoAmIGuess(
  state: WhoAmIState,
  question: WhoAmIQuestion,
  guess: string,
  settings: WhoAmISettings = resolveWhoAmISettings(question),
): WhoAmIGuessOutcome {
  if (state.status === "revealed") return { state, result: "solution_revealed" };
  if (state.status === "completed" || state.status === "failed") {
    return { state, result: "already_completed" };
  }

  const normalized = normalizeWord(guess);
  if (normalized.length === 0) return { state, result: "empty" };

  if (acceptedForms(question).includes(normalized)) {
    return { state: { ...state, status: "completed" }, result: "correct" };
  }

  const incorrectAttempts = state.incorrectAttempts + 1;
  const limit = settings.maximumIncorrectAttempts;
  const failed = limit != null && incorrectAttempts >= limit;
  return {
    state: {
      ...state,
      incorrectAttempts,
      guesses: [...state.guesses, normalized],
      status: failed ? "failed" : "in_progress",
    },
    result: "incorrect",
  };
}

/** True when this option was already tried and rejected. */
export function isGuessedWhoAmIOption(state: WhoAmIState, option: string): boolean {
  return state.guesses.includes(normalizeWord(option));
}

/** Shows the answer. Legal from failed too — disclosure, not play. */
export function revealWhoAmISolution(state: WhoAmIState): WhoAmIState {
  if (state.status === "completed" || state.status === "revealed") return state;
  return { ...state, status: "revealed" };
}

export function resetWhoAmI(question: WhoAmIQuestion): WhoAmIState {
  return createInitialWhoAmIState(question);
}

/** The round in the shared platform vocabulary, for completion screens and
 * future persistence/analytics. Clues beyond the initial reveal count as hints. */
export function whoAmISessionSummary(
  state: WhoAmIState,
  question: WhoAmIQuestion,
  settings: WhoAmISettings = resolveWhoAmISettings(question),
): GameSessionSummary {
  const initial = Math.min(Math.max(settings.initialClues, 1), question.clues.length);
  return {
    mode: "who_am_i",
    difficulty: question.difficulty,
    status: state.status,
    attemptsUsed: state.incorrectAttempts + (state.status === "completed" ? 1 : 0),
    hintsUsed: Math.max(0, state.cluesRevealed - initial),
    lettersRevealed: 0,
    durationMs: null,
  };
}
