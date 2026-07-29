import { describe, expect, it } from "vitest";
import {
  collectionCreateSchema,
  dailyJourneyAssignmentSchema,
  journeyWordTranslationSchema,
  mediaMetadataSchema,
  publicationScheduleSchema,
  publishableJourneyTranslationSchema,
  puzzleSettingsSchema,
  scriptureReferenceSchema,
} from "./schemas";

const JOURNEY_ID = "11111111-1111-4111-8111-111111111111";
const WORD_ID = "22222222-2222-4222-8222-222222222222";
const SOURCE_ID = "33333333-3333-4333-8333-333333333333";

describe("collectionCreateSchema", () => {
  it("accepts a valid collection", () => {
    const result = collectionCreateSchema.safeParse({
      internalName: "Psalms",
      slug: "psalms",
      primaryLanguageCode: "en",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid slug", () => {
    const result = collectionCreateSchema.safeParse({
      internalName: "Psalms",
      slug: "Psalms Collection",
      primaryLanguageCode: "en",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unsupported language", () => {
    const result = collectionCreateSchema.safeParse({
      internalName: "Psalms",
      slug: "psalms",
      primaryLanguageCode: "fr",
    });
    expect(result.success).toBe(false);
  });
});

describe("publishableJourneyTranslationSchema", () => {
  const draft = {
    journeyId: JOURNEY_ID,
    languageCode: "en" as const,
    publicTitle: "Gratitude",
  };

  it("allows an incomplete draft", () => {
    expect(
      publishableJourneyTranslationSchema.safeParse({ ...draft, status: "draft" }).success,
    ).toBe(true);
  });

  it("blocks publishing a translation with empty bodies", () => {
    const result = publishableJourneyTranslationSchema.safeParse({ ...draft, status: "published" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("devotionalBody");
      expect(paths).toContain("reflectionPrompt");
      expect(paths).toContain("prayerBody");
    }
  });

  it("allows publishing when every body is present", () => {
    const result = publishableJourneyTranslationSchema.safeParse({
      ...draft,
      status: "published",
      devotionalBody: "A devotional.",
      reflectionPrompt: "A question.",
      prayerBody: "A prayer.",
    });
    expect(result.success).toBe(true);
  });
});

describe("journeyWordTranslationSchema", () => {
  const base = { journeyWordId: WORD_ID, languageCode: "pt" as const };

  it("accepts an accented word", () => {
    expect(
      journeyWordTranslationSchema.safeParse({ ...base, displayValue: "ORAÇÃO" }).success,
    ).toBe(true);
  });

  it("rejects punctuation-only values", () => {
    const result = journeyWordTranslationSchema.safeParse({ ...base, displayValue: "----" });
    expect(result.success).toBe(false);
  });

  it("rejects values that normalize below the minimum length", () => {
    // "A-B" normalizes to "AB" (2 chars, valid); "A-" normalizes to "A" (too short).
    const result = journeyWordTranslationSchema.safeParse({ ...base, displayValue: "A-" });
    expect(result.success).toBe(false);
  });
});

describe("puzzleSettingsSchema", () => {
  const base = { journeyId: JOURNEY_ID };

  it("applies documented defaults", () => {
    const result = puzzleSettingsSchema.parse(base);
    expect(result.minGridSize).toBe(10);
    expect(result.maxGridSize).toBe(16);
    expect(result.allowReversed).toBe(false);
    expect(result.fillerStrategy).toBe("weighted");
  });

  it("rejects a max grid smaller than the min grid", () => {
    const result = puzzleSettingsSchema.safeParse({ ...base, minGridSize: 16, maxGridSize: 10 });
    expect(result.success).toBe(false);
  });

  it("rejects a default difficulty outside the allowed set", () => {
    const result = puzzleSettingsSchema.safeParse({
      ...base,
      defaultDifficulty: "expert",
      allowedDifficulties: ["gentle", "balanced"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects diagonal directions when diagonals are disabled", () => {
    const result = puzzleSettingsSchema.safeParse({
      ...base,
      allowDiagonal: false,
      allowedDirections: ["E", "SE"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a custom alphabet with duplicate characters", () => {
    const result = puzzleSettingsSchema.safeParse({ ...base, customAlphabet: "AABCDEFGHIJ" });
    expect(result.success).toBe(false);
  });

  it("rejects grid sizes outside the supported range", () => {
    expect(puzzleSettingsSchema.safeParse({ ...base, minGridSize: 3 }).success).toBe(false);
    expect(puzzleSettingsSchema.safeParse({ ...base, maxGridSize: 40 }).success).toBe(false);
  });
});

describe("scriptureReferenceSchema", () => {
  const base = {
    journeyId: JOURNEY_ID,
    sourceId: SOURCE_ID,
    bookCode: "PHP",
    chapter: 4,
    verseStart: 6,
    displayReference: "Philippians 4:6-7",
  };

  it("accepts a valid reference", () => {
    expect(scriptureReferenceSchema.safeParse({ ...base, verseEnd: 7 }).success).toBe(true);
  });

  it("rejects an end verse before the start verse", () => {
    expect(scriptureReferenceSchema.safeParse({ ...base, verseEnd: 3 }).success).toBe(false);
  });

  it("rejects a malformed book code", () => {
    expect(scriptureReferenceSchema.safeParse({ ...base, bookCode: "Philippians" }).success).toBe(
      false,
    );
  });
});

describe("publicationScheduleSchema", () => {
  const future = new Date(Date.now() + 86_400_000).toISOString();
  const later = new Date(Date.now() + 172_800_000).toISOString();

  it("accepts a future publish window", () => {
    const result = publicationScheduleSchema.safeParse({
      entityType: "journey",
      entityId: JOURNEY_ID,
      scheduledPublishAt: future,
      scheduledUnpublishAt: later,
    });
    expect(result.success).toBe(true);
  });

  it("rejects unpublishing before publishing", () => {
    const result = publicationScheduleSchema.safeParse({
      entityType: "journey",
      entityId: JOURNEY_ID,
      scheduledPublishAt: later,
      scheduledUnpublishAt: future,
    });
    expect(result.success).toBe(false);
  });

  it("rejects scheduling in the past", () => {
    const result = publicationScheduleSchema.safeParse({
      entityType: "journey",
      entityId: JOURNEY_ID,
      scheduledPublishAt: new Date(Date.now() - 86_400_000).toISOString(),
    });
    expect(result.success).toBe(false);
  });
});

describe("dailyJourneyAssignmentSchema", () => {
  it("requires an ISO date", () => {
    expect(
      dailyJourneyAssignmentSchema.safeParse({
        journeyDate: "2026-08-01",
        languageCode: "en",
        journeyId: JOURNEY_ID,
      }).success,
    ).toBe(true);
    expect(
      dailyJourneyAssignmentSchema.safeParse({
        journeyDate: "01/08/2026",
        languageCode: "en",
        journeyId: JOURNEY_ID,
      }).success,
    ).toBe(false);
  });
});

describe("mediaMetadataSchema", () => {
  const base = { storagePath: "collections/cover.webp", mimeType: "image/webp" as const };

  it("accepts an allowed image type within the size limit", () => {
    expect(mediaMetadataSchema.safeParse({ ...base, byteSize: 500_000 }).success).toBe(true);
  });

  it("rejects executables and other disallowed types", () => {
    expect(
      mediaMetadataSchema.safeParse({
        storagePath: "x.svg",
        mimeType: "image/svg+xml",
        byteSize: 1000,
      }).success,
    ).toBe(false);
  });

  it("rejects files above the size limit", () => {
    expect(mediaMetadataSchema.safeParse({ ...base, byteSize: 11 * 1024 * 1024 }).success).toBe(
      false,
    );
  });
});
