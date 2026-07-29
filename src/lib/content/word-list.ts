import { hasMatchableContent, normalizeDisplayWord, normalizeWord } from "./normalize";
import type { DifficultyLevel } from "./types";

// Validation for the word-list editor. Everything here is pure so the admin UI
// can show live warnings without a round trip, and so it is unit-testable.

export type WordListEntry = {
  id?: string;
  displayValue: string;
  explanation?: string;
  isRequired?: boolean;
  minDifficulty?: DifficultyLevel;
  maxDifficulty?: DifficultyLevel;
};

export type WordIssueCode =
  | "empty"
  | "too_short"
  | "too_long_for_grid"
  | "unsupported_characters"
  | "punctuation_only"
  | "duplicate_display"
  | "duplicate_normalized"
  | "too_many_words"
  | "too_few_words"
  | "missing_translation";

export type WordIssue = {
  code: WordIssueCode;
  /** Index into the supplied list, or null for list-level issues. */
  index: number | null;
  message: string;
  severity: "error" | "warning";
};

export const MIN_WORD_LENGTH = 2;
export const MAX_WORD_LENGTH = 24;

export type WordListValidationInput = {
  entries: readonly WordListEntry[];
  /** Longest word must fit the smallest grid the journey allows. */
  minGridSize: number;
  targetWordCount: number;
  /** Locales in which every word is expected to exist. */
  requiredLocales?: readonly string[];
  /** Map of entry id -> locales that already have a translation. */
  existingTranslations?: Readonly<Record<string, readonly string[]>>;
};

export function validateWordList(input: WordListValidationInput): WordIssue[] {
  const { entries, minGridSize, targetWordCount } = input;
  const issues: WordIssue[] = [];

  const seenDisplay = new Map<string, number>();
  const seenNormalized = new Map<string, number>();

  entries.forEach((entry, index) => {
    const display = normalizeDisplayWord(entry.displayValue);

    if (display.length === 0) {
      issues.push({ code: "empty", index, message: "This word is empty", severity: "error" });
      return;
    }

    if (!hasMatchableContent(display)) {
      issues.push({
        code: "punctuation_only",
        index,
        message: `"${display}" contains no usable letters`,
        severity: "error",
      });
      return;
    }

    const normalized = normalizeWord(display);

    if (normalized.length < MIN_WORD_LENGTH) {
      issues.push({
        code: "too_short",
        index,
        message: `"${display}" is too short (minimum ${MIN_WORD_LENGTH} letters)`,
        severity: "error",
      });
    }

    if (normalized.length > MAX_WORD_LENGTH) {
      issues.push({
        code: "unsupported_characters",
        index,
        message: `"${display}" exceeds ${MAX_WORD_LENGTH} letters`,
        severity: "error",
      });
    } else if (normalized.length > minGridSize) {
      issues.push({
        code: "too_long_for_grid",
        index,
        message: `"${display}" needs ${normalized.length} cells but the smallest grid is ${minGridSize}`,
        severity: "error",
      });
    }

    const displayKey = display.toLocaleUpperCase();
    const priorDisplay = seenDisplay.get(displayKey);
    if (priorDisplay !== undefined) {
      issues.push({
        code: "duplicate_display",
        index,
        message: `"${display}" is already in the list (row ${priorDisplay + 1})`,
        severity: "error",
      });
    } else {
      seenDisplay.set(displayKey, index);
    }

    const priorNormalized = seenNormalized.get(normalized);
    if (priorNormalized !== undefined && priorDisplay === undefined) {
      // Different spellings that collide once accents are folded, e.g. "AVO"
      // and the accented "AVÔ" - the puzzle could not tell them apart.
      issues.push({
        code: "duplicate_normalized",
        index,
        message: `"${display}" matches the same letters as row ${priorNormalized + 1} ("${normalized}")`,
        severity: "error",
      });
    } else if (priorNormalized === undefined) {
      seenNormalized.set(normalized, index);
    }
  });

  const activeCount = entries.filter((e) => normalizeDisplayWord(e.displayValue).length > 0).length;

  if (activeCount > targetWordCount) {
    issues.push({
      code: "too_many_words",
      index: null,
      message: `${activeCount} words listed but this journey targets ${targetWordCount}`,
      severity: "warning",
    });
  }
  if (activeCount < Math.min(3, targetWordCount)) {
    issues.push({
      code: "too_few_words",
      index: null,
      message: `At least 3 words are needed (currently ${activeCount})`,
      severity: "error",
    });
  }

  if (input.requiredLocales?.length && input.existingTranslations) {
    entries.forEach((entry, index) => {
      if (!entry.id) return;
      const have = input.existingTranslations?.[entry.id] ?? [];
      const missing = input.requiredLocales!.filter((l) => !have.includes(l));
      if (missing.length > 0) {
        issues.push({
          code: "missing_translation",
          index,
          message: `Missing translation: ${missing.join(", ")}`,
          severity: "warning",
        });
      }
    });
  }

  return issues;
}

export function hasBlockingIssues(issues: readonly WordIssue[]): boolean {
  return issues.some((i) => i.severity === "error");
}

/**
 * Parses a bulk paste (newline, comma or semicolon separated) into entries,
 * preserving the display spelling exactly as typed.
 */
export function parseBulkWords(raw: string): WordListEntry[] {
  return raw
    .split(/[\n,;]+/)
    .map((part) => normalizeDisplayWord(part))
    .filter((part) => part.length > 0)
    .map((displayValue) => ({ displayValue }));
}

/** Preview rows for the editor: display form beside its matching form. */
export function previewNormalization(
  entries: readonly WordListEntry[],
): { display: string; normalized: string }[] {
  return entries.map((entry) => {
    const display = normalizeDisplayWord(entry.displayValue);
    return { display, normalized: normalizeWord(display) };
  });
}
