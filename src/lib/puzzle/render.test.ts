import { describe, expect, it } from "vitest";
import { toRows } from "./grid";
import { buildRenderablePuzzle, toPuzzleWords } from "./render";
import { validateSelection } from "./validation-service";

const WORDS = ["PEACE", "GRACE", "HOPE", "FAITH", "MERCY"];

function rowsOf(words: readonly string[], size = 12) {
  return toRows(buildRenderablePuzzle({ words, size }).grid, "display").join("|");
}

describe("toPuzzleWords", () => {
  it("uppercases the display form while keeping accents, and folds the match form", () => {
    const [word] = toPuzzleWords(["oração"]);
    expect(word.display).toBe("ORAÇÃO");
    expect(word.normalized).toBe("ORACAO");
  });

  it("gives every word a stable id in caller order", () => {
    expect(toPuzzleWords(["a", "b"]).map((w) => w.id)).toEqual(["w0", "w1"]);
  });
});

describe("determinism", () => {
  it("produces an identical grid for the same words and size", () => {
    expect(rowsOf(WORDS)).toBe(rowsOf(WORDS));
  });

  it("is stable across many rebuilds — no hidden clock or Math.random", () => {
    const first = rowsOf(WORDS);
    for (let i = 0; i < 5; i++) expect(rowsOf(WORDS)).toBe(first);
  });

  it("produces a different grid for a different word list", () => {
    expect(rowsOf(WORDS)).not.toBe(rowsOf([...WORDS, "LIGHT"]));
  });

  it("produces a different grid at a different size", () => {
    expect(rowsOf(WORDS, 12)).not.toBe(rowsOf(WORDS, 14));
  });

  it("is unaffected by the caller's casing or accents, which are cosmetic", () => {
    // Same normalized words → same seed → same grid. A reader mid-journey must
    // not have their grid reshuffled because copy was re-capitalised.
    expect(rowsOf(["peace", "grace"])).toBe(rowsOf(["PEACE", "GRACE"]));
  });

  it("honours an explicit seed so a stored puzzle can be replayed", () => {
    const a = buildRenderablePuzzle({ words: WORDS, size: 12, seed: 1234 });
    const b = buildRenderablePuzzle({ words: WORDS, size: 12, seed: 1234 });
    expect(toRows(a.grid, "display")).toEqual(toRows(b.grid, "display"));
    expect(a.seed).toBe(1234);
  });
});

describe("grid shape", () => {
  it("fills a square grid of the requested size", () => {
    const { grid } = buildRenderablePuzzle({ words: WORDS, size: 12 });
    expect(grid.size).toBe(12);
    expect(grid.cells).toHaveLength(12);
    for (const row of grid.cells) expect(row).toHaveLength(12);
  });

  it("leaves no empty cell", () => {
    const { grid } = buildRenderablePuzzle({ words: WORDS, size: 12 });
    for (const row of grid.cells) {
      for (const cell of row) expect(cell.display.trim()).not.toBe("");
    }
  });

  it("places every word when the grid has room", () => {
    const puzzle = buildRenderablePuzzle({ words: WORDS, size: 12 });
    expect(puzzle.unplaced).toEqual([]);
    expect(puzzle.placements).toHaveLength(WORDS.length);
  });

  it("reports words it could not place instead of dropping them silently", () => {
    // A 6x6 grid cannot hold words longer than six letters.
    const puzzle = buildRenderablePuzzle({
      words: ["EXTRAORDINARY", "MAGNIFICENCE", "RIGHTEOUSNESS"],
      size: 6,
    });
    expect(puzzle.unplaced.length).toBeGreaterThan(0);
    expect(puzzle.placements.length + puzzle.unplaced.length).toBe(3);
  });

  it("clamps an out-of-range size rather than throwing at the UI boundary", () => {
    expect(buildRenderablePuzzle({ words: WORDS, size: 2 }).grid.size).toBe(6);
    expect(buildRenderablePuzzle({ words: WORDS, size: 999 }).grid.size).toBe(32);
  });
});

describe("placements agree with the grid", () => {
  it("spells each word along its own path", () => {
    const { grid, placements } = buildRenderablePuzzle({ words: WORDS, size: 12 });
    for (const placement of placements) {
      const spelled = placement.path.map((c) => grid.cells[c.row][c.col].normalized).join("");
      expect(spelled).toBe(placement.normalized);
    }
  });

  it("is findable by the validator the component uses", () => {
    const puzzle = buildRenderablePuzzle({ words: WORDS, size: 12 });
    const targetWords = puzzle.words.map((w) => w.normalized);

    for (const placement of puzzle.placements) {
      const result = validateSelection({
        grid: puzzle.grid,
        selection: { start: placement.start, end: placement.end },
        targetWords,
        foundWords: [],
        placements: puzzle.placements,
      });
      expect(result.kind).toBe("match");
      if (result.kind === "match") expect(result.word).toBe(placement.normalized);
    }
  });

  it("accepts a word traced backwards, as readers expect", () => {
    const puzzle = buildRenderablePuzzle({ words: WORDS, size: 12 });
    const targetWords = puzzle.words.map((w) => w.normalized);
    const placement = puzzle.placements[0];

    const result = validateSelection({
      grid: puzzle.grid,
      // start and end swapped
      selection: { start: placement.end, end: placement.start },
      targetWords,
      foundWords: [],
      placements: puzzle.placements,
    });
    expect(result.kind).toBe("match");
  });
});

describe("accented word lists", () => {
  const PT = ["ORAÇÃO", "FÉ", "ESPERANÇA", "GRAÇA"];

  it("matches an accented word through its folded form in the grid", () => {
    const puzzle = buildRenderablePuzzle({ words: PT, size: 12 });
    const targetWords = puzzle.words.map((w) => w.normalized);

    const placement = puzzle.placements.find((p) => p.normalized === "ORACAO");
    expect(placement).toBeDefined();

    const result = validateSelection({
      grid: puzzle.grid,
      selection: { start: placement!.start, end: placement!.end },
      targetWords,
      foundWords: [],
      placements: puzzle.placements,
    });
    expect(result.kind).toBe("match");
    if (result.kind === "match") expect(result.word).toBe("ORACAO");
  });

  it("keeps the accented spelling available for display", () => {
    const puzzle = buildRenderablePuzzle({ words: PT, size: 12 });
    const display = new Map(puzzle.words.map((w) => [w.normalized, w.display]));
    expect(display.get("ORACAO")).toBe("ORAÇÃO");
    expect(display.get("FE")).toBe("FÉ");
  });
});

describe("the configuration /today actually renders", () => {
  // today.tsx passes TODAY.words at one of four sizes. Every one must yield a
  // fully solvable puzzle, or a reader hits a word they can never find.
  const TODAY_WORDS = ["GRACE", "FAITH", "PEACE", "PRAYER", "HOPE", "GRATITUDE"];
  const SIZES = [10, 12, 14, 16];

  it.each(SIZES)("places all six words at size %i", (size) => {
    const puzzle = buildRenderablePuzzle({ words: TODAY_WORDS, size });
    expect(puzzle.unplaced).toEqual([]);
    expect(puzzle.placements).toHaveLength(TODAY_WORDS.length);
  });

  it.each(SIZES)("every word is findable by the validator at size %i", (size) => {
    const puzzle = buildRenderablePuzzle({ words: TODAY_WORDS, size });
    const targetWords = puzzle.words.map((w) => w.normalized);

    for (const word of targetWords) {
      const placement = puzzle.placements.find((p) => p.normalized === word);
      expect(placement, `${word} has no placement`).toBeDefined();
      const result = validateSelection({
        grid: puzzle.grid,
        selection: { start: placement!.start, end: placement!.end },
        targetWords,
        foundWords: [],
        placements: puzzle.placements,
      });
      expect(result.kind).toBe("match");
    }
  });
});

describe("edge cases", () => {
  it("handles an empty word list without throwing", () => {
    // The engine refuses this; the render adapter must not, or a missing word
    // list would blank the page instead of showing an unsolvable grid.
    const puzzle = buildRenderablePuzzle({ words: [], size: 8 });
    expect(puzzle.placements).toEqual([]);
    expect(puzzle.grid.size).toBe(8);
    expect(puzzle.grid.cells).toHaveLength(8);
    for (const row of puzzle.grid.cells) {
      expect(row).toHaveLength(8);
      for (const cell of row) expect(cell.display).toMatch(/\S/);
    }
  });

  it("uppercases the grid so a lowercase word list still reads as a puzzle", () => {
    const { grid } = buildRenderablePuzzle({ words: ["peace", "grace"], size: 12 });
    const letters = grid.cells.flatMap((row) => row.map((cell) => cell.display));
    expect(letters.every((l) => l === l.toLocaleUpperCase())).toBe(true);
  });

  it("caps an absurdly long word list instead of throwing", () => {
    const many = Array.from({ length: 60 }, (_, i) => `WORD${i}`);
    expect(() => buildRenderablePuzzle({ words: many, size: 20 })).not.toThrow();
  });

  it("falls back to the difficulty preset size when none is given", () => {
    expect(buildRenderablePuzzle({ words: WORDS, difficulty: "gentle" }).grid.size).toBe(10);
    expect(buildRenderablePuzzle({ words: WORDS, difficulty: "expert" }).grid.size).toBe(16);
  });
});
