import { describe, expect, it } from "vitest";
import {
  buildShareSafeCompletion,
  completeJourneySchema,
  completeStepSchema,
  historyQuerySchema,
  PRAYER_MAX_LENGTH,
  REFLECTION_MAX_LENGTH,
  savePrayerSchema,
  saveReflectionSchema,
  shareSafeCompletionSchema,
  startJourneySchema,
  timeZoneSchema,
  toggleFavoriteSchema,
} from "./schemas";

const UUID = "3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
const OTHER_UUID = "9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d";

describe("startJourneySchema", () => {
  it("accepts a minimal start", () => {
    const result = startJourneySchema.parse({ journeyId: UUID, languageCode: "pt" });
    expect(result.difficulty).toBe("gentle");
  });

  it("rejects a non-uuid journey id", () => {
    expect(startJourneySchema.safeParse({ journeyId: "abc", languageCode: "en" }).success).toBe(
      false,
    );
  });

  it("rejects an unsupported locale", () => {
    expect(startJourneySchema.safeParse({ journeyId: UUID, languageCode: "fr" }).success).toBe(
      false,
    );
  });

  it("requires an assigned date to be a plain calendar date", () => {
    expect(
      startJourneySchema.safeParse({
        journeyId: UUID,
        languageCode: "en",
        assignedDate: "2026-07-29T10:00:00Z",
      }).success,
    ).toBe(false);

    expect(
      startJourneySchema.safeParse({
        journeyId: UUID,
        languageCode: "en",
        assignedDate: "2026-07-29",
      }).success,
    ).toBe(true);
  });
});

describe("completeStepSchema", () => {
  it("accepts a step with safe metadata", () => {
    const result = completeStepSchema.parse({
      sessionId: UUID,
      stepType: "puzzle",
      timeSpentMs: 45_000,
      metadata: { hintsUsed: 2, revealed: false, difficulty: "gentle" },
    });
    expect(result.metadata).toEqual({ hintsUsed: 2, revealed: false, difficulty: "gentle" });
  });

  it("rejects nested metadata that could smuggle a private body", () => {
    expect(
      completeStepSchema.safeParse({
        sessionId: UUID,
        stepType: "reflection",
        metadata: { reflection: { body: "private" } },
      }).success,
    ).toBe(false);
  });

  it("rejects an unknown step type", () => {
    expect(completeStepSchema.safeParse({ sessionId: UUID, stepType: "audio" }).success).toBe(
      false,
    );
  });

  it("caps reported time at a day so a stuck timer cannot inflate progress", () => {
    expect(
      completeStepSchema.safeParse({
        sessionId: UUID,
        stepType: "puzzle",
        timeSpentMs: 25 * 60 * 60 * 1000,
      }).success,
    ).toBe(false);
  });

  it("rejects negative time", () => {
    expect(
      completeStepSchema.safeParse({ sessionId: UUID, stepType: "puzzle", timeSpentMs: -1 })
        .success,
    ).toBe(false);
  });
});

describe("completeJourneySchema", () => {
  it("requires an elapsed time within a day", () => {
    expect(completeJourneySchema.safeParse({ sessionId: UUID, elapsedMs: 0 }).success).toBe(true);
    expect(
      completeJourneySchema.safeParse({ sessionId: UUID, elapsedMs: 24 * 60 * 60 * 1000 + 1 })
        .success,
    ).toBe(false);
  });
});

describe("saveReflectionSchema", () => {
  it("trims and requires actual content", () => {
    expect(
      saveReflectionSchema.safeParse({
        journeyId: UUID,
        languageCode: "en",
        body: "   ",
      }).success,
    ).toBe(false);
  });

  it("accepts a written reflection", () => {
    const result = saveReflectionSchema.parse({
      journeyId: UUID,
      languageCode: "es",
      body: "  Hoy aprendí algo nuevo.  ",
    });
    expect(result.body).toBe("Hoy aprendí algo nuevo.");
  });

  it("enforces the length ceiling", () => {
    expect(
      saveReflectionSchema.safeParse({
        journeyId: UUID,
        languageCode: "en",
        body: "a".repeat(REFLECTION_MAX_LENGTH + 1),
      }).success,
    ).toBe(false);
  });
});

describe("savePrayerSchema", () => {
  it("accepts a bare acknowledgement with no words", () => {
    const result = savePrayerSchema.parse({
      journeyId: UUID,
      languageCode: "en",
      acknowledged: true,
    });
    expect(result.acknowledged).toBe(true);
    expect(result.body).toBeUndefined();
  });

  it("accepts a written prayer without acknowledgement", () => {
    expect(
      savePrayerSchema.safeParse({
        journeyId: UUID,
        languageCode: "pt",
        acknowledged: false,
        body: "Obrigado.",
      }).success,
    ).toBe(true);
  });

  it("rejects a prayer that is neither acknowledged nor written", () => {
    const result = savePrayerSchema.safeParse({ journeyId: UUID, languageCode: "en" });
    expect(result.success).toBe(false);
  });

  it("enforces the length ceiling", () => {
    expect(
      savePrayerSchema.safeParse({
        journeyId: UUID,
        languageCode: "en",
        acknowledged: true,
        body: "a".repeat(PRAYER_MAX_LENGTH + 1),
      }).success,
    ).toBe(false);
  });
});

describe("toggleFavoriteSchema", () => {
  it("accepts exactly one matching id", () => {
    expect(toggleFavoriteSchema.safeParse({ entityType: "journey", journeyId: UUID }).success).toBe(
      true,
    );
    expect(
      toggleFavoriteSchema.safeParse({ entityType: "collection", collectionId: UUID }).success,
    ).toBe(true);
  });

  it("rejects a missing id", () => {
    expect(toggleFavoriteSchema.safeParse({ entityType: "journey" }).success).toBe(false);
  });

  it("rejects a mismatched id", () => {
    expect(
      toggleFavoriteSchema.safeParse({ entityType: "journey", collectionId: UUID }).success,
    ).toBe(false);
  });

  it("rejects both ids at once, which the CHECK constraint would also refuse", () => {
    const result = toggleFavoriteSchema.safeParse({
      entityType: "journey",
      journeyId: UUID,
      collectionId: OTHER_UUID,
    });
    expect(result.success).toBe(false);
  });
});

describe("timeZoneSchema", () => {
  it("accepts IANA identifiers", () => {
    expect(timeZoneSchema.safeParse("America/Sao_Paulo").success).toBe(true);
    expect(timeZoneSchema.safeParse("UTC").success).toBe(true);
  });

  it("rejects a bare offset, which cannot express daylight saving", () => {
    expect(timeZoneSchema.safeParse("-03:00").success).toBe(false);
    expect(timeZoneSchema.safeParse("GMT-3").success).toBe(false);
  });
});

describe("historyQuerySchema", () => {
  it("applies defaults", () => {
    const result = historyQuerySchema.parse({});
    expect(result).toMatchObject({ status: "all", languageCode: "en", limit: 20, offset: 0 });
  });

  it("caps the page size", () => {
    expect(historyQuerySchema.safeParse({ limit: 500 }).success).toBe(false);
  });

  it("trims a search term", () => {
    expect(historyQuerySchema.parse({ search: "  grace  " }).search).toBe("grace");
  });
});

// ---------------------------------------------------------------------------
// The share-safe payload — the privacy boundary of the product
// ---------------------------------------------------------------------------

const VALID_SHARE = {
  journeyTitle: "Peace That Guards",
  collectionTitle: "Philippians",
  scriptureReference: "Philippians 4:6-7",
  completionDate: "2026-07-29",
  locale: "en" as const,
};

describe("shareSafeCompletionSchema", () => {
  it("accepts a whitelisted payload", () => {
    expect(shareSafeCompletionSchema.safeParse(VALID_SHARE).success).toBe(true);
  });

  it("rejects an unknown key rather than dropping it", () => {
    const result = shareSafeCompletionSchema.safeParse({ ...VALID_SHARE, streak: 7 });
    expect(result.success).toBe(false);
  });

  it("refuses a precise timestamp in place of a date", () => {
    expect(
      shareSafeCompletionSchema.safeParse({
        ...VALID_SHARE,
        completionDate: "2026-07-29T10:32:11Z",
      }).success,
    ).toBe(false);
  });
});

describe("buildShareSafeCompletion", () => {
  it("returns the payload when everything is public", () => {
    const result = buildShareSafeCompletion(VALID_SHARE);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.payload.journeyTitle).toBe("Peace That Guards");
  });

  it.each([
    ["reflection", { reflection: "I felt seen today." }],
    ["reflectionBody", { reflectionBody: "I felt seen today." }],
    ["prayer", { prayer: "Please help me." }],
    ["prayerBody", { prayerBody: "Please help me." }],
    ["body", { body: "anything" }],
    ["email", { email: "reader@example.com" }],
    ["userId", { userId: UUID }],
    ["user_id", { user_id: UUID }],
    ["sessionId", { sessionId: UUID }],
    ["session_id", { session_id: UUID }],
    ["journeyId", { journeyId: UUID }],
    ["journey_id", { journey_id: UUID }],
    ["id", { id: UUID }],
  ])("names %s as private and refuses to share it", (key, extra) => {
    const result = buildShareSafeCompletion({ ...VALID_SHARE, ...extra });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.join(" ")).toContain(key);
      expect(result.issues.join(" ")).toContain("private");
    }
  });

  it("rejects a whole session row rather than trimming it to safe fields", () => {
    const sessionRow = {
      id: UUID,
      user_id: OTHER_UUID,
      journey_id: UUID,
      status: "completed",
      elapsed_ms: 421_000,
      ...VALID_SHARE,
    };
    expect(buildShareSafeCompletion(sessionRow).ok).toBe(false);
  });

  it("reports schema issues with their field path", () => {
    const result = buildShareSafeCompletion({ ...VALID_SHARE, journeyTitle: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues.join(" ")).toContain("journeyTitle");
  });

  it("rejects a non-object", () => {
    expect(buildShareSafeCompletion("Peace That Guards").ok).toBe(false);
    expect(buildShareSafeCompletion(null).ok).toBe(false);
  });

  it("caps a personal message so a share card cannot become a document", () => {
    const result = buildShareSafeCompletion({ ...VALID_SHARE, message: "a".repeat(281) });
    expect(result.ok).toBe(false);
  });
});
