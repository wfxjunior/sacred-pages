import { describe, expect, it } from "vitest";
import {
  DIRECTIONS,
  DIRECTION_VECTORS,
  coordinateKey,
  directionOf,
  endCoordinate,
  fitsInGrid,
  fromRows,
  isDiagonal,
  isReversed,
  isWithinGrid,
  opposite,
  pathOf,
  placementCells,
  readNormalized,
  toCategories,
  toDirections,
  toRows,
  type Placement,
} from "./grid";

const GRID = fromRows(["ABC", "DEF", "GHI"], ["ABC", "DEF", "GHI"]);

describe("direction vectors", () => {
  it("every direction has an inverse within the set", () => {
    for (const direction of DIRECTIONS) {
      const inverse = opposite(direction);
      // Summing avoids the -0 trap: Object.is(0, -0) is false, so comparing a
      // negated zero component against a positive zero would fail spuriously.
      expect(DIRECTION_VECTORS[inverse].dr + DIRECTION_VECTORS[direction].dr).toBe(0);
      expect(DIRECTION_VECTORS[inverse].dc + DIRECTION_VECTORS[direction].dc).toBe(0);
      expect(inverse).not.toBe(direction);
    }
  });

  it("classifies diagonals", () => {
    expect(isDiagonal("SE")).toBe(true);
    expect(isDiagonal("NW")).toBe(true);
    expect(isDiagonal("E")).toBe(false);
    expect(isDiagonal("S")).toBe(false);
  });

  it("classifies reversed directions as those a reader traces backwards", () => {
    expect(isReversed("W")).toBe(true);
    expect(isReversed("N")).toBe(true);
    expect(isReversed("NW")).toBe(true);
    expect(isReversed("E")).toBe(false);
    expect(isReversed("S")).toBe(false);
    expect(isReversed("SE")).toBe(false);
  });
});

describe("direction categories", () => {
  it("maps the six-category editor model onto compass vectors", () => {
    expect(toDirections(["horizontal"])).toEqual(["E"]);
    expect(toDirections(["vertical"])).toEqual(["S"]);
    expect(toDirections(["diagonal"]).sort()).toEqual(["NE", "SE"]);
    expect(toDirections(["reverse_horizontal"])).toEqual(["W"]);
  });

  it("round-trips without inventing directions", () => {
    const categories = toCategories(["E", "S", "SE"]);
    expect(categories).toContain("horizontal");
    expect(categories).toContain("vertical");
    expect(categories).toContain("diagonal");
    expect(categories).not.toContain("reverse_horizontal");
  });

  it("deduplicates overlapping categories", () => {
    expect(toDirections(["diagonal", "diagonal"]).sort()).toEqual(["NE", "SE"]);
  });
});

describe("directionOf", () => {
  it("recognizes straight lines", () => {
    expect(directionOf({ start: { row: 0, col: 0 }, end: { row: 0, col: 2 } })).toBe("E");
    expect(directionOf({ start: { row: 0, col: 0 }, end: { row: 2, col: 0 } })).toBe("S");
    expect(directionOf({ start: { row: 0, col: 0 }, end: { row: 2, col: 2 } })).toBe("SE");
    expect(directionOf({ start: { row: 2, col: 2 }, end: { row: 0, col: 0 } })).toBe("NW");
  });

  it("rejects non-straight and zero-length selections", () => {
    expect(directionOf({ start: { row: 0, col: 0 }, end: { row: 1, col: 2 } })).toBeNull();
    expect(directionOf({ start: { row: 1, col: 1 }, end: { row: 1, col: 1 } })).toBeNull();
  });
});

describe("pathOf", () => {
  it("includes both endpoints", () => {
    const path = pathOf({ start: { row: 0, col: 0 }, end: { row: 0, col: 2 } });
    expect(path).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ]);
  });

  it("walks diagonals correctly in both directions", () => {
    expect(pathOf({ start: { row: 2, col: 2 }, end: { row: 0, col: 0 } })).toEqual([
      { row: 2, col: 2 },
      { row: 1, col: 1 },
      { row: 0, col: 0 },
    ]);
  });

  it("returns nothing for a bent selection", () => {
    expect(pathOf({ start: { row: 0, col: 0 }, end: { row: 1, col: 2 } })).toEqual([]);
  });
});

describe("bounds", () => {
  it("detects coordinates inside and outside", () => {
    expect(isWithinGrid({ row: 0, col: 0 }, 3)).toBe(true);
    expect(isWithinGrid({ row: 2, col: 2 }, 3)).toBe(true);
    expect(isWithinGrid({ row: 3, col: 0 }, 3)).toBe(false);
    expect(isWithinGrid({ row: -1, col: 0 }, 3)).toBe(false);
  });

  it("computes where a word ends", () => {
    expect(endCoordinate({ row: 0, col: 0 }, "E", 3)).toEqual({ row: 0, col: 2 });
    expect(endCoordinate({ row: 2, col: 2 }, "NW", 3)).toEqual({ row: 0, col: 0 });
  });

  it("knows when a word fits", () => {
    expect(fitsInGrid({ row: 0, col: 0 }, "E", 3, 3)).toBe(true);
    expect(fitsInGrid({ row: 0, col: 1 }, "E", 3, 3)).toBe(false);
    expect(fitsInGrid({ row: 0, col: 0 }, "N", 2, 3)).toBe(false);
  });
});

describe("grid reading and serialization", () => {
  it("reads letters along a selection", () => {
    expect(readNormalized(GRID, { start: { row: 0, col: 0 }, end: { row: 0, col: 2 } })).toBe(
      "ABC",
    );
    expect(readNormalized(GRID, { start: { row: 0, col: 0 }, end: { row: 2, col: 2 } })).toBe(
      "AEI",
    );
    expect(readNormalized(GRID, { start: { row: 2, col: 0 }, end: { row: 0, col: 2 } })).toBe(
      "GEC",
    );
  });

  it("round-trips through row strings", () => {
    expect(toRows(GRID, "display")).toEqual(["ABC", "DEF", "GHI"]);
    const rebuilt = fromRows(toRows(GRID, "display"), toRows(GRID, "normalized"));
    expect(rebuilt.size).toBe(3);
    expect(rebuilt.cells[1][1].display).toBe("E");
  });

  it("keeps display and normalized forms separate", () => {
    const grid = fromRows(["ÇÃO", "XYZ", "PQR"], ["CAO", "XYZ", "PQR"]);
    expect(grid.cells[0][0].display).toBe("Ç");
    expect(grid.cells[0][0].normalized).toBe("C");
    expect(grid.cells[0][1].display).toBe("Ã");
    expect(grid.cells[0][1].normalized).toBe("A");
    // Matching reads the folded letters while the reader still sees accents.
    expect(readNormalized(grid, { start: { row: 0, col: 0 }, end: { row: 0, col: 2 } })).toBe(
      "CAO",
    );
  });
});

describe("placementCells", () => {
  it("collects every covered coordinate", () => {
    const placements: Placement[] = [
      {
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
      },
    ];
    const cells = placementCells(placements);
    expect(cells.has(coordinateKey({ row: 0, col: 1 }))).toBe(true);
    expect(cells.has(coordinateKey({ row: 1, col: 1 }))).toBe(false);
    expect(cells.size).toBe(3);
  });
});
