import { describe, expect, it } from "vitest";
import {
  computeCompleteness,
  overallCompleteness,
  REQUIRED_JOURNEY_TRANSLATION_FIELDS,
  resolveTranslation,
  summarizeCoverage,
} from "./translation";
import type { TranslationStatus } from "./types";

type Row = {
  languageCode: string;
  status: TranslationStatus;
  publicTitle?: string;
  devotionalBody?: string;
  reflectionPrompt?: string;
  prayerBody?: string;
};

const published = (languageCode: string): Row => ({ languageCode, status: "published" });

describe("resolveTranslation", () => {
  it("returns the exact locale when published", () => {
    const result = resolveTranslation([published("en"), published("pt")], "pt");
    expect(result?.translation.languageCode).toBe("pt");
    expect(result?.isFallback).toBe(false);
  });

  it("falls back to English and flags it", () => {
    const result = resolveTranslation([published("en")], "es");
    expect(result?.translation.languageCode).toBe("en");
    expect(result?.isFallback).toBe(true);
    expect(result?.requestedLocale).toBe("es");
  });

  it("never serves a draft translation to the public", () => {
    const rows: Row[] = [
      { languageCode: "pt", status: "draft" },
      { languageCode: "en", status: "published" },
    ];
    const result = resolveTranslation(rows, "pt");
    expect(result?.translation.languageCode).toBe("en");
    expect(result?.isFallback).toBe(true);
  });

  it("returns null when nothing is publishable", () => {
    expect(resolveTranslation([{ languageCode: "pt", status: "draft" }], "pt")).toBeNull();
    expect(resolveTranslation([], "en")).toBeNull();
  });

  it("lets admin callers widen the allowed statuses", () => {
    const rows: Row[] = [{ languageCode: "pt", status: "in_review" }];
    const result = resolveTranslation(rows, "pt", ["draft", "in_review", "approved", "published"]);
    expect(result?.translation.languageCode).toBe("pt");
    expect(result?.isFallback).toBe(false);
  });
});

describe("computeCompleteness", () => {
  it("reports 100% when every required field is present", () => {
    const record: Row = {
      languageCode: "en",
      status: "draft",
      publicTitle: "T",
      devotionalBody: "D",
      reflectionPrompt: "R",
      prayerBody: "P",
    };
    const result = computeCompleteness(record, REQUIRED_JOURNEY_TRANSLATION_FIELDS);
    expect(result.percentComplete).toBe(100);
    expect(result.isPublishable).toBe(true);
    expect(result.missingFields).toEqual([]);
  });

  it("treats whitespace-only values as missing", () => {
    const record: Row = {
      languageCode: "en",
      status: "draft",
      publicTitle: "T",
      devotionalBody: "   ",
      reflectionPrompt: "R",
      prayerBody: "P",
    };
    const result = computeCompleteness(record, REQUIRED_JOURNEY_TRANSLATION_FIELDS);
    expect(result.missingFields).toEqual(["devotionalBody"]);
    expect(result.percentComplete).toBe(75);
    expect(result.isPublishable).toBe(false);
  });
});

describe("summarizeCoverage", () => {
  it("reports absent locales as missing at 0%", () => {
    const coverage = summarizeCoverage(
      [
        {
          languageCode: "en",
          status: "published",
          publicTitle: "T",
          devotionalBody: "D",
          reflectionPrompt: "R",
          prayerBody: "P",
        },
      ],
      ["en", "pt", "es"],
      REQUIRED_JOURNEY_TRANSLATION_FIELDS,
    );

    expect(coverage).toHaveLength(3);
    expect(coverage[0]).toMatchObject({ languageCode: "en", percentComplete: 100 });
    expect(coverage[1]).toMatchObject({
      languageCode: "pt",
      status: "missing",
      percentComplete: 0,
    });
    expect(coverage[2]).toMatchObject({
      languageCode: "es",
      status: "missing",
      percentComplete: 0,
    });
  });
});

describe("overallCompleteness", () => {
  it("averages across locales", () => {
    expect(
      overallCompleteness([
        {
          languageCode: "en",
          status: "published",
          percentComplete: 100,
          missingFields: [],
          isPublishable: true,
        },
        {
          languageCode: "pt",
          status: "missing",
          percentComplete: 0,
          missingFields: [],
          isPublishable: false,
        },
      ]),
    ).toBe(50);
  });

  it("is 0 for no locales", () => {
    expect(overallCompleteness([])).toBe(0);
  });
});
