// Deterministic randomness for game modes — never Math.random.
//
// Extracted from the Word Guess engine the moment a second mode needed it.
// The algorithm is unchanged (FNV-1a string hash seeding a Lehmer generator,
// the same family the daily draws use), so existing Word Guess puzzles keep
// their exact reveal patterns.

/** A [0, 1) generator seeded from a string — same seed, same sequence, on
 * every device. */
export function seededRandomFromString(seedKey: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seedKey.length; i += 1) {
    h ^= seedKey.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let state = (Math.abs(h) % 2147483646) + 1;
  return () => (state = (state * 16807) % 2147483647) / 2147483647;
}

/** Fisher–Yates with a caller-supplied generator. Returns a new array. */
export function shuffleWithRandom<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}
