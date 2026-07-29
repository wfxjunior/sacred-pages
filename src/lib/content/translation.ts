import type { Locale } from "@/lib/i18n";
import type { TranslationStatus } from "./types";

// Locale resolution and completeness reporting for editorial content.
//
// Public rule: only 'published' translations are ever served to readers, with a
// documented fallback to the default language. Admin screens additionally see
// draft/in_review rows and are told when they are looking at fallback content.

export const DEFAULT_LOCALE: Locale = "en";

export type TranslationRecord = {
  languageCode: string;
  status: TranslationStatus;
};

export type ResolvedTranslation<T extends TranslationRecord> = {
  translation: T;
  /** True when the requested locale was unavailable and English was used. */
  isFallback: boolean;
  requestedLocale: string;
};

/**
 * Picks the translation to render. `allowedStatuses` is what makes this safe:
 * public callers pass ['published'], admin callers pass a wider set.
 */
export function resolveTranslation<T extends TranslationRecord>(
  translations: readonly T[],
  requestedLocale: string,
  allowedStatuses: readonly TranslationStatus[] = ["published"],
): ResolvedTranslation<T> | null {
  const usable = translations.filter((t) => allowedStatuses.includes(t.status));

  const exact = usable.find((t) => t.languageCode === requestedLocale);
  if (exact) {
    return { translation: exact, isFallback: false, requestedLocale };
  }

  const fallback = usable.find((t) => t.languageCode === DEFAULT_LOCALE);
  if (fallback) {
    return { translation: fallback, isFallback: true, requestedLocale };
  }

  return null;
}

export type FieldCompleteness = {
  field: string;
  present: boolean;
};

export type TranslationCompleteness = {
  languageCode: string;
  status: TranslationStatus;
  /** 0-100, rounded. */
  percentComplete: number;
  missingFields: string[];
  isPublishable: boolean;
};

/** Fields that must be present before a journey translation may go live. */
export const REQUIRED_JOURNEY_TRANSLATION_FIELDS = [
  "publicTitle",
  "devotionalBody",
  "reflectionPrompt",
  "prayerBody",
] as const;

export const REQUIRED_COLLECTION_TRANSLATION_FIELDS = ["title", "shortDescription"] as const;

export function computeCompleteness(
  record: Record<string, unknown> & { languageCode: string; status: TranslationStatus },
  requiredFields: readonly string[],
): TranslationCompleteness {
  const missingFields = requiredFields.filter((field) => {
    const value = record[field];
    return value === null || value === undefined || String(value).trim().length === 0;
  });

  const filled = requiredFields.length - missingFields.length;
  const percentComplete =
    requiredFields.length === 0 ? 100 : Math.round((filled / requiredFields.length) * 100);

  return {
    languageCode: record.languageCode,
    status: record.status,
    percentComplete,
    missingFields,
    isPublishable: missingFields.length === 0,
  };
}

/**
 * Summarizes coverage across every supported locale, including locales that
 * have no row at all (reported as 'missing' at 0%).
 */
export function summarizeCoverage(
  translations: readonly (Record<string, unknown> & {
    languageCode: string;
    status: TranslationStatus;
  })[],
  supportedLocales: readonly string[],
  requiredFields: readonly string[],
): TranslationCompleteness[] {
  return supportedLocales.map((locale) => {
    const record = translations.find((t) => t.languageCode === locale);
    if (!record) {
      return {
        languageCode: locale,
        status: "missing" as TranslationStatus,
        percentComplete: 0,
        missingFields: [...requiredFields],
        isPublishable: false,
      };
    }
    return computeCompleteness(record, requiredFields);
  });
}

/** Whole-entity completeness: the mean across all supported locales. */
export function overallCompleteness(coverage: readonly TranslationCompleteness[]): number {
  if (coverage.length === 0) return 0;
  const total = coverage.reduce((sum, c) => sum + c.percentComplete, 0);
  return Math.round(total / coverage.length);
}
