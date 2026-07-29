import { normalizeWord } from "@/lib/content/normalize";

// Filler alphabets.
//
// A subtle but important point: filler letters must be drawn from the SAME
// character repertoire as the words, accents included.
//
// If the words contain "ORAÇÃO" but every filler is a plain A-Z letter, then
// every accented cell in the grid is guaranteed to belong to a word — the
// puzzle gives itself away at a glance. Including accented fillers closes that
// leak. Because selection matching runs on the normalized form, a filler "Ç"
// simply behaves as a "C" and can never create a false match.

export type WeightedLetter = {
  /** Character shown to the reader; may carry an accent. */
  readonly display: string;
  /** Relative frequency. */
  readonly weight: number;
};

// Approximate letter frequencies (percent). Exact values are not important;
// what matters is that common letters appear more often than rare ones, so
// filler regions read like plausible text rather than random noise.

const ENGLISH: readonly WeightedLetter[] = [
  { display: "E", weight: 12.7 },
  { display: "T", weight: 9.1 },
  { display: "A", weight: 8.2 },
  { display: "O", weight: 7.5 },
  { display: "I", weight: 7.0 },
  { display: "N", weight: 6.7 },
  { display: "S", weight: 6.3 },
  { display: "H", weight: 6.1 },
  { display: "R", weight: 6.0 },
  { display: "D", weight: 4.3 },
  { display: "L", weight: 4.0 },
  { display: "C", weight: 2.8 },
  { display: "U", weight: 2.8 },
  { display: "M", weight: 2.4 },
  { display: "W", weight: 2.4 },
  { display: "F", weight: 2.2 },
  { display: "G", weight: 2.0 },
  { display: "Y", weight: 2.0 },
  { display: "P", weight: 1.9 },
  { display: "B", weight: 1.5 },
  { display: "V", weight: 1.0 },
  { display: "K", weight: 0.8 },
  { display: "J", weight: 0.2 },
  { display: "X", weight: 0.2 },
  { display: "Q", weight: 0.1 },
  { display: "Z", weight: 0.1 },
];

const PORTUGUESE: readonly WeightedLetter[] = [
  { display: "A", weight: 14.6 },
  { display: "E", weight: 12.6 },
  { display: "O", weight: 10.7 },
  { display: "S", weight: 7.8 },
  { display: "R", weight: 6.5 },
  { display: "I", weight: 6.2 },
  { display: "N", weight: 5.0 },
  { display: "D", weight: 5.0 },
  { display: "M", weight: 4.7 },
  { display: "U", weight: 4.6 },
  { display: "T", weight: 4.3 },
  { display: "C", weight: 3.9 },
  { display: "L", weight: 2.8 },
  { display: "P", weight: 2.5 },
  { display: "V", weight: 1.7 },
  { display: "G", weight: 1.3 },
  { display: "H", weight: 1.3 },
  { display: "Q", weight: 1.2 },
  { display: "B", weight: 1.0 },
  { display: "F", weight: 1.0 },
  { display: "Z", weight: 0.5 },
  { display: "J", weight: 0.4 },
  { display: "X", weight: 0.3 },
  // Accented forms, included so accented word cells do not stand out.
  { display: "Ã", weight: 1.5 },
  { display: "Ç", weight: 0.9 },
  { display: "Á", weight: 0.8 },
  { display: "É", weight: 0.7 },
  { display: "Ê", weight: 0.6 },
  { display: "Ó", weight: 0.5 },
  { display: "Õ", weight: 0.4 },
  { display: "Í", weight: 0.4 },
  { display: "Ú", weight: 0.3 },
  { display: "Â", weight: 0.3 },
  { display: "Ô", weight: 0.3 },
  { display: "À", weight: 0.2 },
];

const SPANISH: readonly WeightedLetter[] = [
  { display: "E", weight: 13.7 },
  { display: "A", weight: 12.5 },
  { display: "O", weight: 8.7 },
  { display: "S", weight: 8.0 },
  { display: "R", weight: 6.9 },
  { display: "N", weight: 6.7 },
  { display: "I", weight: 6.2 },
  { display: "D", weight: 5.9 },
  { display: "L", weight: 5.0 },
  { display: "C", weight: 4.7 },
  { display: "T", weight: 4.6 },
  { display: "U", weight: 3.9 },
  { display: "M", weight: 3.2 },
  { display: "P", weight: 2.5 },
  { display: "B", weight: 1.4 },
  { display: "G", weight: 1.0 },
  { display: "V", weight: 0.9 },
  { display: "Y", weight: 0.9 },
  { display: "Q", weight: 0.9 },
  { display: "H", weight: 0.7 },
  { display: "F", weight: 0.7 },
  { display: "Z", weight: 0.5 },
  { display: "J", weight: 0.4 },
  { display: "X", weight: 0.2 },
  // N-tilde is a distinct Spanish letter, not an accent, and never folds.
  { display: "Ñ", weight: 0.3 },
  { display: "Á", weight: 0.5 },
  { display: "É", weight: 0.4 },
  { display: "Í", weight: 0.4 },
  { display: "Ó", weight: 0.3 },
  { display: "Ú", weight: 0.2 },
  { display: "Ü", weight: 0.1 },
];

const ALPHABETS: Readonly<Record<string, readonly WeightedLetter[]>> = {
  en: ENGLISH,
  pt: PORTUGUESE,
  es: SPANISH,
};

/** Falls back to English for any locale without a curated alphabet. */
export function alphabetFor(languageCode: string): readonly WeightedLetter[] {
  return ALPHABETS[languageCode.slice(0, 2).toLowerCase()] ?? ENGLISH;
}

/** Equal weights — every letter equally likely. */
export function uniformAlphabet(languageCode: string): WeightedLetter[] {
  return alphabetFor(languageCode).map((letter) => ({ display: letter.display, weight: 1 }));
}

/**
 * Builds an alphabet from the letters of the puzzle's own words.
 *
 * This is the hardest filler strategy: every filler letter is one the reader is
 * actively hunting for, so partial matches abound. Letters are counted, so the
 * distribution mirrors the words themselves.
 */
export function wordLetterAlphabet(displayWords: readonly string[]): WeightedLetter[] {
  const counts = new Map<string, number>();
  for (const word of displayWords) {
    for (const character of word) {
      if (character.trim().length === 0) continue;
      counts.set(character, (counts.get(character) ?? 0) + 1);
    }
  }
  // Sorted for determinism: Map iteration order depends on insertion, which
  // depends on word order, so an explicit total ordering is safer.
  return [...counts.entries()]
    .map(([display, weight]) => ({ display, weight }))
    .sort((a, b) => b.weight - a.weight || a.display.localeCompare(b.display, "en"));
}

/** Parses an editor-supplied alphabet string into equally weighted letters. */
export function customAlphabet(source: string): WeightedLetter[] {
  const seen = new Set<string>();
  const letters: WeightedLetter[] = [];
  for (const character of source) {
    const upper = character.toLocaleUpperCase("en");
    if (upper.trim().length === 0 || seen.has(upper)) continue;
    seen.add(upper);
    letters.push({ display: upper, weight: 1 });
  }
  return letters;
}

/**
 * Resolves the alphabet for a generation run. Falls back to the locale
 * alphabet whenever a strategy would produce too few distinct letters to fill
 * a grid without obvious repetition.
 */
export function resolveAlphabet(input: {
  strategy: "uniform" | "weighted" | "word_letters";
  languageCode: string;
  displayWords: readonly string[];
  customAlphabet?: string | null;
}): WeightedLetter[] {
  if (input.customAlphabet) {
    const custom = customAlphabet(input.customAlphabet);
    if (custom.length >= 10) return custom;
  }

  switch (input.strategy) {
    case "uniform":
      return uniformAlphabet(input.languageCode);
    case "word_letters": {
      const fromWords = wordLetterAlphabet(input.displayWords);
      return fromWords.length >= 8 ? fromWords : [...alphabetFor(input.languageCode)];
    }
    case "weighted":
      return [...alphabetFor(input.languageCode)];
  }
}

/** The normalized (matching) character for a filler display character. */
export function normalizedCharacterFor(display: string): string {
  const normalized = normalizeWord(display);
  // Any character that normalizes away entirely would create an unselectable
  // cell, so fall back to the raw uppercase form.
  return normalized.length > 0 ? normalized[0] : display.toLocaleUpperCase("en");
}
