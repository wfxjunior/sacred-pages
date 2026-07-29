// Word normalization for puzzle matching.
//
// Two forms exist for every word and BOTH are preserved:
//   display    - what the reader sees, accents intact ("ORACAO" with cedilla
//                and tilde renders as the Portuguese spelling)
//   normalized - what the puzzle engine matches on (accent-folded, uppercase)
//
// N-tilde is deliberately NOT folded to N: in Spanish it is a distinct letter,
// so "ANO" spelled with N-tilde (year) must not collide with "ANO" (anus).
// The Portuguese and Spanish diacritics - cedilla, tilde-a, acutes, umlaut -
// ARE folded, because they are accented forms of the same base letter.

const COMBINING_MARKS = /[̀-ͯ]/g;
const NON_MATCHABLE = /[^A-Z0-9Ñ]/g;
const NTILDE_SPLIT = /[ñÑ]/;
const NTILDE_UPPER = "Ñ";

/**
 * Produces the matching form: uppercase, accent-folded, stripped of spaces,
 * punctuation, apostrophes and hyphens. N-tilde survives; everything else folds.
 *
 * The split/join around N-tilde protects it from NFD decomposition, which
 * would otherwise separate its combining tilde and leave a bare N.
 */
export function normalizeWord(input: string): string {
  return input
    .normalize("NFC")
    .split(NTILDE_SPLIT)
    .map((segment) =>
      segment
        .normalize("NFD")
        .replace(COMBINING_MARKS, "")
        .toUpperCase()
        .replace(NON_MATCHABLE, ""),
    )
    .join(NTILDE_UPPER);
}

/** Collapses whitespace and trims - the display form keeps its accents. */
export function normalizeDisplayWord(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

/**
 * True when the value contains at least one character that survives
 * normalization. Rejects punctuation-only entries such as "---" or "'".
 */
export function hasMatchableContent(input: string): boolean {
  return normalizeWord(input).length > 0;
}
