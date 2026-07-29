import type { Direction, Placement } from "../grid";
import { isReversed } from "../grid";
import { generateCandidates } from "./candidates";
import { placeWord, removeWord } from "./mutable-grid";
import type { MutableGrid } from "./types";
import type { Rng } from "./rng";
import type { Candidate, FailedWord, PreparedWord, SearchOutcome } from "./types";

// The placement search.
//
// Strategy, in order of preference:
//
//   1. Depth-first search with backtracking, attempting to place EVERY word.
//      Bounded by maxAttempts (candidates per word) and maxBacktracks (undos
//      across the whole run) so it always terminates.
//
//   2. If that budget is exhausted, fall back to a greedy pass that places what
//      it can and reports the rest.
//
// The fallback is what makes the engine total. A puzzle with nine of ten words
// is publishable with a warning; a generator that throws is not.

type SearchContext = {
  readonly grid: MutableGrid;
  readonly directions: readonly Direction[];
  readonly allowOverlap: boolean;
  readonly maxAttempts: number;
  readonly maxBacktracks: number;
  readonly rng: Rng;
  usedDirections: Set<Direction>;
  candidatesEvaluated: number;
  backtracks: number;
};

function toPlacement(word: PreparedWord, candidate: Candidate): Placement {
  return {
    wordId: word.word.id,
    normalized: word.normalized,
    start: candidate.start,
    end: candidate.end,
    direction: candidate.direction,
    reversed: isReversed(candidate.direction),
    path: candidate.path,
  };
}

/** Display characters aligned to the word's path, one per cell. */
function displayCharacters(word: PreparedWord): string[] {
  const characters = [...word.display];
  // The display spelling can differ in length from the normalized form when the
  // source contained spaces or punctuation. The normalized form is the source
  // of truth for cell count, so pad or trim to match it exactly.
  if (characters.length === word.length) return characters;
  return Array.from({ length: word.length }, (_, i) => characters[i] ?? word.normalized[i]);
}

/**
 * Depth-first placement with backtracking.
 * Returns the placements on success, or null when the budget runs out.
 */
function search(
  words: readonly PreparedWord[],
  index: number,
  placed: Placement[],
  context: SearchContext,
): Placement[] | null {
  if (index >= words.length) return [...placed];

  const word = words[index];
  const candidates = generateCandidates({
    grid: context.grid,
    word,
    directions: context.directions,
    allowOverlap: context.allowOverlap,
    usedDirections: context.usedDirections,
    rng: context.rng,
  });

  const attempts = Math.min(candidates.length, context.maxAttempts);

  for (let i = 0; i < attempts; i++) {
    if (context.backtracks > context.maxBacktracks) return null;

    const candidate = candidates[i];
    context.candidatesEvaluated++;

    const placement = toPlacement(word, candidate);
    placeWord(
      context.grid,
      placement.wordId,
      candidate.path,
      displayCharacters(word),
      word.normalized,
    );

    const directionWasNew = !context.usedDirections.has(candidate.direction);
    if (directionWasNew) context.usedDirections.add(candidate.direction);
    placed.push(placement);

    const result = search(words, index + 1, placed, context);
    if (result) return result;

    // Undo, restoring every piece of state this frame changed.
    placed.pop();
    if (directionWasNew) context.usedDirections.delete(candidate.direction);
    removeWord(context.grid, placement.wordId, candidate.path);
    context.backtracks++;
  }

  return null;
}

/**
 * Greedy fallback: place each word in its best available position, skip the
 * ones that do not fit, and report them. Never backtracks, so it always
 * terminates in a single pass.
 */
function greedy(words: readonly PreparedWord[], context: SearchContext): SearchOutcome {
  const placements: Placement[] = [];
  const failed: FailedWord[] = [];

  for (const word of words) {
    if (word.length > context.grid.size) {
      failed.push({
        word: word.word,
        reason: "too_long_for_grid",
        detail: `"${word.display}" needs ${word.length} cells but the grid is ${context.grid.size} wide`,
      });
      continue;
    }

    const candidates = generateCandidates({
      grid: context.grid,
      word,
      directions: context.directions,
      allowOverlap: context.allowOverlap,
      usedDirections: context.usedDirections,
      rng: context.rng,
      limit: 1,
    });
    context.candidatesEvaluated++;

    if (candidates.length === 0) {
      failed.push({
        word: word.word,
        reason: "no_valid_candidates",
        detail: `No position remained for "${word.display}" once the other words were placed`,
      });
      continue;
    }

    const placement = toPlacement(word, candidates[0]);
    placeWord(
      context.grid,
      placement.wordId,
      candidates[0].path,
      displayCharacters(word),
      word.normalized,
    );
    context.usedDirections.add(candidates[0].direction);
    placements.push(placement);
  }

  return {
    placements,
    failed,
    candidatesEvaluated: context.candidatesEvaluated,
    backtracks: context.backtracks,
  };
}

/**
 * Places as many words as possible.
 *
 * Words longer than the grid are rejected up front rather than wasted on the
 * search — no amount of backtracking makes a 20-letter word fit a 12-cell grid.
 */
export function placeWords(input: {
  grid: MutableGrid;
  words: readonly PreparedWord[];
  directions: readonly Direction[];
  allowOverlap: boolean;
  maxAttempts: number;
  maxBacktracks: number;
  rng: Rng;
}): SearchOutcome {
  const impossible: FailedWord[] = [];
  const feasible: PreparedWord[] = [];

  for (const word of input.words) {
    if (word.length > input.grid.size) {
      impossible.push({
        word: word.word,
        reason: "too_long_for_grid",
        detail: `"${word.display}" needs ${word.length} cells but the grid is ${input.grid.size} wide`,
      });
    } else {
      feasible.push(word);
    }
  }

  const context: SearchContext = {
    grid: input.grid,
    directions: input.directions,
    allowOverlap: input.allowOverlap,
    maxAttempts: input.maxAttempts,
    maxBacktracks: input.maxBacktracks,
    rng: input.rng,
    usedDirections: new Set<Direction>(),
    candidatesEvaluated: 0,
    backtracks: 0,
  };

  const complete = search(feasible, 0, [], context);
  if (complete) {
    return {
      placements: complete,
      failed: impossible,
      candidatesEvaluated: context.candidatesEvaluated,
      backtracks: context.backtracks,
    };
  }

  // The search exhausted its budget and left the grid clean (every frame undoes
  // itself), so the greedy pass starts from the same empty grid.
  const fallback = greedy(feasible, context);
  return {
    placements: fallback.placements,
    failed: [...impossible, ...fallback.failed],
    candidatesEvaluated: fallback.candidatesEvaluated,
    backtracks: fallback.backtracks,
  };
}
