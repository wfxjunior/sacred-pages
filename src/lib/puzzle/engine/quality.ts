import type { Direction, Placement } from "../grid";
import { QUALITY_THRESHOLDS, QUALITY_WEIGHTS, qualityBand } from "./constants";
import type { MutableGrid, QualityBreakdown } from "./types";

// Puzzle quality scoring.
//
// The score answers one question: "is this puzzle good enough to publish?"
// Placement rate dominates, because a puzzle missing words is broken regardless
// of how elegant the rest is. The remaining factors measure craft.

export { qualityBand, QUALITY_THRESHOLDS };

/** Fraction of requested words that made it into the grid. */
function placementScore(placed: number, total: number): number {
  if (total === 0) return 1;
  return placed / total;
}

/**
 * Intersection density, normalized against a target of roughly one
 * intersection per word. More than that is excellent; zero means the words sit
 * in isolation and the puzzle feels like a list rather than a weave.
 */
function overlapScore(intersections: number, placedWords: number): number {
  if (placedWords === 0) return 0;
  const target = placedWords;
  return Math.min(intersections / target, 1);
}

/**
 * Normalized Shannon entropy over direction usage.
 *
 * Entropy rather than a plain count because eight directions used once each is
 * far better than eight directions where seven are used once and one is used
 * thirty times.
 */
function directionDiversityScore(
  placements: readonly Placement[],
  allowedDirections: number,
): number {
  if (placements.length === 0 || allowedDirections <= 1) return 1;

  const counts = new Map<Direction, number>();
  for (const placement of placements) {
    counts.set(placement.direction, (counts.get(placement.direction) ?? 0) + 1);
  }

  let entropy = 0;
  for (const count of counts.values()) {
    const p = count / placements.length;
    entropy -= p * Math.log2(p);
  }

  const maxEntropy = Math.log2(Math.min(allowedDirections, placements.length));
  return maxEntropy <= 0 ? 1 : Math.min(entropy / maxEntropy, 1);
}

/**
 * How evenly words are spread across the grid.
 *
 * The grid is divided into quadrants and the distribution of word cells
 * compared against a perfectly even split. Clustering everything in one corner
 * scores poorly even when every word is placed.
 */
function distributionScore(grid: MutableGrid, placements: readonly Placement[]): number {
  if (placements.length === 0) return 0;

  const half = grid.size / 2;
  const quadrants = [0, 0, 0, 0];
  let total = 0;

  for (const placement of placements) {
    for (const { row, col } of placement.path) {
      const index = (row < half ? 0 : 2) + (col < half ? 0 : 1);
      quadrants[index]++;
      total++;
    }
  }
  if (total === 0) return 0;

  const ideal = total / 4;
  let deviation = 0;
  for (const count of quadrants) deviation += Math.abs(count - ideal);

  // Maximum deviation happens when every cell lands in one quadrant.
  const maxDeviation = 2 * total * (3 / 4);
  return 1 - deviation / maxDeviation;
}

/**
 * Proportion of the grid occupied by words.
 *
 * Scored against a comfortable band: too sparse is trivially easy, too dense
 * becomes visually noisy. The peak sits around 45% occupancy.
 */
function densityScore(wordCells: number, totalCells: number): number {
  if (totalCells === 0) return 0;
  const density = wordCells / totalCells;
  const ideal = 0.45;
  return Math.max(0, 1 - Math.abs(density - ideal) / ideal);
}

export function scorePuzzle(input: {
  grid: MutableGrid;
  placements: readonly Placement[];
  totalWords: number;
  allowedDirections: number;
  wordCells: number;
  intersections: number;
}): QualityBreakdown {
  const { grid, placements, totalWords, allowedDirections, wordCells, intersections } = input;
  const totalCells = grid.size * grid.size;

  const placement = placementScore(placements.length, totalWords);
  const overlap = overlapScore(intersections, placements.length);
  const diversity = directionDiversityScore(placements, allowedDirections);
  const distribution = distributionScore(grid, placements);
  const density = densityScore(wordCells, totalCells);

  const score = Math.round(
    placement * QUALITY_WEIGHTS.placement +
      overlap * QUALITY_WEIGHTS.overlap +
      diversity * QUALITY_WEIGHTS.directionDiversity +
      distribution * QUALITY_WEIGHTS.distribution +
      density * QUALITY_WEIGHTS.density,
  );

  const warnings: string[] = [];
  if (placements.length < totalWords) {
    warnings.push(`${totalWords - placements.length} of ${totalWords} words could not be placed`);
  }
  if (intersections === 0 && placements.length > 1) {
    warnings.push("No words intersect; the puzzle may feel like a list rather than a weave");
  }
  if (diversity < 0.4 && allowedDirections > 2) {
    warnings.push("Words are concentrated in very few directions");
  }
  if (distribution < 0.5) {
    warnings.push("Words are clustered in one part of the grid");
  }
  if (wordCells / totalCells > 0.75) {
    warnings.push("The grid is very dense and may be hard to read");
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    placement: round2(placement),
    overlap: round2(overlap),
    directionDiversity: round2(diversity),
    distribution: round2(distribution),
    density: round2(density),
    warnings,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Whether a puzzle is good enough to publish without editor review. */
export function isPublishable(score: number): boolean {
  return score >= QUALITY_THRESHOLDS.poor;
}
