import { describe, expect, it } from "vitest";
import {
  coordinateSchema,
  generationRequestSchema,
  gridMetadataSchema,
  placementSchema,
  progressUpdateSchema,
  puzzleEventSchema,
  puzzleTemplateSchema,
  selectionSchema,
  sessionUpdateSchema,
} from "./schemas";

const JOURNEY = "11111111-1111-4111-8111-111111111111";
const SESSION = "22222222-2222-4222-8222-222222222222";
const WORD = "33333333-3333-4333-8333-333333333333";

const validTemplate = {
  journeyId: JOURNEY,
  languageCode: "en" as const,
  difficulty: "gentle" as const,
  allowedDirections: ["E", "S"] as const,
};

describe("puzzleTemplateSchema", () => {
  it("accepts a minimal template and applies defaults", () => {
    const result = puzzleTemplateSchema.parse({ ...validTemplate, allowedDirections: ["E", "S"] });
    expect(result.minGridSize).toBe(10);
    expect(result.maxGridSize).toBe(16);
    expect(result.status).toBe("draft");
    expect(result.version).toBe(1);
    expect(result.hintPolicy).toBe("limited");
  });

  it("rejects a max grid smaller than the min", () => {
    const result = puzzleTemplateSchema.safeParse({
      ...validTemplate,
      allowedDirections: ["E"],
      minGridSize: 16,
      maxGridSize: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects diagonal directions when diagonals are disabled", () => {
    const result = puzzleTemplateSchema.safeParse({
      ...validTemplate,
      allowedDirections: ["E", "SE"],
      allowDiagonal: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects reversed directions when reversed words are disabled", () => {
    const result = puzzleTemplateSchema.safeParse({
      ...validTemplate,
      allowedDirections: ["E", "W"],
      allowReversed: false,
    });
    expect(result.success).toBe(false);
  });

  it("accepts reversed directions once reversal is enabled", () => {
    const result = puzzleTemplateSchema.safeParse({
      ...validTemplate,
      allowedDirections: ["E", "W"],
      allowReversed: true,
    });
    expect(result.success).toBe(true);
  });

  it("requires at least one direction", () => {
    const result = puzzleTemplateSchema.safeParse({ ...validTemplate, allowedDirections: [] });
    expect(result.success).toBe(false);
  });

  it("rejects more words than a grid could ever hold", () => {
    const result = puzzleTemplateSchema.safeParse({
      ...validTemplate,
      allowedDirections: ["E"],
      maxGridSize: 10,
      targetWordCount: 40,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a limited hint policy with zero hints", () => {
    const result = puzzleTemplateSchema.safeParse({
      ...validTemplate,
      allowedDirections: ["E"],
      hintPolicy: "limited",
      maxHints: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a custom alphabet with duplicates", () => {
    const result = puzzleTemplateSchema.safeParse({
      ...validTemplate,
      allowedDirections: ["E"],
      customAlphabet: "AABCDEFGHIJ",
    });
    expect(result.success).toBe(false);
  });
});

describe("coordinate and selection schemas", () => {
  it("accepts in-range coordinates", () => {
    expect(coordinateSchema.safeParse({ row: 0, col: 0 }).success).toBe(true);
    expect(coordinateSchema.safeParse({ row: 31, col: 31 }).success).toBe(true);
  });

  it("rejects negative and out-of-range coordinates", () => {
    expect(coordinateSchema.safeParse({ row: -1, col: 0 }).success).toBe(false);
    expect(coordinateSchema.safeParse({ row: 0, col: 32 }).success).toBe(false);
    expect(coordinateSchema.safeParse({ row: 1.5, col: 0 }).success).toBe(false);
  });

  it("validates a selection as two coordinates", () => {
    expect(
      selectionSchema.safeParse({ start: { row: 0, col: 0 }, end: { row: 0, col: 4 } }).success,
    ).toBe(true);
  });
});

describe("gridMetadataSchema", () => {
  // 6 is the smallest supported grid, so fixtures are 6x6.
  const SQUARE = ["ABCDEF", "GHIJKL", "MNOPQR", "STUVWX", "YZABCD", "EFGHIJ"];

  it("accepts a square grid", () => {
    const result = gridMetadataSchema.safeParse({
      size: 6,
      displayRows: SQUARE,
      normalizedRows: SQUARE,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a grid smaller than the supported minimum", () => {
    const result = gridMetadataSchema.safeParse({
      size: 3,
      displayRows: ["ABC", "DEF", "GHI"],
      normalizedRows: ["ABC", "DEF", "GHI"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a row count that disagrees with size", () => {
    const result = gridMetadataSchema.safeParse({
      size: 6,
      displayRows: SQUARE.slice(0, 5),
      normalizedRows: SQUARE.slice(0, 5),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a ragged grid, which would corrupt every coordinate lookup", () => {
    const ragged = [...SQUARE];
    ragged[1] = "GHIJK";
    const result = gridMetadataSchema.safeParse({
      size: 6,
      displayRows: ragged,
      normalizedRows: SQUARE,
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched display and normalized row counts", () => {
    const result = gridMetadataSchema.safeParse({
      size: 6,
      displayRows: SQUARE,
      normalizedRows: SQUARE.slice(0, 5),
    });
    expect(result.success).toBe(false);
  });
});

describe("placementSchema", () => {
  it("accepts a well-formed placement", () => {
    const result = placementSchema.safeParse({
      wordId: WORD,
      normalized: "GRACE",
      start: { row: 0, col: 0 },
      end: { row: 0, col: 4 },
      direction: "E",
      reversed: false,
      path: [0, 1, 2, 3, 4].map((col) => ({ row: 0, col })),
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown direction", () => {
    const result = placementSchema.safeParse({
      wordId: WORD,
      normalized: "GRACE",
      start: { row: 0, col: 0 },
      end: { row: 0, col: 4 },
      direction: "UP",
      reversed: false,
      path: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe("session and progress schemas", () => {
  it("caps elapsed time at a day to reject absurd clocks", () => {
    expect(sessionUpdateSchema.safeParse({ sessionId: SESSION, elapsedMs: 1000 }).success).toBe(
      true,
    );
    expect(
      sessionUpdateSchema.safeParse({ sessionId: SESSION, elapsedMs: 999_999_999 }).success,
    ).toBe(false);
  });

  it("bounds completion to 0-100", () => {
    expect(
      progressUpdateSchema.safeParse({
        puzzleInstanceId: JOURNEY,
        foundWords: ["GRACE"],
        completionPercent: 101,
      }).success,
    ).toBe(false);
  });

  it("rejects an implausibly long found-words list", () => {
    expect(
      progressUpdateSchema.safeParse({
        puzzleInstanceId: JOURNEY,
        foundWords: Array(100).fill("WORD"),
        completionPercent: 50,
      }).success,
    ).toBe(false);
  });
});

describe("puzzleEventSchema", () => {
  it("requires an idempotency key", () => {
    const withoutKey = puzzleEventSchema.safeParse({
      sessionId: SESSION,
      type: "word_found",
      payload: {},
    });
    expect(withoutKey.success).toBe(false);
  });

  it("accepts a well-formed event", () => {
    const result = puzzleEventSchema.safeParse({
      sessionId: SESSION,
      type: "word_found",
      payload: { word: "GRACE" },
      idempotencyKey: "word_found:session:GRACE",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown event type", () => {
    const result = puzzleEventSchema.safeParse({
      sessionId: SESSION,
      type: "player_cheated",
      idempotencyKey: "some-key-value",
    });
    expect(result.success).toBe(false);
  });
});

describe("generationRequestSchema", () => {
  it("accepts a request with an idempotency key", () => {
    const result = generationRequestSchema.safeParse({
      journeyId: JOURNEY,
      languageCode: "pt",
      difficulty: "balanced",
      engineVersion: "1.0.0",
      idempotencyKey: "journey-pt-balanced-v1",
    });
    expect(result.success).toBe(true);
  });

  it("requires an engine version so results are attributable to a build", () => {
    const result = generationRequestSchema.safeParse({
      journeyId: JOURNEY,
      languageCode: "en",
      difficulty: "gentle",
    });
    expect(result.success).toBe(false);
  });
});
