import { describe, expect, it } from "vitest";
import {
  ENGINE_VERSION,
  PuzzleEngineError,
  contentHash,
  createRng,
  deriveSeed,
  notImplementedEngine,
  reproducibilityKeyOf,
  seedFor,
} from "./engine";
import { fromRows, type Placement } from "./grid";

// Determinism is the property the whole replay architecture rests on. If these
// tests ever fail, previously generated puzzles stop reproducing.

describe("createRng", () => {
  it("produces an identical sequence for the same seed", () => {
    const a = createRng(12345);
    const b = createRng(12345);
    const seqA = Array.from({ length: 50 }, () => a());
    const seqB = Array.from({ length: 50 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("produces different sequences for different seeds", () => {
    const a = createRng(1);
    const b = createRng(2);
    expect(Array.from({ length: 10 }, () => a())).not.toEqual(
      Array.from({ length: 10 }, () => b()),
    );
  });

  it("stays within [0, 1)", () => {
    const rng = createRng(999);
    for (let i = 0; i < 1000; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("is stable across separate constructions interleaved with other work", () => {
    const first = createRng(42);
    const firstThree = [first(), first(), first()];
    createRng(7)(); // unrelated generator must not affect the one above
    const second = createRng(42);
    expect([second(), second(), second()]).toEqual(firstThree);
  });
});

describe("deriveSeed", () => {
  it("is deterministic for the same parts", () => {
    expect(deriveSeed("a", 1, "b")).toBe(deriveSeed("a", 1, "b"));
  });

  it("is order-sensitive", () => {
    expect(deriveSeed("a", "b")).not.toBe(deriveSeed("b", "a"));
  });

  it("returns an unsigned 32-bit integer", () => {
    const seed = deriveSeed("template-id", 3, "2026-07-29");
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThanOrEqual(0xffffffff);
  });
});

describe("seedFor", () => {
  const base = { templateId: "t-1", templateVersion: 1 };

  it("per_journey ignores user and date, so everyone shares one puzzle", () => {
    const a = seedFor({ ...base, strategy: "per_journey", userId: "u1", date: "2026-01-01" });
    const b = seedFor({ ...base, strategy: "per_journey", userId: "u2", date: "2026-06-06" });
    expect(a).toBe(b);
  });

  it("per_user gives different readers different puzzles", () => {
    const a = seedFor({ ...base, strategy: "per_user", userId: "u1" });
    const b = seedFor({ ...base, strategy: "per_user", userId: "u2" });
    expect(a).not.toBe(b);
  });

  it("per_user is stable for the same reader across visits", () => {
    expect(seedFor({ ...base, strategy: "per_user", userId: "u1" })).toBe(
      seedFor({ ...base, strategy: "per_user", userId: "u1" }),
    );
  });

  it("per_day changes with the date but is stable within a day", () => {
    const day1 = seedFor({ ...base, strategy: "per_day", date: "2026-07-29" });
    const day1Again = seedFor({ ...base, strategy: "per_day", date: "2026-07-29" });
    const day2 = seedFor({ ...base, strategy: "per_day", date: "2026-07-30" });
    expect(day1).toBe(day1Again);
    expect(day1).not.toBe(day2);
  });

  it("a new template version yields a different seed", () => {
    const v1 = seedFor({ ...base, strategy: "per_journey" });
    const v2 = seedFor({ ...base, templateVersion: 2, strategy: "per_journey" });
    expect(v1).not.toBe(v2);
  });
});

describe("reproducibilityKeyOf", () => {
  it("includes all four determinism inputs", () => {
    const key = reproducibilityKeyOf({
      templateId: "t-1",
      templateVersion: 2,
      seed: 42,
      engineVersion: "1.0.0",
    });
    expect(key).toBe("t-1:2:42:1.0.0");
  });

  it("differs when any single input differs", () => {
    const base = { templateId: "t", templateVersion: 1, seed: 1, engineVersion: "1.0.0" };
    const variants = [
      { ...base, templateId: "other" },
      { ...base, templateVersion: 2 },
      { ...base, seed: 2 },
      { ...base, engineVersion: "1.0.1" },
    ];
    const keys = new Set(variants.map(reproducibilityKeyOf));
    expect(keys.size).toBe(4);
    expect(keys.has(reproducibilityKeyOf(base))).toBe(false);
  });
});

describe("contentHash", () => {
  const grid = fromRows(["ABC", "DEF", "GHI"], ["ABC", "DEF", "GHI"]);
  const placement: Placement = {
    wordId: "w1",
    normalized: "ABC",
    start: { row: 0, col: 0 },
    end: { row: 0, col: 2 },
    direction: "E",
    reversed: false,
    path: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ],
  };
  const other: Placement = {
    ...placement,
    wordId: "w2",
    normalized: "DEF",
    start: { row: 1, col: 0 },
    end: { row: 1, col: 2 },
  };

  it("is stable for identical content", () => {
    expect(contentHash(grid, [placement])).toBe(contentHash(grid, [placement]));
  });

  it("ignores placement order — only content matters", () => {
    expect(contentHash(grid, [placement, other])).toBe(contentHash(grid, [other, placement]));
  });

  it("changes when the grid changes", () => {
    const changed = fromRows(["XBC", "DEF", "GHI"], ["XBC", "DEF", "GHI"]);
    expect(contentHash(grid, [placement])).not.toBe(contentHash(changed, [placement]));
  });

  it("changes when a placement moves", () => {
    const moved: Placement = { ...placement, start: { row: 1, col: 0 }, end: { row: 1, col: 2 } };
    expect(contentHash(grid, [placement])).not.toBe(contentHash(grid, [moved]));
  });

  it("is a fixed-width hex digest", () => {
    expect(contentHash(grid, [placement])).toMatch(/^[0-9a-f]{8}$/);
  });
});

describe("notImplementedEngine", () => {
  it("reports a version distinct from the real engine", () => {
    // Phase 4 shipped a real engine; the placeholder is kept only to exercise
    // the "no engine configured" path and must never be mistaken for it.
    expect(notImplementedEngine.version).toBe("0.0.0-not-implemented");
    expect(notImplementedEngine.version).not.toBe(ENGINE_VERSION);
  });

  it("fails loudly rather than returning an empty puzzle", () => {
    expect(() =>
      notImplementedEngine.generate({
        words: [],
        languageCode: "en",
        difficulty: "gentle",
        gridSize: 10,
        directions: ["E"],
        allowReversed: false,
        allowDiagonal: false,
        overlapStrategy: "allowed",
        fillerStrategy: "uniform",
        maxAttempts: 100,
        seed: 1,
      }),
    ).toThrow(PuzzleEngineError);
  });
});
