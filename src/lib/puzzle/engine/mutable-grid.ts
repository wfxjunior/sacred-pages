import {
  DIRECTION_VECTORS,
  coordinateKey,
  isWithinGrid,
  type Coordinate,
  type Direction,
  type Grid,
  type Placement,
} from "../grid";
import { normalizedCharacterFor, type WeightedLetter } from "./alphabet";
import { weightedPick, type Rng } from "./rng";
import type { MutableCell, MutableGrid } from "./types";

// The working grid used during generation.
//
// Cells track which placements occupy them. That bookkeeping is what makes
// backtracking correct: removing a word may only clear a cell if no OTHER word
// still needs that letter there. Without it, undoing an overlapping placement
// would silently punch a hole through a word that is still placed.

const EMPTY = "";

export function createGrid(size: number): MutableGrid {
  const cells: MutableCell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({
      display: EMPTY,
      normalized: EMPTY,
      placementIds: [],
    })),
  );
  return { size, cells };
}

export function cloneGrid(grid: MutableGrid): MutableGrid {
  return {
    size: grid.size,
    cells: grid.cells.map((row) =>
      row.map((cell) => ({
        display: cell.display,
        normalized: cell.normalized,
        placementIds: [...cell.placementIds],
      })),
    ),
  };
}

export function isEmptyCell(cell: MutableCell): boolean {
  return cell.placementIds.length === 0 && cell.normalized === EMPTY;
}

/** Walks a word's path from a start coordinate in one direction. */
export function pathFor(start: Coordinate, direction: Direction, length: number): Coordinate[] {
  const { dr, dc } = DIRECTION_VECTORS[direction];
  return Array.from({ length }, (_, i) => ({
    row: start.row + dr * i,
    col: start.col + dc * i,
  }));
}

export type PlacementCheck =
  | { readonly ok: true; readonly overlapCount: number }
  | { readonly ok: false; readonly reason: "out_of_bounds" | "conflict" | "overlap_forbidden" };

/**
 * Decides whether `normalized` can occupy `path`.
 *
 * A cell may be reused only when it already holds the SAME normalized letter —
 * that is what an intersection is. Any differing letter is a hard conflict.
 */
export function canPlaceWord(
  grid: MutableGrid,
  path: readonly Coordinate[],
  normalized: string,
  allowOverlap: boolean,
): PlacementCheck {
  let overlapCount = 0;

  for (let i = 0; i < path.length; i++) {
    const coordinate = path[i];
    if (!isWithinGrid(coordinate, grid.size)) {
      return { ok: false, reason: "out_of_bounds" };
    }

    const cell = grid.cells[coordinate.row][coordinate.col];
    if (isEmptyCell(cell)) continue;

    if (cell.normalized !== normalized[i]) {
      return { ok: false, reason: "conflict" };
    }

    if (!allowOverlap) {
      return { ok: false, reason: "overlap_forbidden" };
    }
    overlapCount++;
  }

  return { ok: true, overlapCount };
}

/**
 * Writes a word into the grid. Mutates `grid` — callers own the copy.
 *
 * The DISPLAY character is written from the word's own spelling, so an
 * intersection between "ORAÇÃO" and "CASA" keeps whichever accented form was
 * written first; both normalize to the same letter, so matching is unaffected.
 */
export function placeWord(
  grid: MutableGrid,
  placementId: string,
  path: readonly Coordinate[],
  displayCharacters: readonly string[],
  normalized: string,
): void {
  for (let i = 0; i < path.length; i++) {
    const { row, col } = path[i];
    const cell = grid.cells[row][col];

    if (isEmptyCell(cell)) {
      cell.display = displayCharacters[i];
      cell.normalized = normalized[i];
    }
    cell.placementIds.push(placementId);
  }
}

/**
 * Undoes a placement. A cell reverts to empty only once no placement claims it.
 */
export function removeWord(
  grid: MutableGrid,
  placementId: string,
  path: readonly Coordinate[],
): void {
  for (const { row, col } of path) {
    const cell = grid.cells[row][col];
    const index = cell.placementIds.lastIndexOf(placementId);
    if (index >= 0) cell.placementIds.splice(index, 1);

    if (cell.placementIds.length === 0) {
      cell.display = EMPTY;
      cell.normalized = EMPTY;
    }
  }
}

/**
 * Fills empty cells with alphabet letters, row-major.
 *
 * Row-major order is part of the determinism contract: the RNG is consumed once
 * per empty cell in a fixed sequence, so the same seed always yields the same
 * filler.
 */
export function fillGrid(grid: MutableGrid, alphabet: readonly WeightedLetter[], rng: Rng): void {
  for (let row = 0; row < grid.size; row++) {
    for (let col = 0; col < grid.size; col++) {
      const cell = grid.cells[row][col];
      if (!isEmptyCell(cell)) continue;

      const letter = weightedPick(alphabet, rng);
      cell.display = letter.display;
      cell.normalized = normalizedCharacterFor(letter.display);
    }
  }
}

/** Converts the working grid into the immutable public shape. */
export function toPublicGrid(grid: MutableGrid): Grid {
  return {
    size: grid.size,
    cells: grid.cells.map((row) =>
      row.map((cell) => ({
        display: cell.display,
        normalized: cell.normalized,
        isWordCell: cell.placementIds.length > 0,
      })),
    ),
  };
}

export type GridValidation = {
  readonly valid: boolean;
  readonly problems: readonly string[];
};

/**
 * Structural check of a finished grid: no empty cells, square shape, and every
 * placement genuinely readable along its path.
 *
 * This runs on every generation. It is cheap relative to the search and catches
 * off-by-one and direction-sign errors that would otherwise ship as an
 * unsolvable puzzle.
 */
export function validateGrid(grid: MutableGrid, placements: readonly Placement[]): GridValidation {
  const problems: string[] = [];

  if (grid.cells.length !== grid.size) {
    problems.push(`grid has ${grid.cells.length} rows, expected ${grid.size}`);
  }

  for (let row = 0; row < grid.cells.length; row++) {
    if (grid.cells[row].length !== grid.size) {
      problems.push(`row ${row} has ${grid.cells[row].length} cells, expected ${grid.size}`);
      continue;
    }
    for (let col = 0; col < grid.size; col++) {
      const cell = grid.cells[row][col];
      if (cell.display === EMPTY || cell.normalized === EMPTY) {
        problems.push(`cell ${row},${col} is empty`);
      }
    }
  }

  const seen = new Set<string>();
  for (const placement of placements) {
    if (seen.has(placement.wordId)) {
      problems.push(`word ${placement.normalized} placed more than once`);
    }
    seen.add(placement.wordId);

    if (placement.path.length !== placement.normalized.length) {
      problems.push(
        `${placement.normalized}: path length ${placement.path.length} does not match word length`,
      );
      continue;
    }

    for (let i = 0; i < placement.path.length; i++) {
      const coordinate = placement.path[i];
      if (!isWithinGrid(coordinate, grid.size)) {
        problems.push(`${placement.normalized}: cell ${coordinateKey(coordinate)} is off-grid`);
        break;
      }
      const actual = grid.cells[coordinate.row][coordinate.col].normalized;
      if (actual !== placement.normalized[i]) {
        problems.push(
          `${placement.normalized}: expected "${placement.normalized[i]}" at ${coordinateKey(coordinate)}, found "${actual}"`,
        );
        break;
      }
    }
  }

  return { valid: problems.length === 0, problems };
}
