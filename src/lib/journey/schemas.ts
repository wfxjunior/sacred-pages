import { z } from "zod";
import { JOURNEY_STEP_TYPES } from "./state";

// Validation for the journey/progress domain, plus the share-safe payload —
// which is the single most privacy-sensitive schema in the product.

const uuid = z.string().uuid();
const localeCode = z.enum(["en", "pt", "es"]);
const difficulty = z.enum(["gentle", "balanced", "challenging", "expert"]);

export const REFLECTION_MAX_LENGTH = 10_000;
export const PRAYER_MAX_LENGTH = 10_000;

// ---------------------------------------------------------------------------
// Sessions and steps
// ---------------------------------------------------------------------------

export const startJourneySchema = z.object({
  journeyId: uuid,
  collectionId: uuid.optional(),
  languageCode: localeCode,
  difficulty: difficulty.default("gentle"),
  /** Set when opening via the Daily Journey, in the reader's local date. */
  assignedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const completeStepSchema = z.object({
  sessionId: uuid,
  stepType: z.enum(JOURNEY_STEP_TYPES),
  timeSpentMs: z
    .number()
    .int()
    .min(0)
    .max(24 * 60 * 60 * 1000)
    .optional(),
  /** Safe metadata only — never reflection or prayer text. */
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export const completeJourneySchema = z.object({
  sessionId: uuid,
  elapsedMs: z
    .number()
    .int()
    .min(0)
    .max(24 * 60 * 60 * 1000),
});

// ---------------------------------------------------------------------------
// Private responses
// ---------------------------------------------------------------------------

export const saveReflectionSchema = z.object({
  journeyId: uuid,
  sessionId: uuid.optional(),
  languageCode: localeCode,
  body: z.string().trim().min(1, "Write something first").max(REFLECTION_MAX_LENGTH),
  promptVersion: z.number().int().positive().optional(),
});

export const savePrayerSchema = z
  .object({
    journeyId: uuid,
    sessionId: uuid.optional(),
    languageCode: localeCode,
    acknowledged: z.boolean().default(false),
    body: z.string().trim().max(PRAYER_MAX_LENGTH).optional(),
  })
  .refine((value) => value.acknowledged || (value.body?.length ?? 0) > 0, {
    message: "Acknowledge the prayer or write a response",
    path: ["acknowledged"],
  });

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------

export const toggleFavoriteSchema = z
  .object({
    entityType: z.enum(["journey", "collection"]),
    journeyId: uuid.optional(),
    collectionId: uuid.optional(),
  })
  .superRefine((value, ctx) => {
    const expected = value.entityType === "journey" ? value.journeyId : value.collectionId;
    if (!expected) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [`${value.entityType}Id`],
        message: `A ${value.entityType} id is required`,
      });
    }
    const unexpected = value.entityType === "journey" ? value.collectionId : value.journeyId;
    if (unexpected) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["entityType"],
        message: "Provide exactly one entity id",
      });
    }
  });

// ---------------------------------------------------------------------------
// Preferences
// ---------------------------------------------------------------------------

export const timeZoneSchema = z
  .string()
  .min(3)
  .max(64)
  // IANA identifiers look like Area/Location; a bare UTC offset is rejected
  // because it cannot express daylight saving.
  .regex(/^[A-Za-z]+(?:\/[A-Za-z_+-]+)+$|^UTC$/, "Use an IANA time zone such as America/Sao_Paulo");

export const historyQuerySchema = z.object({
  collectionId: uuid.optional(),
  status: z.enum(["all", "completed", "in_progress"]).default("all"),
  // Title search runs against the localized translation, so the locale is part
  // of the query rather than an ambient assumption.
  search: z.string().trim().max(120).optional(),
  languageCode: localeCode.default("en"),
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0),
});

// ---------------------------------------------------------------------------
// SHARE-SAFE PAYLOAD
// ---------------------------------------------------------------------------

/**
 * The ONLY shape permitted to leave the app as shareable content.
 *
 * `.strict()` is the point: an unknown key fails validation rather than being
 * silently forwarded. If someone later spreads a whole session object into a
 * share call, this throws instead of leaking a reflection.
 *
 * Explicitly excluded — private reflection, private prayer, email, user id,
 * session id, internal database ids, behavioural analytics, premium content.
 */
export const shareSafeCompletionSchema = z
  .object({
    journeyTitle: z.string().min(1).max(160),
    collectionTitle: z.string().max(160).optional(),
    scriptureReference: z.string().max(120).optional(),
    /** Date only — never a precise timestamp, which is behavioural data. */
    completionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    milestoneTitle: z.string().max(120).optional(),
    message: z.string().max(280).optional(),
    imageUrl: z.string().url().optional(),
    locale: localeCode,
  })
  .strict();

export type ShareSafeCompletion = z.infer<typeof shareSafeCompletionSchema>;

/** Field names that must never appear in a share payload. */
const FORBIDDEN_SHARE_KEYS = [
  "reflection",
  "reflectionBody",
  "prayer",
  "prayerBody",
  "body",
  "email",
  "userId",
  "user_id",
  "sessionId",
  "session_id",
  "journeyId",
  "journey_id",
  "id",
] as const;

export type ShareBuildResult =
  | { readonly ok: true; readonly payload: ShareSafeCompletion }
  | { readonly ok: false; readonly issues: readonly string[] };

/**
 * Builds a share payload, refusing anything carrying private or identifying
 * fields.
 *
 * Two layers on purpose: an explicit forbidden-key scan gives a precise error
 * ("reflection is private"), and `.strict()` catches everything else.
 */
export function buildShareSafeCompletion(input: unknown): ShareBuildResult {
  if (input && typeof input === "object") {
    const present = Object.keys(input as Record<string, unknown>).filter((key) =>
      (FORBIDDEN_SHARE_KEYS as readonly string[]).includes(key),
    );
    if (present.length > 0) {
      return {
        ok: false,
        issues: present.map((key) => `"${key}" is private and can never be shared`),
      };
    }
  }

  const result = shareSafeCompletionSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      issues: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
    };
  }
  return { ok: true, payload: result.data };
}

export type StartJourneyInput = z.infer<typeof startJourneySchema>;
export type CompleteStepInput = z.infer<typeof completeStepSchema>;
export type SaveReflectionInput = z.infer<typeof saveReflectionSchema>;
export type SavePrayerInput = z.infer<typeof savePrayerSchema>;
export type ToggleFavoriteInput = z.infer<typeof toggleFavoriteSchema>;
export type HistoryQuery = z.infer<typeof historyQuerySchema>;
