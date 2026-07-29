import { describe, expect, it } from "vitest";
import { fromRows, type Placement } from "./grid";
import {
  completionPercent,
  isComplete,
  validateSelection,
  verifyPlacements,
} from "./validation-service";

// GRACE runs along row 0 (cols 0-4); FAITH runs down column 0 (rows 1-5).
const ROWS = ["GRACEX", "FXXXXX", "AXXXXX", "IXXXXX", "TXXXXX", "HXXXXX"];
const GRID = fromRows(ROWS, ROWS);

const TARGETS = ["GRACE", "FAITH"];

describe("validateSelection", () => {
  it("matches a word traced forwards", () => {
    const result = validateSelection({
      grid: GRID,
      selection: { start: { row: 0, col: 0 }, end: { row: 0, col: 4 } },
      targetWords: TARGETS,
      foundWords: [],
    });
    expect(result).toEqual({ kind: "match", word: "GRACE", placement: undefined });
  });

  it("matches the same word traced backwards", () => {
    const result = validateSelection({
      grid: GRID,
      selection: { start: { row: 0, col: 4 }, end: { row: 0, col: 0 } },
      targetWords: TARGETS,
      foundWords: [],
    });
    expect(result.kind).toBe("match");
    if (result.kind === "match") expect(result.word).toBe("GRACE");
  });

  it("reports a word that was already found", () => {
    const result = validateSelection({
      grid: GRID,
      selection: { start: { row: 0, col: 0 }, end: { row: 0, col: 4 } },
      targetWords: TARGETS,
      foundWords: ["GRACE"],
    });
    expect(result).toEqual({ kind: "already_found", word: "GRACE" });
  });

  it("rejects a bent selection before reading any letters", () => {
    const result = validateSelection({
      grid: GRID,
      selection: { start: { row: 0, col: 0 }, end: { row: 1, col: 3 } },
      targetWords: TARGETS,
      foundWords: [],
    });
    expect(result).toEqual({ kind: "invalid_line" });
  });

  it("rejects a selection outside the grid", () => {
    const result = validateSelection({
      grid: GRID,
      selection: { start: { row: 0, col: 0 }, end: { row: 0, col: 12 } },
      targetWords: TARGETS,
      foundWords: [],
    });
    expect(result).toEqual({ kind: "out_of_bounds" });
  });

  it("returns no_match for letters that spell nothing", () => {
    const result = validateSelection({
      grid: GRID,
      selection: { start: { row: 1, col: 1 }, end: { row: 1, col: 3 } },
      targetWords: TARGETS,
      foundWords: [],
    });
    expect(result).toEqual({ kind: "no_match" });
  });

  it("rejects a single cell as too short to be a word", () => {
    const result = validateSelection({
      grid: GRID,
      selection: { start: { row: 0, col: 0 }, end: { row: 0, col: 0 } },
      targetWords: TARGETS,
      foundWords: [],
    });
    expect(result).toEqual({ kind: "invalid_line" });
  });

  it("supplies the matched placement when placements are provided", () => {
    const placement: Placement = {
      wordId: "w1",
      normalized: "GRACE",
      start: { row: 0, col: 0 },
      end: { row: 0, col: 4 },
      direction: "E",
      reversed: false,
      path: [0, 1, 2, 3, 4].map((col) => ({ row: 0, col })),
    };
    const result = validateSelection({
      grid: GRID,
      selection: { start: { row: 0, col: 0 }, end: { row: 0, col: 4 } },
      targetWords: TARGETS,
      foundWords: [],
      placements: [placement],
    });
    expect(result.kind).toBe("match");
    if (result.kind === "match") expect(result.placement?.wordId).toBe("w1");
  });

  it("matches a vertical word", () => {
    const result = validateSelection({
      grid: GRID,
      selection: { start: { row: 1, col: 0 }, end: { row: 5, col: 0 } },
      targetWords: TARGETS,
      foundWords: [],
    });
    expect(result.kind).toBe("match");
    if (result.kind === "match") expect(result.word).toBe("FAITH");
  });
});

describe("completionPercent", () => {
  it("computes whole percentages", () => {
    expect(completionPercent([], TARGETS)).toBe(0);
    expect(completionPercent(["GRACE"], TARGETS)).toBe(50);
    expect(completionPercent(["GRACE", "FAITH"], TARGETS)).toBe(100);
  });

  it("ignores found words that are not targets and does not exceed 100", () => {
    expect(completionPercent(["GRACE", "UNRELATED"], TARGETS)).toBe(50);
    expect(completionPercent(["GRACE", "GRACE", "FAITH"], TARGETS)).toBe(100);
  });

  it("treats an empty word list as complete", () => {
    expect(completionPercent([], [])).toBe(100);
  });
});

describe("isComplete", () => {
  it("requires every target", () => {
    expect(isComplete(["GRACE"], TARGETS)).toBe(false);
    expect(isComplete(["GRACE", "FAITH"], TARGETS)).toBe(true);
    expect(isComplete([], [])).toBe(true);
  });
});

describe("verifyPlacements", () => {
  const good: Placement = {
    wordId: "w1",
    normalized: "GRACE",
    start: { row: 0, col: 0 },
    end: { row: 0, col: 4 },
    direction: "E",
    reversed: false,
    path: [0, 1, 2, 3, 4].map((col) => ({ row: 0, col })),
  };

  it("accepts a placement that matches the grid", () => {
    expect(verifyPlacements(GRID, [good])).toEqual({ valid: true, problems: [] });
  });

  it("catches a placement whose length disagrees with its path", () => {
    const bad: Placement = { ...good, end: { row: 0, col: 3 } };
    const result = verifyPlacements(GRID, [bad]);
    expect(result.valid).toBe(false);
    expect(result.problems[0]).toContain("path covers 4 cells");
  });

  it("catches a placement that leaves the grid", () => {
    const bad: Placement = { ...good, start: { row: 0, col: 3 }, end: { row: 0, col: 7 } };
    const result = verifyPlacements(GRID, [bad]);
    expect(result.valid).toBe(false);
    expect(result.problems[0]).toContain("leaves the grid");
  });

  it("catches a placement pointing at the wrong letters", () => {
    const bad: Placement = {
      ...good,
      start: { row: 1, col: 0 },
      end: { row: 1, col: 4 },
      path: [0, 1, 2, 3, 4].map((col) => ({ row: 1, col })),
    };
    const result = verifyPlacements(GRID, [bad]);
    expect(result.valid).toBe(false);
    expect(result.problems[0]).toContain('grid reads "FXXXX"');
  });
});
