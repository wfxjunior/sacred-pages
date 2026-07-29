import type { Coordinate, Direction, Placement, PuzzleWord } from "../grid";

// Engine-internal types.
//
// The public vocabulary (Coordinate {row, col}, Direction 'E'|'W'|…, Grid,
// Placement) is defined in ../grid.ts and is deliberately reused rather than
// re-invented — see word-search-engine-decisions.md, decision D1.

/**
 * A grid cell during generation. Unlike the public read-only `Cell`, this
 * tracks WHICH placements occupy it: removing a word during backtracking may
 * only clear a cell when no other word still needs that letter.
 */
export type MutableCell = {
  display: string;
  normalized: string;
  /** Placement ids covering this cell. Empty means filler. */
  placementIds: string[];
};

export type MutableGrid = {
  readonly size: number;
  readonly cells: MutableCell[][];
};

/** One possible way to place one word. */
export type Candidate = {
  readonly start: Coordinate;
  readonly end: Coordinate;
  readonly direction: Direction;
  readonly path: readonly Coordinate[];
  /** Cells where this word would share a letter with an already-placed word. */
  readonly overlapCount: number;
  /** Higher is better; used to order attempts. */
  readonly score: number;
};

/** Why a word could not be placed. Words are never silently dropped. */
export type FailureReason =
  | "too_long_for_grid"
  | "no_valid_candidates"
  | "attempts_exhausted"
  | "backtracks_exhausted"
  | "invalid_word";

export type FailedWord = {
  readonly word: PuzzleWord;
  readonly reason: FailureReason;
  readonly detail: string;
};

/** A word prepared for placement: normalized once, measured once. */
export type PreparedWord = {
  readonly word: PuzzleWord;
  readonly normalized: string;
  readonly display: string;
  readonly length: number;
  readonly required: boolean;
  readonly weight: number;
};

export type GenerationMetrics = {
  readonly gridSize: number;
  readonly totalWords: number;
  readonly placedWords: number;
  readonly failedWords: number;
  /** Candidate placements evaluated across the whole run. */
  readonly candidatesEvaluated: number;
  /** Times the search undid a placement and tried another. */
  readonly backtracks: number;
  /** Cells covered by at least one word. */
  readonly wordCells: number;
  readonly fillerCells: number;
  /** Cells shared by two or more words. */
  readonly intersections: number;
  readonly directionsUsed: number;
  readonly durationMs: number;
};

export type QualityBreakdown = {
  /** 0-100 overall. */
  readonly score: number;
  readonly placement: number;
  readonly overlap: number;
  readonly directionDiversity: number;
  readonly distribution: number;
  readonly density: number;
  readonly warnings: readonly string[];
};

export type SearchOutcome = {
  readonly placements: Placement[];
  readonly failed: FailedWord[];
  readonly candidatesEvaluated: number;
  readonly backtracks: number;
};
