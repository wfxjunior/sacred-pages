import type { DifficultyLevel } from "@/lib/content/types";
import type { Direction, Grid, Placement, PuzzleWord } from "./grid";

// THE ENGINE CONTRACT.
//
// Phase 4 implements `PuzzleEngine`. Everything else in this codebase — the
// database schema, the services, the renderer — depends only on this interface,
// so the algorithm can be written, replaced or optimised without touching them.
//
// No algorithm lives in this file. It defines the seam.

// Re-exported so the version lives in exactly one place. engine/constants.ts
// imports nothing, so this cannot create an import cycle.
export { ENGINE_VERSION } from "./engine/constants";

/**
 * Everything the generator needs. Deliberately a plain value: no database
 * handle, no React, no clock, no randomness beyond `seed`.
 */
export type GenerationInput = {
  readonly words: readonly PuzzleWord[];
  readonly languageCode: string;
  readonly difficulty: DifficultyLevel;
  readonly gridSize: number;
  readonly directions: readonly Direction[];
  readonly allowReversed: boolean;
  readonly allowDiagonal: boolean;
  readonly overlapStrategy: "none" | "allowed" | "encouraged";
  readonly fillerStrategy: "uniform" | "weighted" | "word_letters";
  readonly customAlphabet?: string | null;
  readonly maxAttempts: number;
  /** The only source of randomness permitted. */
  readonly seed: number;
};

export type GenerationMetadata = {
  readonly attempts: number;
  readonly durationMs: number;
  readonly placedCount: number;
  readonly unplacedCount: number;
  readonly fillerStrategy: string;
};

export type GenerationOutput = {
  readonly grid: Grid;
  readonly placements: readonly Placement[];
  /** Words the generator could not place — reported, never silently dropped. */
  readonly unplacedWords: readonly PuzzleWord[];
  readonly seed: number;
  readonly engineVersion: string;
  readonly metadata: GenerationMetadata;
};

/**
 * Implemented in Phase 4.
 *
 * Contract:
 *  1. DETERMINISM — identical input (including seed) must return a deeply
 *     equal output, on any platform, in any process. No Date.now(), no
 *     Math.random(), no iteration over unordered collections.
 *  2. TOTALITY — never throws for content reasons. A word that cannot be placed
 *     goes in `unplacedWords`. Throw `PuzzleEngineError` only for structurally
 *     invalid input (empty word list, grid smaller than the longest word).
 *  3. PURITY — no I/O, no logging, no mutation of the input.
 */
export type PuzzleEngine = {
  readonly version: string;
  generate(input: GenerationInput): GenerationOutput;
};

export class PuzzleEngineError extends Error {
  constructor(
    public readonly code:
      "empty_word_list" | "grid_too_small" | "invalid_directions" | "invalid_input",
    message: string,
  ) {
    super(message);
    this.name = "PuzzleEngineError";
  }
}

/**
 * The Phase 3 placeholder, kept only so tests can assert the "no engine"
 * path. The real implementation lives in ./engine/ and is wired into
 * PuzzleInstanceService as the default.
 */
export const notImplementedEngine: PuzzleEngine = {
  version: "0.0.0-not-implemented",
  generate() {
    throw new PuzzleEngineError(
      "invalid_input",
      "The puzzle generation algorithm is not implemented yet (Phase 4). " +
        "Infrastructure is ready: see docs/engineering/puzzle-domain.md.",
    );
  },
};

// ---------------------------------------------------------------------------
// Determinism support
// ---------------------------------------------------------------------------

/**
 * Seeded PRNG (mulberry32). Small, fast, and identical across JS runtimes —
 * which is what determinism requires. NOT cryptographically secure, and must
 * never be used for tokens or secrets.
 */
export function createRng(seed: number): () => number {
  let state = seed | 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The four values that must match for two puzzles to be identical. Persisted on
 * puzzle_instances as a unique constraint — the database enforces the same rule
 * the type system describes.
 */
export type ReproducibilityKey = {
  readonly templateId: string;
  readonly templateVersion: number;
  readonly seed: number;
  readonly engineVersion: string;
};

export function reproducibilityKeyOf(key: ReproducibilityKey): string {
  return `${key.templateId}:${key.templateVersion}:${key.seed}:${key.engineVersion}`;
}

/**
 * Derives a stable seed from arbitrary parts (FNV-1a).
 *
 * Used by the seed strategies: `per_journey` hashes the template id,
 * `per_day` adds the date, `per_user` adds the user id — so the same reader
 * revisiting the same puzzle on the same day always sees the same grid.
 */
export function deriveSeed(...parts: readonly (string | number)[]): number {
  const input = parts.join("|");
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export type SeedStrategy = "per_journey" | "per_user" | "per_day";

export function seedFor(input: {
  strategy: SeedStrategy;
  templateId: string;
  templateVersion: number;
  userId?: string | null;
  /** ISO date (YYYY-MM-DD) — supplied by the caller, never read from a clock. */
  date?: string | null;
}): number {
  const base = [input.templateId, input.templateVersion];
  switch (input.strategy) {
    case "per_journey":
      return deriveSeed(...base);
    case "per_day":
      return deriveSeed(...base, input.date ?? "");
    case "per_user":
      return deriveSeed(...base, input.userId ?? "anonymous");
  }
}

/**
 * Stable digest of a generated puzzle, stored as puzzle_instances.content_hash.
 *
 * Two runs of the same engine version with the same seed must produce the same
 * hash. A mismatch means determinism has regressed — which is exactly what the
 * Phase 4 test suite asserts against.
 */
export function contentHash(grid: Grid, placements: readonly Placement[]): string {
  const gridPart = grid.cells.map((row) => row.map((cell) => cell.normalized).join("")).join("|");

  // Sorted so that placement ORDER cannot change the hash — only content.
  const placementPart = [...placements]
    .map(
      (p) => `${p.normalized}@${p.start.row},${p.start.col}>${p.direction}${p.reversed ? "R" : ""}`,
    )
    .sort()
    .join(";");

  return fnv1aHex(`${grid.size}#${gridPart}#${placementPart}`);
}

function fnv1aHex(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
