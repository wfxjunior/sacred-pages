import { normalizeWord } from "@/lib/content/normalize";
import { PuzzleEngineError, type GenerationInput, type GenerationOutput } from "../engine";
import { coordinateKey, type Direction, type PuzzleWord } from "../grid";
import { resolveAlphabet } from "./alphabet";
import { placeWords } from "./backtracking";
import { orderWords, resolveDirections } from "./candidates";
import {
  DEFAULT_MAX_BACKTRACKS,
  ENGINE_VERSION,
  MAX_GRID_SIZE,
  MAX_WORDS,
  MAX_WORD_LENGTH,
  MIN_GRID_SIZE,
  MIN_WORD_LENGTH,
} from "./constants";
import { createGrid, fillGrid, toPublicGrid, validateGrid } from "./mutable-grid";
import { scorePuzzle } from "./quality";
import { createEngineRng, subSeed } from "./rng";
import type {
  FailedWord,
  GenerationMetrics,
  MutableGrid,
  PreparedWord,
  QualityBreakdown,
} from "./types";

// Generation orchestration.
//
// Deterministic by construction: the only entropy is `seed`, and the random
// stream is consumed in a fixed order — placement first, then filling, on
// separate sub-seeds so that adding one word does not reshuffle every filler
// letter.

/**
 * The engine's own richer result. It EXTENDS the Phase 3 `GenerationOutput`
 * rather than replacing it, so existing callers keep working unchanged.
 */
export type EngineResult = GenerationOutput & {
  readonly success: boolean;
  readonly qualityScore: number;
  readonly quality: QualityBreakdown;
  readonly failedWords: readonly FailedWord[];
  readonly metrics: GenerationMetrics;
};

/** Extra knobs beyond the Phase 3 input, all optional and defaulted. */
export type EngineOptions = {
  readonly maxBacktracks?: number;
  /** Injected only by tests that need a fixed duration. */
  readonly now?: () => number;
};

function prepareWords(words: readonly PuzzleWord[]): {
  prepared: PreparedWord[];
  invalid: FailedWord[];
} {
  const prepared: PreparedWord[] = [];
  const invalid: FailedWord[] = [];
  const seen = new Set<string>();

  for (const word of words) {
    // Recomputed rather than trusted: a stale `normalized` field would let
    // display and matching forms drift apart.
    const normalized = normalizeWord(word.display);

    if (normalized.length < MIN_WORD_LENGTH) {
      invalid.push({
        word,
        reason: "invalid_word",
        detail: `"${word.display}" normalizes to "${normalized}", shorter than ${MIN_WORD_LENGTH} letters`,
      });
      continue;
    }
    if (normalized.length > MAX_WORD_LENGTH) {
      invalid.push({
        word,
        reason: "invalid_word",
        detail: `"${word.display}" exceeds ${MAX_WORD_LENGTH} letters`,
      });
      continue;
    }
    if (seen.has(normalized)) {
      invalid.push({
        word,
        reason: "invalid_word",
        detail: `"${word.display}" duplicates another word once accents are folded ("${normalized}")`,
      });
      continue;
    }

    seen.add(normalized);
    prepared.push({
      word,
      normalized,
      display: word.display,
      length: normalized.length,
      required: word.required ?? true,
      weight: word.weight ?? 0,
    });
  }

  return { prepared, invalid };
}

function countCells(grid: MutableGrid): { wordCells: number; intersections: number } {
  let wordCells = 0;
  let intersections = 0;
  for (const row of grid.cells) {
    for (const cell of row) {
      if (cell.placementIds.length > 0) wordCells++;
      if (cell.placementIds.length > 1) intersections++;
    }
  }
  return { wordCells, intersections };
}

/**
 * Generates a puzzle.
 *
 * Throws only for structurally invalid input (rule: totality). Content problems
 * — a word too long, a word that will not fit — are reported in `failedWords`
 * and never silently dropped.
 */
export function generatePuzzle(input: GenerationInput, options: EngineOptions = {}): EngineResult {
  const clock = options.now ?? (() => Date.now());
  const startedAt = clock();

  if (input.gridSize < MIN_GRID_SIZE || input.gridSize > MAX_GRID_SIZE) {
    throw new PuzzleEngineError(
      "grid_too_small",
      `Grid size ${input.gridSize} is outside the supported range ${MIN_GRID_SIZE}-${MAX_GRID_SIZE}`,
    );
  }
  if (input.words.length === 0) {
    throw new PuzzleEngineError("empty_word_list", "At least one word is required");
  }
  if (input.words.length > MAX_WORDS) {
    throw new PuzzleEngineError(
      "invalid_input",
      `${input.words.length} words exceeds the maximum of ${MAX_WORDS}`,
    );
  }

  const directions = resolveDirections({
    directions: input.directions,
    allowReversed: input.allowReversed,
    allowDiagonal: input.allowDiagonal,
  });
  if (directions.length === 0) {
    throw new PuzzleEngineError(
      "invalid_directions",
      "No usable directions remain after applying the reverse and diagonal rules",
    );
  }

  const { prepared, invalid } = prepareWords(input.words);
  const ordered = orderWords(prepared);

  const grid = createGrid(input.gridSize);

  // Two independent streams. Placement and filling must not share one, or
  // placing an extra word would shift every filler letter in the grid.
  const placementRng = createEngineRng(subSeed(input.seed, "placement"));
  const fillRng = createEngineRng(subSeed(input.seed, "filler"));

  const outcome = placeWords({
    grid,
    words: ordered,
    directions,
    allowOverlap: input.overlapStrategy !== "none",
    maxAttempts: input.maxAttempts,
    maxBacktracks: options.maxBacktracks ?? DEFAULT_MAX_BACKTRACKS,
    rng: placementRng,
  });

  const { wordCells, intersections } = countCells(grid);

  const alphabet = resolveAlphabet({
    strategy: input.fillerStrategy,
    languageCode: input.languageCode,
    displayWords: prepared.map((word) => word.display),
    customAlphabet: input.customAlphabet,
  });
  fillGrid(grid, alphabet, fillRng);

  const structural = validateGrid(grid, outcome.placements);
  if (!structural.valid) {
    // A structurally broken grid is an engine bug, not a content problem, so it
    // must surface loudly rather than ship as an unsolvable puzzle.
    throw new PuzzleEngineError(
      "invalid_input",
      `Generated grid failed validation: ${structural.problems.slice(0, 3).join("; ")}`,
    );
  }

  const failedWords: FailedWord[] = [...invalid, ...outcome.failed];
  const usedDirections = new Set<Direction>(outcome.placements.map((p) => p.direction));

  const quality = scorePuzzle({
    grid,
    placements: outcome.placements,
    totalWords: input.words.length,
    allowedDirections: directions.length,
    wordCells,
    intersections,
  });

  const durationMs = Math.max(0, clock() - startedAt);

  const metrics: GenerationMetrics = {
    gridSize: input.gridSize,
    totalWords: input.words.length,
    placedWords: outcome.placements.length,
    failedWords: failedWords.length,
    candidatesEvaluated: outcome.candidatesEvaluated,
    backtracks: outcome.backtracks,
    wordCells,
    fillerCells: input.gridSize * input.gridSize - wordCells,
    intersections,
    directionsUsed: usedDirections.size,
    durationMs,
  };

  return {
    grid: toPublicGrid(grid),
    placements: outcome.placements,
    unplacedWords: failedWords.map((failure) => failure.word),
    seed: input.seed,
    engineVersion: ENGINE_VERSION,
    metadata: {
      attempts: outcome.candidatesEvaluated,
      durationMs,
      placedCount: outcome.placements.length,
      unplacedCount: failedWords.length,
      fillerStrategy: input.fillerStrategy,
    },
    success: failedWords.length === 0,
    qualityScore: quality.score,
    quality,
    failedWords,
    metrics,
  };
}

/** Cell keys covered by at least one placement — for renderers. */
export function occupiedCells(result: EngineResult): Set<string> {
  const cells = new Set<string>();
  for (const placement of result.placements) {
    for (const coordinate of placement.path) cells.add(coordinateKey(coordinate));
  }
  return cells;
}
