import { z } from "zod";
import {
  ACCESS_LEVELS,
  CONTENT_STATUSES,
  DIFFICULTY_LEVELS,
  FILLER_STRATEGIES,
  OVERLAP_PREFERENCES,
  PUZZLE_DIRECTIONS,
  REVIEW_DECISIONS,
  SEED_STRATEGIES,
  TRANSLATION_STATUSES,
} from "./types";
import { isValidSlug } from "./slug";
import { hasMatchableContent, normalizeWord } from "./normalize";

// Single source of validation truth: admin forms and write operations both use
// these schemas. Database CHECK constraints are the final backstop - the limits
// here must stay consistent with supabase/migrations/0003_content_platform.sql.

const slug = z
  .string()
  .min(1, "Slug is required")
  .max(80)
  .refine(isValidSlug, "Use lowercase letters, numbers and single hyphens");

const localeCode = z.enum(["en", "pt", "es"]);

const optionalText = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .or(z.literal("").transform(() => undefined));

export const contentStatusSchema = z.enum(CONTENT_STATUSES);
export const translationStatusSchema = z.enum(TRANSLATION_STATUSES);
export const accessLevelSchema = z.enum(ACCESS_LEVELS);
export const difficultySchema = z.enum(DIFFICULTY_LEVELS);

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export const collectionCreateSchema = z.object({
  internalName: z.string().min(1, "Internal name is required").max(120),
  slug,
  primaryLanguageCode: localeCode,
  accessLevel: accessLevelSchema.default("free"),
  topic: optionalText(80),
  audience: optionalText(80),
  difficultyMin: difficultySchema.optional(),
  difficultyMax: difficultySchema.optional(),
  estimatedTotalMinutes: z.number().int().positive().max(10_000).optional(),
  coverMediaId: z.string().uuid().optional(),
  thumbnailMediaId: z.string().uuid().optional(),
  isFeatured: z.boolean().default(false),
  featuredFrom: z.string().datetime().optional(),
  featuredUntil: z.string().datetime().optional(),
  displayOrder: z.number().int().min(0).default(0),
});

export const collectionUpdateSchema = collectionCreateSchema.partial().extend({
  id: z.string().uuid(),
});

export const collectionTranslationSchema = z.object({
  collectionId: z.string().uuid(),
  languageCode: localeCode,
  status: translationStatusSchema.default("draft"),
  title: z.string().min(1, "Title is required").max(160),
  shortDescription: optionalText(300),
  fullDescription: z.string().max(20_000).optional(),
  seoTitle: optionalText(70),
  seoDescription: optionalText(180),
});

// ---------------------------------------------------------------------------
// Journeys
// ---------------------------------------------------------------------------

export const journeyCreateSchema = z.object({
  internalTitle: z.string().min(1, "Internal title is required").max(160),
  slug,
  primaryCollectionId: z.string().uuid("A primary collection is required"),
  primaryLanguageCode: localeCode,
  position: z.number().int().min(0).default(0),
  accessLevel: accessLevelSchema.default("free"),
  difficulty: difficultySchema.default("gentle"),
  theme: optionalText(80),
  audience: optionalText(80),
  estimatedMinutes: z.number().int().min(1).max(120).default(7),
  isFeatured: z.boolean().default(false),
  dailyEligible: z.boolean().default(true),
  heroMediaId: z.string().uuid().optional(),
  socialMediaId: z.string().uuid().optional(),
});

export const journeyUpdateSchema = journeyCreateSchema.partial().extend({
  id: z.string().uuid(),
});

export const journeyTranslationSchema = z.object({
  journeyId: z.string().uuid(),
  languageCode: localeCode,
  status: translationStatusSchema.default("draft"),
  publicTitle: z.string().min(1, "Public title is required").max(160),
  subtitle: optionalText(200),
  devotionalBody: z.string().max(20_000).optional(),
  reflectionPrompt: z.string().max(4_000).optional(),
  prayerBody: z.string().max(4_000).optional(),
  completionMessage: optionalText(500),
  seoTitle: optionalText(70),
  seoDescription: optionalText(180),
});

/**
 * A translation may only be marked published/approved when the substantive
 * fields are present - this is what prevents an empty translation going live.
 */
export const publishableJourneyTranslationSchema = journeyTranslationSchema.superRefine(
  (value, ctx) => {
    if (value.status !== "published" && value.status !== "approved") return;
    for (const field of ["devotionalBody", "reflectionPrompt", "prayerBody"] as const) {
      if (!value[field] || value[field]!.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: "Required before this translation can be approved or published",
        });
      }
    }
  },
);

// ---------------------------------------------------------------------------
// Scripture
// ---------------------------------------------------------------------------

export const scriptureReferenceSchema = z
  .object({
    journeyId: z.string().uuid(),
    sourceId: z.string().uuid("A scripture source is required"),
    bookCode: z.string().regex(/^[A-Z0-9]{3}$/, "Use a 3-character book code, e.g. PHP"),
    chapter: z.number().int().positive(),
    verseStart: z.number().int().positive(),
    verseEnd: z.number().int().positive().optional(),
    displayReference: z.string().min(1).max(120),
    storedText: z.string().max(10_000).optional(),
    externalContentId: optionalText(120),
    position: z.number().int().min(0).default(0),
  })
  .refine((v) => v.verseEnd === undefined || v.verseEnd >= v.verseStart, {
    path: ["verseEnd"],
    message: "End verse must be greater than or equal to the start verse",
  });

// ---------------------------------------------------------------------------
// Journey words
// ---------------------------------------------------------------------------

export const journeyWordSchema = z.object({
  journeyId: z.string().uuid(),
  position: z.number().int().min(0),
  isRequired: z.boolean().default(true),
  isActive: z.boolean().default(true),
  minDifficulty: difficultySchema.default("gentle"),
  maxDifficulty: difficultySchema.optional(),
  scriptureReferenceId: z.string().uuid().optional(),
});

export const journeyWordTranslationSchema = z
  .object({
    journeyWordId: z.string().uuid(),
    languageCode: localeCode,
    status: translationStatusSchema.default("draft"),
    displayValue: z.string().min(2, "Words must be at least 2 characters").max(24),
    explanation: z.string().max(2_000).optional(),
  })
  .superRefine((value, ctx) => {
    if (!hasMatchableContent(value.displayValue)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["displayValue"],
        message: "This value contains no letters that can appear in a puzzle",
      });
      return;
    }
    const normalized = normalizeWord(value.displayValue);
    if (normalized.length < 2 || normalized.length > 24) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["displayValue"],
        message: `Normalizes to "${normalized}" (${normalized.length} characters); must be 2-24`,
      });
    }
  });

// ---------------------------------------------------------------------------
// Puzzle configuration
// ---------------------------------------------------------------------------

export const puzzleSettingsSchema = z
  .object({
    journeyId: z.string().uuid(),
    defaultDifficulty: difficultySchema.default("gentle"),
    allowedDifficulties: z
      .array(difficultySchema)
      .min(1, "At least one difficulty must be allowed")
      .default([...DIFFICULTY_LEVELS]),
    minGridSize: z.number().int().min(6).max(20).default(10),
    maxGridSize: z.number().int().min(6).max(20).default(16),
    targetWordCount: z.number().int().min(3).max(24).default(8),
    allowedDirections: z
      .array(z.enum(PUZZLE_DIRECTIONS))
      .min(1, "At least one direction must be allowed")
      .default(["E", "S", "SE", "NE"]),
    allowReversed: z.boolean().default(false),
    allowDiagonal: z.boolean().default(true),
    overlapPreference: z.enum(OVERLAP_PREFERENCES).default("allowed"),
    seedStrategy: z.enum(SEED_STRATEGIES).default("per_journey"),
    hintsEnabled: z.boolean().default(true),
    fullSolutionEnabled: z.boolean().default(true),
    fillerStrategy: z.enum(FILLER_STRATEGIES).default("weighted"),
    customAlphabet: z.string().min(10).max(64).optional(),
    estimatedCompletionSeconds: z.number().int().positive().max(7_200).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.maxGridSize < value.minGridSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxGridSize"],
        message: "Maximum grid size must be at least the minimum",
      });
    }
    if (!value.allowedDifficulties.includes(value.defaultDifficulty)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["defaultDifficulty"],
        message: "The default difficulty must be one of the allowed difficulties",
      });
    }
    const diagonals: readonly string[] = ["NE", "NW", "SE", "SW"];
    if (!value.allowDiagonal && value.allowedDirections.some((d) => diagonals.includes(d))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["allowedDirections"],
        message: "Diagonal directions are listed but diagonals are disabled",
      });
    }
    if (
      value.customAlphabet &&
      new Set(value.customAlphabet).size !== value.customAlphabet.length
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customAlphabet"],
        message: "The custom alphabet contains duplicate characters",
      });
    }
  });

export type PuzzleSettingsInput = z.input<typeof puzzleSettingsSchema>;
export type PuzzleSettings = z.output<typeof puzzleSettingsSchema>;

// ---------------------------------------------------------------------------
// Workflow
// ---------------------------------------------------------------------------

export const reviewSubmissionSchema = z.object({
  entityType: z.enum(["collection", "journey"]),
  entityId: z.string().uuid(),
  decision: z.enum(REVIEW_DECISIONS),
  notes: z.string().max(4_000).optional(),
});

export const publicationScheduleSchema = z
  .object({
    entityType: z.enum(["collection", "journey"]),
    entityId: z.string().uuid(),
    scheduledPublishAt: z.string().datetime().optional(),
    scheduledUnpublishAt: z.string().datetime().optional(),
  })
  .refine(
    (v) =>
      !v.scheduledPublishAt ||
      !v.scheduledUnpublishAt ||
      new Date(v.scheduledUnpublishAt) > new Date(v.scheduledPublishAt),
    { path: ["scheduledUnpublishAt"], message: "Unpublish time must be after publish time" },
  )
  .refine(
    (v) => !v.scheduledPublishAt || new Date(v.scheduledPublishAt).getTime() > Date.now() - 60_000,
    { path: ["scheduledPublishAt"], message: "Scheduled publication must be in the future" },
  );

export const dailyJourneyAssignmentSchema = z.object({
  journeyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  languageCode: localeCode,
  journeyId: z.string().uuid(),
  isFallback: z.boolean().default(false),
  notes: optionalText(500),
});

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

export const MAX_MEDIA_BYTES = 10 * 1024 * 1024;

export const mediaMetadataSchema = z.object({
  storagePath: z.string().min(1).max(500),
  mimeType: z.enum(ALLOWED_MEDIA_TYPES),
  byteSize: z.number().int().positive().max(MAX_MEDIA_BYTES, "Images must be 10 MB or smaller"),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  altText: z.string().max(300).optional(),
  caption: optionalText(500),
  attribution: optionalText(300),
  licenseNotes: z.string().max(2_000).optional(),
});

export type CollectionCreateInput = z.infer<typeof collectionCreateSchema>;
export type CollectionTranslationInput = z.infer<typeof collectionTranslationSchema>;
export type JourneyCreateInput = z.infer<typeof journeyCreateSchema>;
export type JourneyTranslationInput = z.infer<typeof journeyTranslationSchema>;
export type ScriptureReferenceInput = z.infer<typeof scriptureReferenceSchema>;
export type JourneyWordTranslationInput = z.infer<typeof journeyWordTranslationSchema>;
export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;
export type DailyJourneyAssignmentInput = z.infer<typeof dailyJourneyAssignmentSchema>;
export type MediaMetadataInput = z.infer<typeof mediaMetadataSchema>;
