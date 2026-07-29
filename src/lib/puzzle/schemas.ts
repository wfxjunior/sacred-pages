import { z } from "zod";
import { DIFFICULTY_LEVELS } from "@/lib/content/types";
import { DIRECTIONS } from "./grid";

// Validation for every puzzle-domain boundary. These schemas run in forms, in
// services before any write, and mirror the CHECK constraints in migration 0005.

const uuid = z.string().uuid();
const localeCode = z.enum(["en", "pt", "es"]);
const difficulty = z.enum(DIFFICULTY_LEVELS);

export const MIN_GRID_SIZE = 6;
export const MAX_GRID_SIZE = 32;

// ---------------------------------------------------------------------------
// Coordinates and grid metadata
// ---------------------------------------------------------------------------

export const coordinateSchema = z.object({
  row: z
    .number()
    .int()
    .min(0)
    .max(MAX_GRID_SIZE - 1),
  col: z
    .number()
    .int()
    .min(0)
    .max(MAX_GRID_SIZE - 1),
});

export const directionSchema = z.enum(DIRECTIONS);

export const selectionSchema = z.object({
  start: coordinateSchema,
  end: coordinateSchema,
});

export const placementSchema = z.object({
  wordId: uuid,
  normalized: z.string().min(2).max(32),
  start: coordinateSchema,
  end: coordinateSchema,
  direction: directionSchema,
  reversed: z.boolean(),
  path: z.array(coordinateSchema).min(2),
});

export const gridMetadataSchema = z
  .object({
    size: z.number().int().min(MIN_GRID_SIZE).max(MAX_GRID_SIZE),
    displayRows: z.array(z.string()),
    normalizedRows: z.array(z.string()),
  })
  .superRefine((value, ctx) => {
    if (value.displayRows.length !== value.size) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["displayRows"],
        message: `Expected ${value.size} rows, received ${value.displayRows.length}`,
      });
    }
    if (value.normalizedRows.length !== value.displayRows.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["normalizedRows"],
        message: "Display and normalized grids must have the same number of rows",
      });
    }
    // A ragged grid would silently corrupt every coordinate lookup.
    const badRow = value.displayRows.findIndex((row) => [...row].length !== value.size);
    if (badRow >= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["displayRows", badRow],
        message: `Row ${badRow} has ${[...value.displayRows[badRow]].length} cells, expected ${value.size}`,
      });
    }
  });

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export const puzzleTemplateSchema = z
  .object({
    journeyId: uuid,
    languageCode: localeCode,
    difficulty,
    version: z.number().int().min(1).default(1),
    status: z.enum(["draft", "active", "archived"]).default("draft"),

    minGridSize: z.number().int().min(MIN_GRID_SIZE).max(MAX_GRID_SIZE).default(10),
    maxGridSize: z.number().int().min(MIN_GRID_SIZE).max(MAX_GRID_SIZE).default(16),
    targetWordCount: z.number().int().min(3).max(40).default(8),

    allowedDirections: z.array(directionSchema).min(1, "At least one direction is required"),
    allowReversed: z.boolean().default(false),
    allowDiagonal: z.boolean().default(true),
    overlapStrategy: z.enum(["none", "allowed", "encouraged"]).default("allowed"),

    seedStrategy: z.enum(["per_journey", "per_user", "per_day"]).default("per_journey"),
    maxAttempts: z.number().int().min(10).max(5000).default(200),
    fillerStrategy: z.enum(["uniform", "weighted", "word_letters"]).default("weighted"),
    customAlphabet: z.string().min(10).max(64).optional(),

    hintPolicy: z.enum(["none", "limited", "unlimited"]).default("limited"),
    maxHints: z.number().int().min(0).max(50).default(3),
    fullSolutionEnabled: z.boolean().default(true),

    expectedDurationSeconds: z.number().int().positive().max(7200).optional(),
    minEngineVersion: z.string().default("0.0.0"),
  })
  .superRefine((value, ctx) => {
    if (value.maxGridSize < value.minGridSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxGridSize"],
        message: "Maximum grid size must be at least the minimum",
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

    const reversed: readonly string[] = ["W", "N", "NW", "SW"];
    if (!value.allowReversed && value.allowedDirections.some((d) => reversed.includes(d))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["allowedDirections"],
        message: "Reversed directions are listed but reversed words are disabled",
      });
    }

    // A puzzle with more words than cells can never be generated.
    if (value.targetWordCount > value.maxGridSize * 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetWordCount"],
        message: `${value.targetWordCount} words will not fit a ${value.maxGridSize}x${value.maxGridSize} grid`,
      });
    }

    if (value.hintPolicy === "limited" && value.maxHints === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxHints"],
        message: "Limited hints require at least one hint; use policy 'none' instead",
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

export type PuzzleTemplateInput = z.input<typeof puzzleTemplateSchema>;
export type PuzzleTemplateValues = z.output<typeof puzzleTemplateSchema>;

// ---------------------------------------------------------------------------
// Generation requests
// ---------------------------------------------------------------------------

export const generationRequestSchema = z.object({
  journeyId: uuid,
  templateId: uuid.optional(),
  languageCode: localeCode,
  difficulty,
  seed: z.number().int().optional(),
  engineVersion: z.string().min(1),
  idempotencyKey: z.string().min(8).max(200).optional(),
});

export const generationResultSchema = z.object({
  requestId: uuid,
  status: z.enum(["succeeded", "failed", "cancelled"]),
  instanceId: uuid.optional(),
  durationMs: z.number().int().min(0).optional(),
  errorCode: z.string().max(80).optional(),
  errorDetail: z.string().max(2000).optional(),
});

// ---------------------------------------------------------------------------
// Sessions and progress
// ---------------------------------------------------------------------------

export const sessionStartSchema = z.object({
  puzzleInstanceId: uuid,
  journeyId: uuid,
});

export const sessionUpdateSchema = z.object({
  sessionId: uuid,
  status: z.enum(["in_progress", "paused", "completed", "abandoned"]).optional(),
  elapsedMs: z
    .number()
    .int()
    .min(0)
    .max(24 * 60 * 60 * 1000)
    .optional(),
  completionPercent: z.number().int().min(0).max(100).optional(),
  hintsUsed: z.number().int().min(0).max(100).optional(),
  revealedSolution: z.boolean().optional(),
});

export const progressUpdateSchema = z.object({
  puzzleInstanceId: uuid,
  foundWords: z.array(z.string().min(2).max(32)).max(64),
  completionPercent: z.number().int().min(0).max(100),
});

export const attemptSchema = z.object({
  sessionId: uuid,
  selection: selectionSchema,
  selectedText: z.string().max(64).optional(),
  matchedWord: z.string().max(32).optional(),
  isCorrect: z.boolean(),
});

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export const puzzleEventTypeSchema = z.enum([
  "puzzle_started",
  "puzzle_paused",
  "puzzle_resumed",
  "puzzle_completed",
  "word_found",
  "hint_used",
  "puzzle_reset",
  "puzzle_regenerated",
]);

export const puzzleEventSchema = z.object({
  sessionId: uuid,
  type: puzzleEventTypeSchema,
  payload: z.record(z.string(), z.unknown()).default({}),
  // Required, not optional: idempotency is a guarantee of this system, and an
  // event without a key cannot be deduplicated.
  idempotencyKey: z.string().min(8).max(200),
  occurredAt: z.string().datetime().optional(),
});

export type PuzzleEventInput = z.infer<typeof puzzleEventSchema>;
export type SessionStartInput = z.infer<typeof sessionStartSchema>;
export type SessionUpdateInput = z.infer<typeof sessionUpdateSchema>;
export type ProgressUpdateInput = z.infer<typeof progressUpdateSchema>;
export type GenerationRequestInput = z.infer<typeof generationRequestSchema>;
export type AttemptInput = z.infer<typeof attemptSchema>;
