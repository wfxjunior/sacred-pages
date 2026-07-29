import type { DifficultyLevel } from "@/lib/content/types";

// Grid model — TYPES AND PURE HELPERS ONLY.
//
// No placement logic lives here. The generation algorithm arrives in Phase 4
// and must satisfy the contract in ./engine.ts; these types are the vocabulary
// both sides speak.

// ---------------------------------------------------------------------------
// Coordinates and directions
// ---------------------------------------------------------------------------

/** Zero-based grid position. Row 0 is the top row. */
export type Coordinate = {
  readonly row: number;
  readonly col: number;
};

/**
 * Compass direction vectors — the canonical storage form, matching
 * puzzle_templates.allowed_directions.
 *
 * E is left-to-right, S is top-to-bottom; the rest follow screen orientation
 * (N decreases row, S increases row).
 */
export const DIRECTIONS = ["E", "W", "N", "S", "NE", "NW", "SE", "SW"] as const;
export type Direction = (typeof DIRECTIONS)[number];

export const DIRECTION_VECTORS: Readonly<Record<Direction, { dr: number; dc: number }>> = {
  E: { dr: 0, dc: 1 },
  W: { dr: 0, dc: -1 },
  N: { dr: -1, dc: 0 },
  S: { dr: 1, dc: 0 },
  NE: { dr: -1, dc: 1 },
  NW: { dr: -1, dc: -1 },
  SE: { dr: 1, dc: 1 },
  SW: { dr: 1, dc: -1 },
};

/**
 * The six-category model used by editors and difficulty copy
 * ("no reversed words", "diagonals allowed"). It is a VIEW over the eight
 * vectors above, never a second source of truth — see toDirections /
 * toCategories for the mapping.
 */
export const DIRECTION_CATEGORIES = [
  "horizontal",
  "vertical",
  "diagonal",
  "reverse_horizontal",
  "reverse_vertical",
  "reverse_diagonal",
] as const;
export type DirectionCategory = (typeof DIRECTION_CATEGORIES)[number];

const CATEGORY_TO_DIRECTIONS: Readonly<Record<DirectionCategory, readonly Direction[]>> = {
  horizontal: ["E"],
  vertical: ["S"],
  diagonal: ["SE", "NE"],
  reverse_horizontal: ["W"],
  reverse_vertical: ["N"],
  reverse_diagonal: ["NW", "SW"],
};

export function toDirections(categories: readonly DirectionCategory[]): Direction[] {
  const set = new Set<Direction>();
  for (const category of categories) {
    for (const direction of CATEGORY_TO_DIRECTIONS[category]) set.add(direction);
  }
  return [...set];
}

export function toCategories(directions: readonly Direction[]): DirectionCategory[] {
  const set = new Set<DirectionCategory>();
  for (const category of DIRECTION_CATEGORIES) {
    if (CATEGORY_TO_DIRECTIONS[category].some((d) => directions.includes(d))) {
      set.add(category);
    }
  }
  return [...set];
}

/** Directions that move along a diagonal. */
export function isDiagonal(direction: Direction): boolean {
  const { dr, dc } = DIRECTION_VECTORS[direction];
  return dr !== 0 && dc !== 0;
}

/**
 * Directions considered "reversed" — those a reader would trace right-to-left
 * or bottom-to-top. Used to honour a template's allow_reversed rule.
 */
export function isReversed(direction: Direction): boolean {
  const { dr, dc } = DIRECTION_VECTORS[direction];
  return dc < 0 || (dc === 0 && dr < 0);
}

export function opposite(direction: Direction): Direction {
  const { dr, dc } = DIRECTION_VECTORS[direction];
  const found = DIRECTIONS.find(
    (d) => DIRECTION_VECTORS[d].dr === -dr && DIRECTION_VECTORS[d].dc === -dc,
  );
  // Every vector in the table has its inverse in the table.
  return found ?? direction;
}

// ---------------------------------------------------------------------------
// Words
// ---------------------------------------------------------------------------

/** Accent-folded, uppercase form the engine matches against ("ORACAO"). */
export type NormalizedWord = string;

/** Reader-facing spelling with accents intact ("ORAÇÃO"). */
export type DisplayWord = string;

export type PuzzleWord = {
  readonly id: string;
  readonly display: DisplayWord;
  readonly normalized: NormalizedWord;
  readonly explanation?: string | null;
  /**
   * Phase 4 additions, both optional so existing callers are unaffected.
   * `required` words are placed before optional ones; `weight` breaks ties
   * within a group (higher first).
   */
  readonly required?: boolean;
  readonly weight?: number;
};

// ---------------------------------------------------------------------------
// Cells and grid
// ---------------------------------------------------------------------------

export type Cell = {
  /** Character shown to the reader — may carry an accent. */
  readonly display: string;
  /** Character used for matching — accent-folded. */
  readonly normalized: string;
  /** False when the cell is filler rather than part of a placed word. */
  readonly isWordCell: boolean;
};

export type Grid = {
  readonly size: number;
  /** Row-major: cells[row][col]. */
  readonly cells: readonly (readonly Cell[])[];
};

/** Where one word ended up. `path` is start → end inclusive. */
export type Placement = {
  readonly wordId: string;
  readonly normalized: NormalizedWord;
  readonly start: Coordinate;
  readonly end: Coordinate;
  readonly direction: Direction;
  readonly reversed: boolean;
  readonly path: readonly Coordinate[];
};

/** A user's straight-line drag or keyboard selection. */
export type Selection = {
  readonly start: Coordinate;
  readonly end: Coordinate;
};

// ---------------------------------------------------------------------------
// Pure geometry helpers (no placement decisions — just coordinate maths)
// ---------------------------------------------------------------------------

export function sameCoordinate(a: Coordinate, b: Coordinate): boolean {
  return a.row === b.row && a.col === b.col;
}

export function isWithinGrid(coordinate: Coordinate, size: number): boolean {
  return (
    coordinate.row >= 0 && coordinate.row < size && coordinate.col >= 0 && coordinate.col < size
  );
}

/**
 * The direction a selection travels, or null when it is not a straight
 * horizontal, vertical or 45-degree line.
 */
export function directionOf(selection: Selection): Direction | null {
  const dr = selection.end.row - selection.start.row;
  const dc = selection.end.col - selection.start.col;

  if (dr === 0 && dc === 0) return null;
  const straight = dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
  if (!straight) return null;

  const stepR = Math.sign(dr);
  const stepC = Math.sign(dc);
  return (
    DIRECTIONS.find(
      (d) => DIRECTION_VECTORS[d].dr === stepR && DIRECTION_VECTORS[d].dc === stepC,
    ) ?? null
  );
}

/** Cells covered by a selection, start → end inclusive, or [] if not straight. */
export function pathOf(selection: Selection): Coordinate[] {
  const direction = directionOf(selection);
  if (!direction) return [];

  const { dr, dc } = DIRECTION_VECTORS[direction];
  const length =
    Math.max(
      Math.abs(selection.end.row - selection.start.row),
      Math.abs(selection.end.col - selection.start.col),
    ) + 1;

  return Array.from({ length }, (_, i) => ({
    row: selection.start.row + dr * i,
    col: selection.start.col + dc * i,
  }));
}

/** Where a word of `length` would end, starting at `start` heading `direction`. */
export function endCoordinate(start: Coordinate, direction: Direction, length: number): Coordinate {
  const { dr, dc } = DIRECTION_VECTORS[direction];
  return { row: start.row + dr * (length - 1), col: start.col + dc * (length - 1) };
}

/** True when a word of `length` fits inside the grid from `start`. */
export function fitsInGrid(
  start: Coordinate,
  direction: Direction,
  length: number,
  size: number,
): boolean {
  return isWithinGrid(start, size) && isWithinGrid(endCoordinate(start, direction, length), size);
}

/** Reads the normalized letters along a selection. */
export function readNormalized(grid: Grid, selection: Selection): string {
  return pathOf(selection)
    .filter((c) => isWithinGrid(c, grid.size))
    .map((c) => grid.cells[c.row][c.col].normalized)
    .join("");
}

/** Serializes a grid to the row-string form stored in puzzle_instances. */
export function toRows(grid: Grid, form: "display" | "normalized"): string[] {
  return grid.cells.map((row) => row.map((cell) => cell[form]).join(""));
}

/** Rebuilds a grid from the two stored row-string arrays. */
export function fromRows(
  displayRows: readonly string[],
  normalizedRows: readonly string[],
  wordCells: ReadonlySet<string> = new Set(),
): Grid {
  const size = displayRows.length;
  const cells = displayRows.map((row, r) =>
    [...row].map((display, c) => ({
      display,
      normalized: normalizedRows[r]?.[c] ?? display,
      isWordCell: wordCells.has(coordinateKey({ row: r, col: c })),
    })),
  );
  return { size, cells };
}

/** Stable string key for a coordinate — for Sets and Maps. */
export function coordinateKey(coordinate: Coordinate): string {
  return `${coordinate.row},${coordinate.col}`;
}

/** All coordinates covered by the given placements. */
export function placementCells(placements: readonly Placement[]): Set<string> {
  const set = new Set<string>();
  for (const placement of placements) {
    for (const coordinate of placement.path) set.add(coordinateKey(coordinate));
  }
  return set;
}

// ---------------------------------------------------------------------------
// Difficulty presets (data only — the engine decides how to honour them)
// ---------------------------------------------------------------------------

export type DifficultyPreset = {
  readonly gridSize: number;
  readonly maxWords: number;
  readonly directions: readonly Direction[];
  readonly allowReversed: boolean;
};

export const DIFFICULTY_PRESETS: Readonly<Record<DifficultyLevel, DifficultyPreset>> = {
  gentle: { gridSize: 10, maxWords: 6, directions: ["E", "S"], allowReversed: false },
  balanced: { gridSize: 12, maxWords: 8, directions: ["E", "S", "SE", "NE"], allowReversed: false },
  challenging: { gridSize: 14, maxWords: 10, directions: [...DIRECTIONS], allowReversed: true },
  expert: { gridSize: 16, maxWords: 12, directions: [...DIRECTIONS], allowReversed: true },
};
