// Engine limits and defaults.
//
// Every bound exists to make generation terminate predictably. An unbounded
// backtracking search over a dense grid can run for minutes; these caps trade a
// small number of unplaced words for a guaranteed response time.

/** Bumped whenever generation output could change for the same input. */
export const ENGINE_VERSION = "1.0.0";

export const MIN_GRID_SIZE = 6;
export const MAX_GRID_SIZE = 32;

export const MIN_WORD_LENGTH = 2;
export const MAX_WORD_LENGTH = 32;

/** Candidate placements considered per word before giving up on it. */
export const DEFAULT_MAX_ATTEMPTS = 200;

/** Total undo operations allowed across a whole generation run. */
export const DEFAULT_MAX_BACKTRACKS = 500;

/**
 * Candidates kept per word after scoring. Enumerating every position on a 32x32
 * grid in 8 directions yields thousands; the best few hundred are more than
 * enough and keep the search bounded.
 */
export const MAX_CANDIDATES_PER_WORD = 256;

/** Hard ceiling on words in one puzzle. */
export const MAX_WORDS = 40;

/**
 * Scoring weights for candidate placement. Overlap is weighted highest because
 * intersecting words are what make a word search feel crafted rather than
 * scattered.
 */
export const CANDIDATE_WEIGHTS = {
  overlap: 10,
  centrality: 2,
  directionVariety: 3,
  edgeAvoidance: 1,
} as const;

/** Weights for the 0-100 puzzle quality score. Must sum to 100. */
export const QUALITY_WEIGHTS = {
  placement: 50,
  overlap: 20,
  directionDiversity: 15,
  distribution: 10,
  density: 5,
} as const;

export const QUALITY_THRESHOLDS = {
  /** Below this, the puzzle should not be published. */
  unacceptable: 40,
  /** Below this, an editor should be warned. */
  poor: 60,
  good: 75,
  excellent: 90,
} as const;

export type QualityBand = "unacceptable" | "poor" | "acceptable" | "good" | "excellent";

export function qualityBand(score: number): QualityBand {
  if (score < QUALITY_THRESHOLDS.unacceptable) return "unacceptable";
  if (score < QUALITY_THRESHOLDS.poor) return "poor";
  if (score < QUALITY_THRESHOLDS.good) return "acceptable";
  if (score < QUALITY_THRESHOLDS.excellent) return "good";
  return "excellent";
}
