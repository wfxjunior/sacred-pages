import { normalizeWord } from "@/lib/content/normalize";
import type { DifficultyLevel } from "@/lib/content/types";
import { deriveSeed } from "./engine";
import { alphabetFor, normalizedCharacterFor } from "./engine/alphabet";
import { MAX_GRID_SIZE, MAX_WORDS, MIN_GRID_SIZE } from "./engine/constants";
import { generatePuzzle } from "./engine/generate";
import { createEngineRng, weightedPick } from "./engine/rng";
import { DIFFICULTY_PRESETS, type Grid, type Placement, type PuzzleWord } from "./grid";

// Bridge between a plain word list and a renderable puzzle.
//
// The engine speaks PuzzleWord (display + accent-folded normalized form) and
// returns a Grid of Cells. The WordSearch component is handed `string[]` by its
// callers. This module is the one place that translation happens, so the
// component stays a renderer and the engine stays free of UI concerns.
//
// Determinism is the point: the seed is derived from the word list, the grid
// size and the difficulty, so the same journey produces the same grid on every
// device and on every re-render. Nothing here reads a clock or Math.random.

export type RenderablePuzzle = {
  readonly grid: Grid;
  readonly placements: readonly Placement[];
  /** Caller's words, in caller order, with their normalized forms attached. */
  readonly words: readonly PuzzleWord[];
  /** Normalized forms the engine could not fit — callers may surface these. */
  readonly unplaced: readonly string[];
  readonly seed: number;
};

/**
 * Turns display strings into PuzzleWords.
 *
 * Two things happen here, both deliberate:
 *
 * - The normalized form is recomputed rather than assumed, so "ORAÇÃO" and
 *   "oração" resolve to the same matchable "ORACAO" however the caller
 *   capitalised it.
 * - The display form is upper-cased. A word-search grid is conventionally
 *   uppercase, and the engine faithfully preserves whatever case it is given —
 *   so a lowercase word list would put lowercase letters in the grid among
 *   uppercase filler. The cells carry a CSS `uppercase` rule that would hide
 *   this visually while screen readers still announced the lowercase letter.
 *   Upper-casing keeps accents ("ORAÇÃO"), unlike accent folding.
 */
export function toPuzzleWords(words: readonly string[]): PuzzleWord[] {
  return words.map((display, index) => ({
    id: `w${index}`,
    display: display.toLocaleUpperCase(),
    normalized: normalizeWord(display),
  }));
}

/**
 * A filler-only grid, for when there are no words to place.
 *
 * The engine rightly refuses an empty word list — for an authoring flow that is
 * a bug worth surfacing. Here it is not: this module feeds a React component,
 * and a thrown error would blank the page. The previous implementation returned
 * a grid of random letters in this case, so preserving that keeps a missing
 * word list a cosmetic problem rather than a crash.
 */
function fillerOnlyGrid(size: number, seed: number): Grid {
  const rng = createEngineRng(seed);
  const alphabet = alphabetFor("en");

  return {
    size,
    cells: Array.from({ length: size }, () =>
      Array.from({ length: size }, () => {
        const letter = weightedPick(alphabet, rng).display;
        return {
          display: letter,
          normalized: normalizedCharacterFor(letter),
          isWordCell: false,
        };
      }),
    ),
  };
}

/**
 * Generates the puzzle for a word list.
 *
 * `size` wins over the difficulty preset when given, because existing callers
 * pass an explicit grid size and the visual layout depends on it.
 */
export function buildRenderablePuzzle(input: {
  words: readonly string[];
  size?: number;
  difficulty?: DifficultyLevel;
  /** Overrides the derived seed — pass a stored seed to replay a puzzle exactly. */
  seed?: number;
}): RenderablePuzzle {
  const difficulty: DifficultyLevel = input.difficulty ?? "balanced";
  const preset = DIFFICULTY_PRESETS[difficulty];

  // Clamped rather than validated: a caller passing an out-of-range size is a
  // layout mistake, not a reason to take the page down. The engine still
  // enforces its own bounds for the authoring path.
  const size = Math.min(MAX_GRID_SIZE, Math.max(MIN_GRID_SIZE, input.size ?? preset.gridSize));

  const words = toPuzzleWords(input.words).slice(0, MAX_WORDS);

  // Derived from the normalized words so that a purely cosmetic change (case,
  // accents) does not silently reshuffle a reader's grid mid-journey.
  const seed = input.seed ?? deriveSeed(size, difficulty, ...words.map((word) => word.normalized));

  if (words.length === 0) {
    return { grid: fillerOnlyGrid(size, seed), placements: [], words: [], unplaced: [], seed };
  }

  const output = generatePuzzle({
    words,
    languageCode: "en",
    difficulty,
    gridSize: size,
    directions: preset.directions,
    allowReversed: preset.allowReversed,
    allowDiagonal: preset.directions.some((d) => d.length === 2),
    overlapStrategy: "allowed",
    fillerStrategy: "weighted",
    maxAttempts: 200,
    seed,
  });

  return {
    grid: output.grid,
    placements: output.placements,
    words,
    unplaced: output.unplacedWords.map((word) => word.normalized),
    seed: output.seed,
  };
}
