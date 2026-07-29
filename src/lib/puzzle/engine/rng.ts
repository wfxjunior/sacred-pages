import { createRng, deriveSeed } from "../engine";
import type { WeightedLetter } from "./alphabet";

// Seeded randomness.
//
// Determinism depends on two things: the generator, and the ORDER in which it
// is consumed. Every helper here draws a fixed number of values per call so a
// caller can reason about consumption. Never call Math.random.

export type Rng = {
  /** Next float in [0, 1). */
  next(): number;
  /** Integer in [0, bound). */
  nextInt(bound: number): number;
  /** How many values have been drawn — used to assert consumption in tests. */
  readonly drawn: number;
};

export function createEngineRng(seed: number): Rng {
  const raw = createRng(seed);
  let drawn = 0;

  return {
    next() {
      drawn++;
      return raw();
    },
    nextInt(bound: number) {
      if (bound <= 0) return 0;
      drawn++;
      return Math.floor(raw() * bound);
    },
    get drawn() {
      return drawn;
    },
  };
}

/**
 * Derives a sub-seed for an independent stream.
 *
 * Used so that, for example, filling the grid does not consume values from the
 * placement stream — otherwise placing one more word would shift every filler
 * letter, making failures far harder to diagnose.
 */
export function subSeed(seed: number, label: string): number {
  return deriveSeed(seed, label);
}

/**
 * Fisher-Yates shuffle returning a NEW array.
 *
 * Deliberately non-mutating: the engine must never modify its inputs, and a
 * shuffled copy keeps candidate generation referentially transparent.
 */
export function shuffled<T>(items: readonly T[], rng: Rng): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = rng.nextInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Picks a letter proportionally to its weight.
 *
 * Consumes exactly one random value regardless of alphabet size, which keeps
 * grid filling predictable: N empty cells consume exactly N values.
 */
export function weightedPick(alphabet: readonly WeightedLetter[], rng: Rng): WeightedLetter {
  if (alphabet.length === 0) {
    return { display: "A", weight: 1 };
  }

  let total = 0;
  for (const letter of alphabet) total += letter.weight;
  if (total <= 0) return alphabet[rng.nextInt(alphabet.length)];

  let threshold = rng.next() * total;
  for (const letter of alphabet) {
    threshold -= letter.weight;
    if (threshold <= 0) return letter;
  }
  // Floating-point drift can leave a tiny remainder; the last letter is the
  // mathematically correct answer in that case.
  return alphabet[alphabet.length - 1];
}
