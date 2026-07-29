import type { PuzzleEngine } from "../engine";
import { toRows, type Grid, type Placement } from "../grid";
import { ENGINE_VERSION } from "./constants";
import { generatePuzzle, type EngineOptions, type EngineResult } from "./generate";

// Public engine surface.
//
// `wordSearchEngine` satisfies the Phase 3 `PuzzleEngine` contract, so it drops
// into PuzzleInstanceService with no call-site changes. Everything else here is
// additive.

export const wordSearchEngine: PuzzleEngine = {
  version: ENGINE_VERSION,
  generate: (input) => generatePuzzle(input),
};

/** Same engine, with the extended result (quality, metrics, failure reasons). */
export function generate(
  input: Parameters<typeof generatePuzzle>[0],
  options?: EngineOptions,
): EngineResult {
  return generatePuzzle(input, options);
}

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

/** The persisted shape, matching the puzzle_instances columns. */
export type SerializedPuzzle = {
  readonly gridSize: number;
  readonly gridRows: readonly string[];
  readonly normalizedGridRows: readonly string[];
  readonly placements: readonly Placement[];
  readonly seed: number;
  readonly engineVersion: string;
};

export function serializePuzzle(result: EngineResult): SerializedPuzzle {
  return {
    gridSize: result.grid.size,
    gridRows: toRows(result.grid, "display"),
    normalizedGridRows: toRows(result.grid, "normalized"),
    placements: result.placements,
    seed: result.seed,
    engineVersion: result.engineVersion,
  };
}

/**
 * Rebuilds a renderable grid from persisted rows.
 *
 * Deliberately does NOT re-run generation: replaying a stored puzzle must
 * return exactly what the reader saw before, even if the engine has since
 * changed.
 */
export function deserializePuzzle(input: SerializedPuzzle): {
  readonly grid: Grid;
  readonly placements: readonly Placement[];
} {
  const occupied = new Set<string>();
  for (const placement of input.placements) {
    for (const coordinate of placement.path) occupied.add(`${coordinate.row},${coordinate.col}`);
  }

  const grid: Grid = {
    size: input.gridSize,
    cells: input.gridRows.map((row, r) =>
      [...row].map((display, c) => ({
        display,
        normalized: input.normalizedGridRows[r]?.[c] ?? display,
        isWordCell: occupied.has(`${r},${c}`),
      })),
    ),
  };

  return { grid, placements: input.placements };
}

export { ENGINE_VERSION } from "./constants";
export {
  MAX_GRID_SIZE,
  MAX_WORDS,
  MIN_GRID_SIZE,
  QUALITY_THRESHOLDS,
  qualityBand,
  type QualityBand,
} from "./constants";
export { generatePuzzle, occupiedCells, type EngineOptions, type EngineResult } from "./generate";
export { isPublishable, scorePuzzle } from "./quality";
export {
  generateHint,
  hintsRemaining,
  nextHintKind,
  type Hint,
  type HintKind,
  type HintPolicy,
  type HintResult,
} from "./hints";
export {
  gridFromStored,
  replaySelections,
  solutionPaths,
  verifyClaimedSolution,
  verifyStoredPuzzle,
  type SolutionVerification,
} from "./solution";
export { alphabetFor, resolveAlphabet, type WeightedLetter } from "./alphabet";
export { validateGrid } from "./mutable-grid";
export type { FailedWord, FailureReason, GenerationMetrics, QualityBreakdown } from "./types";
