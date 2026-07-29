import {
  directionOf,
  isWithinGrid,
  pathOf,
  readNormalized,
  type Grid,
  type NormalizedWord,
  type Placement,
  type Selection,
} from "./grid";

// PuzzleValidationService — pure functions that decide whether a user's
// selection is a hit.
//
// This is NOT placement logic: it never decides where words go. It reads a
// grid the engine already produced. That separation is why selection checking
// can ship (and be tested) before the algorithm exists.

export type ValidationResult =
  | { readonly kind: "match"; readonly word: NormalizedWord; readonly placement?: Placement }
  | { readonly kind: "already_found"; readonly word: NormalizedWord }
  | { readonly kind: "no_match" }
  | { readonly kind: "invalid_line" }
  | { readonly kind: "out_of_bounds" };

export type ValidationInput = {
  readonly grid: Grid;
  readonly selection: Selection;
  /** Normalized forms the reader is looking for. */
  readonly targetWords: readonly NormalizedWord[];
  readonly foundWords: readonly NormalizedWord[];
  /** Optional: supplies the matched placement in the result. */
  readonly placements?: readonly Placement[];
};

/**
 * Validates a selection.
 *
 * A word is accepted whether the reader traced it forwards or backwards,
 * regardless of how the generator placed it — dragging right-to-left over a
 * left-to-right word is a match, because that is what readers expect.
 */
export function validateSelection(input: ValidationInput): ValidationResult {
  const { grid, selection, targetWords, foundWords, placements } = input;

  if (!isWithinGrid(selection.start, grid.size) || !isWithinGrid(selection.end, grid.size)) {
    return { kind: "out_of_bounds" };
  }

  if (directionOf(selection) === null) {
    return { kind: "invalid_line" };
  }

  const forward = readNormalized(grid, selection);
  if (forward.length < 2) return { kind: "no_match" };
  const backward = [...forward].reverse().join("");

  const match = targetWords.find((word) => word === forward || word === backward);
  if (!match) return { kind: "no_match" };

  if (foundWords.includes(match)) {
    return { kind: "already_found", word: match };
  }

  return {
    kind: "match",
    word: match,
    placement: placements?.find((p) => p.normalized === match),
  };
}

/** Completion as a whole percentage. Returns 100 for an empty word list. */
export function completionPercent(
  foundWords: readonly NormalizedWord[],
  targetWords: readonly NormalizedWord[],
): number {
  if (targetWords.length === 0) return 100;
  const found = new Set(foundWords.filter((w) => targetWords.includes(w)));
  return Math.round((found.size / targetWords.length) * 100);
}

export function isComplete(
  foundWords: readonly NormalizedWord[],
  targetWords: readonly NormalizedWord[],
): boolean {
  return targetWords.every((word) => foundWords.includes(word));
}

/**
 * Structural check that a generated puzzle is internally consistent: every
 * placement must actually spell its word in the grid it claims to occupy.
 *
 * Phase 4 runs this against generator output; it catches off-by-one and
 * direction-sign bugs that a visual check would miss.
 */
export function verifyPlacements(
  grid: Grid,
  placements: readonly Placement[],
): { valid: boolean; problems: string[] } {
  const problems: string[] = [];

  for (const placement of placements) {
    const path = pathOf({ start: placement.start, end: placement.end });

    if (path.length !== placement.normalized.length) {
      problems.push(
        `${placement.normalized}: path covers ${path.length} cells but the word has ${placement.normalized.length} letters`,
      );
      continue;
    }

    if (path.some((c) => !isWithinGrid(c, grid.size))) {
      problems.push(`${placement.normalized}: path leaves the grid`);
      continue;
    }

    const actual = path.map((c) => grid.cells[c.row][c.col].normalized).join("");
    if (actual !== placement.normalized) {
      problems.push(`${placement.normalized}: grid reads "${actual}" along its path`);
    }
  }

  return { valid: problems.length === 0, problems };
}
