import { isDiagonal, isReversed, type Direction } from "../grid";
import { CANDIDATE_WEIGHTS, MAX_CANDIDATES_PER_WORD } from "./constants";
import { canPlaceWord, pathFor } from "./mutable-grid";
import type { MutableGrid } from "./types";
import { shuffled, type Rng } from "./rng";
import type { Candidate, PreparedWord } from "./types";

// Candidate generation and ordering.
//
// Determinism note: candidates are enumerated in a fixed loop order, scored by
// a pure function, then sorted with a TOTAL comparator. Ties are broken by
// coordinates and direction, never left to sort stability, so the ordering is
// identical on every engine and platform.

/**
 * Filters the template's directions down to those the flags actually permit.
 * Returns a stable order so candidate enumeration is reproducible.
 */
export function resolveDirections(input: {
  directions: readonly Direction[];
  allowReversed: boolean;
  allowDiagonal: boolean;
}): Direction[] {
  const seen = new Set<Direction>();
  const result: Direction[] = [];

  for (const direction of input.directions) {
    if (seen.has(direction)) continue;
    if (!input.allowDiagonal && isDiagonal(direction)) continue;
    if (!input.allowReversed && isReversed(direction)) continue;
    seen.add(direction);
    result.push(direction);
  }
  return result;
}

/**
 * Scores a candidate placement. Higher is better.
 *
 * Overlap dominates: intersecting words are what distinguish a crafted puzzle
 * from scattered strings. Centrality is a mild preference — words hugging the
 * border are easier to spot and leave the middle empty.
 */
export function scoreCandidate(input: {
  grid: MutableGrid;
  path: readonly { row: number; col: number }[];
  overlapCount: number;
  direction: Direction;
  usedDirections: ReadonlySet<Direction>;
}): number {
  const { grid, path, overlapCount, direction, usedDirections } = input;
  const centre = (grid.size - 1) / 2;

  let distanceSum = 0;
  let edgeCells = 0;
  for (const { row, col } of path) {
    distanceSum += Math.abs(row - centre) + Math.abs(col - centre);
    if (row === 0 || col === 0 || row === grid.size - 1 || col === grid.size - 1) edgeCells++;
  }

  const averageDistance = distanceSum / Math.max(path.length, 1);
  const maxDistance = centre * 2 || 1;
  const centrality = 1 - averageDistance / maxDistance;
  const edgeAvoidance = 1 - edgeCells / Math.max(path.length, 1);

  // Reward directions not yet used, so a puzzle does not end up all-horizontal.
  const varietyBonus = usedDirections.has(direction) ? 0 : 1;

  return (
    overlapCount * CANDIDATE_WEIGHTS.overlap +
    centrality * CANDIDATE_WEIGHTS.centrality +
    varietyBonus * CANDIDATE_WEIGHTS.directionVariety +
    edgeAvoidance * CANDIDATE_WEIGHTS.edgeAvoidance
  );
}

/**
 * Every legal placement for one word, best first.
 *
 * The list is capped: a 32x32 grid in 8 directions yields thousands of
 * positions, and the best few hundred are more than enough. Capping keeps the
 * backtracking search bounded without measurably hurting quality.
 */
export function generateCandidates(input: {
  grid: MutableGrid;
  word: PreparedWord;
  directions: readonly Direction[];
  allowOverlap: boolean;
  usedDirections: ReadonlySet<Direction>;
  rng: Rng;
  limit?: number;
}): Candidate[] {
  const { grid, word, directions, allowOverlap, usedDirections, rng } = input;
  const limit = input.limit ?? MAX_CANDIDATES_PER_WORD;
  const candidates: Candidate[] = [];

  if (word.length > grid.size) return candidates;

  for (const direction of directions) {
    for (let row = 0; row < grid.size; row++) {
      for (let col = 0; col < grid.size; col++) {
        const start = { row, col };
        const path = pathFor(start, direction, word.length);

        const check = canPlaceWord(grid, path, word.normalized, allowOverlap);
        if (!check.ok) continue;

        candidates.push({
          start,
          end: path[path.length - 1],
          direction,
          path,
          overlapCount: check.overlapCount,
          score: scoreCandidate({
            grid,
            path,
            overlapCount: check.overlapCount,
            direction,
            usedDirections,
          }),
          tieBreak: rng.next(),
        });
      }
    }
  }

  // Shuffle before sorting to decorrelate enumeration order. `tieBreak` is part
  // of the total comparator, so equally good placements genuinely vary by seed
  // instead of falling back to the same top-left coordinate every time.
  const jittered = shuffled(candidates, rng);
  jittered.sort(compareCandidates);

  return jittered.slice(0, limit);
}

/**
 * Total ordering over candidates: score first, then coordinates and direction.
 * No two distinct candidates ever compare equal, so the result never depends on
 * the sort implementation.
 */
function compareCandidates(a: Candidate, b: Candidate): number {
  if (b.score !== a.score) return b.score - a.score;
  if (b.tieBreak !== a.tieBreak) return b.tieBreak - a.tieBreak;
  if (a.start.row !== b.start.row) return a.start.row - b.start.row;
  if (a.start.col !== b.start.col) return a.start.col - b.start.col;
  return a.direction.localeCompare(b.direction, "en");
}

/**
 * Orders words for placement: hardest first.
 *
 * Longest-first is the classic heuristic — a long word has the fewest legal
 * positions, so placing it into an empty grid succeeds far more often than
 * squeezing it in last. Required words outrank optional ones, and explicit
 * weight lets an editor pin a word's priority.
 */
export function orderWords(words: readonly PreparedWord[]): PreparedWord[] {
  return [...words].sort((a, b) => {
    if (a.required !== b.required) return a.required ? -1 : 1;
    if (b.weight !== a.weight) return b.weight - a.weight;
    if (b.length !== a.length) return b.length - a.length;
    // Final tiebreak keeps the order total and locale-independent.
    return a.normalized.localeCompare(b.normalized, "en");
  });
}
