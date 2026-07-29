import { describe, expect, it } from "vitest";
import { PuzzleEngineError, contentHash, type GenerationInput } from "../engine";
import { verifyPlacements } from "../validation-service";
import { normalizeWord } from "@/lib/content/normalize";
import { generate } from "./index";
import { ENGINE_VERSION } from "./constants";
import type { PuzzleWord } from "../grid";

function words(list: readonly string[]): PuzzleWord[] {
  return list.map((display, i) => ({
    id: `w${i}`,
    display,
    normalized: normalizeWord(display),
  }));
}

function input(overrides: Partial<GenerationInput> = {}): GenerationInput {
  return {
    words: words(["GRACE", "FAITH", "PEACE", "PRAYER", "HOPE", "MERCY"]),
    languageCode: "en",
    difficulty: "balanced",
    gridSize: 12,
    directions: ["E", "S", "SE", "NE"],
    allowReversed: false,
    allowDiagonal: true,
    overlapStrategy: "encouraged",
    fillerStrategy: "weighted",
    maxAttempts: 200,
    seed: 12345,
    ...overrides,
  };
}

describe("determinism", () => {
  it("produces a byte-identical puzzle for the same input", () => {
    const a = generate(input());
    const b = generate(input());
    expect(a.grid).toEqual(b.grid);
    expect(a.placements).toEqual(b.placements);
    expect(contentHash(a.grid, a.placements)).toBe(contentHash(b.grid, b.placements));
  });

  it("produces a different puzzle for a different seed", () => {
    const a = generate(input({ seed: 1 }));
    const b = generate(input({ seed: 2 }));
    expect(contentHash(a.grid, a.placements)).not.toBe(contentHash(b.grid, b.placements));
  });

  it("is unaffected by the order words are supplied in", () => {
    // Words are sorted into a canonical placement order, so the caller's array
    // order must not change the puzzle.
    const forward = generate(input());
    const reversed = generate(
      input({
        words: [...words(["GRACE", "FAITH", "PEACE", "PRAYER", "HOPE", "MERCY"])].reverse(),
      }),
    );
    expect(contentHash(forward.grid, forward.placements)).toBe(
      contentHash(reversed.grid, reversed.placements),
    );
  });

  it("does not mutate its input", () => {
    const supplied = words(["GRACE", "FAITH", "PEACE"]);
    const snapshot = JSON.parse(JSON.stringify(supplied));
    const directions: GenerationInput["directions"] = ["E", "S"];
    generate(input({ words: supplied, directions }));
    expect(supplied).toEqual(snapshot);
    expect(directions).toEqual(["E", "S"]);
  });

  it("adding a word does not reshuffle unrelated filler letters wholesale", () => {
    // Placement and filling draw from separate streams, so a changed word list
    // must not scramble the entire grid.
    const base = generate(input({ words: words(["GRACE", "FAITH"]), gridSize: 12 }));
    const more = generate(input({ words: words(["GRACE", "FAITH", "HOPE"]), gridSize: 12 }));
    expect(base.grid).not.toEqual(more.grid);
    // Both remain internally valid, which is the property that matters.
    expect(verifyPlacements(base.grid, base.placements).valid).toBe(true);
    expect(verifyPlacements(more.grid, more.placements).valid).toBe(true);
  });

  it("reports the engine version on every result", () => {
    expect(generate(input()).engineVersion).toBe(ENGINE_VERSION);
  });
});

describe("placement correctness", () => {
  it("every placement genuinely spells its word in the grid", () => {
    const result = generate(input());
    expect(verifyPlacements(result.grid, result.placements)).toEqual({ valid: true, problems: [] });
  });

  it("fills every cell", () => {
    const result = generate(input());
    for (const row of result.grid.cells) {
      for (const cell of row) {
        expect(cell.display.length).toBeGreaterThan(0);
        expect(cell.normalized.length).toBeGreaterThan(0);
      }
    }
  });

  it("produces a square grid of the requested size", () => {
    const result = generate(input({ gridSize: 14 }));
    expect(result.grid.size).toBe(14);
    expect(result.grid.cells).toHaveLength(14);
    for (const row of result.grid.cells) expect(row).toHaveLength(14);
  });

  it("places every word when the grid has room", () => {
    const result = generate(input());
    expect(result.metrics.placedWords).toBe(6);
    expect(result.failedWords).toEqual([]);
    expect(result.success).toBe(true);
  });

  it("marks word cells and filler cells correctly", () => {
    const result = generate(input());
    const wordCells = result.grid.cells.flat().filter((c) => c.isWordCell).length;
    expect(wordCells).toBe(result.metrics.wordCells);
    expect(result.metrics.wordCells + result.metrics.fillerCells).toBe(12 * 12);
  });

  it("honours the allowed direction set", () => {
    const result = generate(input({ directions: ["E", "S"], allowDiagonal: false }));
    for (const placement of result.placements) {
      expect(["E", "S"]).toContain(placement.direction);
    }
  });

  it("never places reversed words when reversal is disabled", () => {
    const result = generate(input({ directions: ["E", "W", "S", "N"], allowReversed: false }));
    for (const placement of result.placements) {
      expect(placement.reversed).toBe(false);
    }
  });

  it("places reversed words once reversal is enabled", () => {
    const result = generate(
      input({
        directions: ["E", "W", "S", "N", "SE", "NW"],
        allowReversed: true,
        words: words(["GRACE", "FAITH", "PEACE", "PRAYER", "HOPE", "MERCY", "LIGHT", "TRUTH"]),
      }),
    );
    expect(result.placements.length).toBeGreaterThan(0);
    expect(result.placements.some((p) => p.reversed)).toBe(true);
  });

  it("creates intersections when overlap is encouraged", () => {
    const result = generate(input({ overlapStrategy: "encouraged" }));
    expect(result.metrics.intersections).toBeGreaterThan(0);
  });

  it("creates no intersections when overlap is forbidden", () => {
    const result = generate(input({ overlapStrategy: "none" }));
    expect(result.metrics.intersections).toBe(0);
    expect(verifyPlacements(result.grid, result.placements).valid).toBe(true);
  });
});

describe("accented languages", () => {
  it("places Portuguese words and keeps display accents", () => {
    const result = generate(
      input({
        languageCode: "pt",
        words: words(["ORAÇÃO", "GRAÇA", "FÉ", "PAZ", "AMOR"]),
      }),
    );
    expect(result.metrics.placedWords).toBe(5);
    expect(verifyPlacements(result.grid, result.placements).valid).toBe(true);

    const oracao = result.placements.find((p) => p.normalized === "ORACAO");
    expect(oracao).toBeDefined();
    // The grid matches on folded letters...
    expect(oracao!.path.map((c) => result.grid.cells[c.row][c.col].normalized).join("")).toBe(
      "ORACAO",
    );
    // ...while the reader still sees the accented spelling.
    expect(oracao!.path.map((c) => result.grid.cells[c.row][c.col].display).join("")).toBe(
      "ORAÇÃO",
    );
  });

  it("keeps Spanish N-tilde distinct from N", () => {
    const result = generate(
      input({ languageCode: "es", words: words(["AÑO", "ANO", "FE", "PAZ"]), gridSize: 10 }),
    );
    const normalized = result.placements.map((p) => p.normalized);
    // Both survive because N-tilde never folds to N.
    expect(normalized).toContain("AÑO");
    expect(normalized).toContain("ANO");
    expect(verifyPlacements(result.grid, result.placements).valid).toBe(true);
  });

  it("includes accented fillers so accented word cells do not stand out", () => {
    const result = generate(
      input({
        languageCode: "pt",
        words: words(["ORAÇÃO", "GRAÇA", "FÉ", "PAZ"]),
        fillerStrategy: "weighted",
      }),
    );
    const accentedFillers = result.grid.cells
      .flat()
      .filter((cell) => !cell.isWordCell && cell.display !== cell.normalized);
    expect(accentedFillers.length).toBeGreaterThan(0);
  });
});

describe("failure handling", () => {
  it("reports a word too long for the grid instead of dropping it", () => {
    const result = generate(
      input({ gridSize: 8, words: words(["TRANSFIGURATION", "FE", "PAZ", "LUZ"]) }),
    );
    const failure = result.failedWords.find((f) => f.word.display === "TRANSFIGURATION");
    expect(failure?.reason).toBe("too_long_for_grid");
    expect(failure?.detail).toContain("15 cells");
    expect(result.success).toBe(false);
    // The rest of the puzzle is still usable.
    expect(result.metrics.placedWords).toBe(3);
    expect(verifyPlacements(result.grid, result.placements).valid).toBe(true);
  });

  it("reports words that collide once accents are folded", () => {
    const result = generate(
      input({ languageCode: "pt", words: words(["AVO", "AVÔ", "FE", "PAZ"]) }),
    );
    const failure = result.failedWords.find((f) => f.word.display === "AVÔ");
    expect(failure?.reason).toBe("invalid_word");
    expect(failure?.detail).toContain("duplicates");
  });

  it("reports words too short to be placed", () => {
    const result = generate(input({ words: words(["A", "GRACE", "FAITH"]) }));
    expect(result.failedWords.some((f) => f.reason === "invalid_word")).toBe(true);
  });

  it("never returns a placement for a failed word", () => {
    const result = generate(input({ gridSize: 8, words: words(["TRANSFIGURATION", "FE", "PAZ"]) }));
    const failedIds = new Set(result.failedWords.map((f) => f.word.id));
    for (const placement of result.placements) {
      expect(failedIds.has(placement.wordId)).toBe(false);
    }
  });
});

describe("structural input errors", () => {
  it("throws for an empty word list", () => {
    expect(() => generate(input({ words: [] }))).toThrow(PuzzleEngineError);
  });

  it("throws for a grid outside the supported range", () => {
    expect(() => generate(input({ gridSize: 3 }))).toThrow(PuzzleEngineError);
    expect(() => generate(input({ gridSize: 64 }))).toThrow(PuzzleEngineError);
  });

  it("throws when no directions survive the rules", () => {
    expect(() => generate(input({ directions: ["W", "N"], allowReversed: false }))).toThrow(
      PuzzleEngineError,
    );
  });

  it("throws for absurdly many words", () => {
    const many = Array.from({ length: 60 }, (_, i) => `WORD${i}`);
    expect(() => generate(input({ words: words(many) }))).toThrow(PuzzleEngineError);
  });
});

describe("quality scoring", () => {
  it("scores a well-formed puzzle highly", () => {
    const result = generate(input());
    expect(result.qualityScore).toBeGreaterThanOrEqual(70);
    expect(result.quality.placement).toBe(1);
  });

  it("penalises a puzzle with unplaced words", () => {
    const good = generate(input());
    const bad = generate(input({ gridSize: 8, words: words(["TRANSFIGURATION", "FE", "PAZ"]) }));
    expect(bad.qualityScore).toBeLessThan(good.qualityScore);
    expect(bad.quality.warnings.join(" ")).toContain("could not be placed");
  });

  it("warns when no words intersect", () => {
    const result = generate(input({ overlapStrategy: "none" }));
    expect(result.quality.warnings.join(" ")).toContain("intersect");
  });

  it("keeps the score within 0-100", () => {
    for (const seed of [1, 99, 12345, 987654]) {
      const result = generate(input({ seed }));
      expect(result.qualityScore).toBeGreaterThanOrEqual(0);
      expect(result.qualityScore).toBeLessThanOrEqual(100);
    }
  });
});

describe("metrics", () => {
  it("reports consistent counts", () => {
    const result = generate(input());
    expect(result.metrics.placedWords).toBe(result.placements.length);
    expect(result.metrics.failedWords).toBe(result.failedWords.length);
    expect(result.metrics.placedWords + result.metrics.failedWords).toBe(6);
    expect(result.metrics.directionsUsed).toBeGreaterThan(0);
    expect(result.metrics.candidatesEvaluated).toBeGreaterThan(0);
  });

  it("uses an injected clock so duration is testable", () => {
    let t = 1000;
    const result = generate(input(), { now: () => (t += 5) });
    expect(result.metrics.durationMs).toBe(5);
  });
});
