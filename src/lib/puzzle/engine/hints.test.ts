import { describe, expect, it } from "vitest";
import { normalizeWord } from "@/lib/content/normalize";
import type { GenerationInput } from "../engine";
import type { Placement, PuzzleWord } from "../grid";
import { generate } from "./index";
import { generateHint, hintsRemaining, nextHintKind, type HintPolicy } from "./hints";
import { replaySelections, verifyClaimedSolution, verifyStoredPuzzle } from "./solution";
import { serializePuzzle, deserializePuzzle } from "./index";

function words(list: readonly string[]): PuzzleWord[] {
  return list.map((display, i) => ({ id: `w${i}`, display, normalized: normalizeWord(display) }));
}

const INPUT: GenerationInput = {
  words: words(["GRACE", "FAITH", "PEACE", "PRAYER", "HOPE"]),
  languageCode: "en",
  difficulty: "balanced",
  gridSize: 12,
  directions: ["E", "S", "SE", "NE"],
  allowReversed: false,
  allowDiagonal: true,
  overlapStrategy: "encouraged",
  fillerStrategy: "weighted",
  maxAttempts: 200,
  seed: 4242,
};

const RESULT = generate(INPUT);
const PLACEMENTS: readonly Placement[] = RESULT.placements;

const unlimited: HintPolicy = {
  policy: "unlimited",
  maxHints: 0,
  hintsUsed: 0,
  fullSolutionEnabled: true,
};

describe("generateHint", () => {
  it("reveals the first letter at the word's true start", () => {
    const result = generateHint({
      kind: "first_letter",
      placements: PLACEMENTS,
      foundWords: [],
      policy: unlimited,
    });
    expect(result.ok).toBe(true);
    if (!result.ok || result.hint.kind !== "first_letter") throw new Error("unexpected");
    const hint = result.hint;

    const target = PLACEMENTS.find((p) => p.normalized === hint.word)!;
    expect(hint.coordinate).toEqual(target.start);
    const cell = RESULT.grid.cells[target.start.row][target.start.col];
    expect(cell.normalized).toBe(target.normalized[0]);
  });

  it("reveals a direction vector consistent with the placement", () => {
    const result = generateHint({
      kind: "direction",
      placements: PLACEMENTS,
      foundWords: [],
      policy: unlimited,
    });
    if (!result.ok || result.hint.kind !== "direction") throw new Error("unexpected");
    const hint = result.hint;

    const target = PLACEMENTS.find((p) => p.normalized === hint.word)!;
    expect(hint.direction).toBe(target.direction);
    const second = target.path[1];
    expect(second.row - target.start.row).toBe(hint.vector.dr);
    expect(second.col - target.start.col).toBe(hint.vector.dc);
  });

  it("reveals a full word path that reads correctly in the grid", () => {
    const result = generateHint({
      kind: "reveal_word",
      placements: PLACEMENTS,
      foundWords: [],
      policy: unlimited,
    });
    if (!result.ok || result.hint.kind !== "reveal_word") throw new Error("unexpected");

    const letters = result.hint.path
      .map((c) => RESULT.grid.cells[c.row][c.col].normalized)
      .join("");
    expect(letters).toBe(result.hint.word);
  });

  it("is stable: asking twice points at the same word", () => {
    const a = generateHint({
      kind: "first_letter",
      placements: PLACEMENTS,
      foundWords: [],
      policy: unlimited,
    });
    const b = generateHint({
      kind: "first_letter",
      placements: PLACEMENTS,
      foundWords: [],
      policy: unlimited,
    });
    expect(a).toEqual(b);
  });

  it("skips words already found", () => {
    const found = [PLACEMENTS[0].normalized];
    const result = generateHint({
      kind: "first_letter",
      placements: PLACEMENTS,
      foundWords: found,
      policy: unlimited,
    });
    if (!result.ok || result.hint.kind !== "first_letter") throw new Error("unexpected");
    expect(result.hint.word).not.toBe(PLACEMENTS[0].normalized);
  });

  it("refuses when every word has been found", () => {
    const result = generateHint({
      kind: "first_letter",
      placements: PLACEMENTS,
      foundWords: PLACEMENTS.map((p) => p.normalized),
      policy: unlimited,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("no_unfound_words");
  });

  it("refuses when hints are disabled", () => {
    const result = generateHint({
      kind: "first_letter",
      placements: PLACEMENTS,
      foundWords: [],
      policy: { policy: "none", maxHints: 0, hintsUsed: 0, fullSolutionEnabled: true },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("hints_disabled");
  });

  it("enforces a limited hint budget", () => {
    const policy: HintPolicy = {
      policy: "limited",
      maxHints: 3,
      hintsUsed: 3,
      fullSolutionEnabled: true,
    };
    const result = generateHint({
      kind: "first_letter",
      placements: PLACEMENTS,
      foundWords: [],
      policy,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("hint_limit_reached");
  });

  it("returns only unfound words in the full solution", () => {
    const found = [PLACEMENTS[0].normalized, PLACEMENTS[1].normalized];
    const result = generateHint({
      kind: "full_solution",
      placements: PLACEMENTS,
      foundWords: found,
      policy: unlimited,
    });
    if (!result.ok || result.hint.kind !== "full_solution") throw new Error("unexpected");
    expect(result.hint.words).toHaveLength(PLACEMENTS.length - 2);
    expect(result.hint.words.map((w) => w.word)).not.toContain(PLACEMENTS[0].normalized);
  });

  it("refuses the full solution when the journey disables it", () => {
    const result = generateHint({
      kind: "full_solution",
      placements: PLACEMENTS,
      foundWords: [],
      policy: { ...unlimited, fullSolutionEnabled: false },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("solution_disabled");
  });

  it("allows the full solution even when the hint budget is spent", () => {
    // Revealing the answer is a separate affordance from incremental hints.
    const result = generateHint({
      kind: "full_solution",
      placements: PLACEMENTS,
      foundWords: [],
      policy: { policy: "limited", maxHints: 1, hintsUsed: 5, fullSolutionEnabled: true },
    });
    expect(result.ok).toBe(true);
  });
});

describe("hint budget helpers", () => {
  it("reports remaining hints", () => {
    expect(hintsRemaining({ ...unlimited, policy: "none" })).toBe(0);
    expect(hintsRemaining(unlimited)).toBeNull();
    expect(
      hintsRemaining({ policy: "limited", maxHints: 3, hintsUsed: 1, fullSolutionEnabled: true }),
    ).toBe(2);
    expect(
      hintsRemaining({ policy: "limited", maxHints: 3, hintsUsed: 9, fullSolutionEnabled: true }),
    ).toBe(0);
  });

  it("escalates through the hint ladder", () => {
    expect(nextHintKind([])).toBe("first_letter");
    expect(nextHintKind(["first_letter"])).toBe("direction");
    expect(nextHintKind(["first_letter", "direction"])).toBe("reveal_word");
  });
});

describe("verifyClaimedSolution", () => {
  const all = PLACEMENTS.map((p) => p.normalized);

  it("accepts a genuine completion", () => {
    const result = verifyClaimedSolution({ placements: PLACEMENTS, claimedWords: all });
    expect(result.valid).toBe(true);
    expect(result.complete).toBe(true);
    expect(result.completionPercent).toBe(100);
  });

  it("rejects words that are not in the puzzle", () => {
    const result = verifyClaimedSolution({
      placements: PLACEMENTS,
      claimedWords: [...all, "FABRICATED"],
    });
    expect(result.valid).toBe(false);
    expect(result.unknownWords).toEqual(["FABRICATED"]);
  });

  it("does not let a repeated word inflate completion", () => {
    const first = PLACEMENTS[0].normalized;
    const result = verifyClaimedSolution({
      placements: PLACEMENTS,
      claimedWords: [first, first, first],
    });
    expect(result.verifiedWords).toEqual([first]);
    expect(result.complete).toBe(false);
    expect(result.completionPercent).toBe(Math.round((1 / PLACEMENTS.length) * 100));
  });

  it("lists words still missing", () => {
    const result = verifyClaimedSolution({
      placements: PLACEMENTS,
      claimedWords: [PLACEMENTS[0].normalized],
    });
    expect(result.missingWords).toHaveLength(PLACEMENTS.length - 1);
  });
});

describe("replaySelections", () => {
  it("re-derives found words from coordinates alone", () => {
    const selections = PLACEMENTS.slice(0, 3).map((p) => ({ start: p.start, end: p.end }));
    const { foundWords, results } = replaySelections({
      grid: RESULT.grid,
      placements: PLACEMENTS,
      selections,
    });
    expect(foundWords).toHaveLength(3);
    expect(results.every((r) => r.kind === "match")).toBe(true);
  });

  it("rejects a fabricated selection", () => {
    const { foundWords } = replaySelections({
      grid: RESULT.grid,
      placements: PLACEMENTS,
      selections: [{ start: { row: 0, col: 0 }, end: { row: 0, col: 11 } }],
    });
    expect(foundWords).toHaveLength(0);
  });

  it("counts a repeated selection only once", () => {
    const selection = { start: PLACEMENTS[0].start, end: PLACEMENTS[0].end };
    const { foundWords, results } = replaySelections({
      grid: RESULT.grid,
      placements: PLACEMENTS,
      selections: [selection, selection],
    });
    expect(foundWords).toHaveLength(1);
    expect(results[1].kind).toBe("already_found");
  });
});

describe("serialization", () => {
  it("round-trips a puzzle without regenerating it", () => {
    const serialized = serializePuzzle(RESULT);
    const restored = deserializePuzzle(serialized);

    expect(restored.grid.size).toBe(RESULT.grid.size);
    for (let row = 0; row < RESULT.grid.size; row++) {
      for (let col = 0; col < RESULT.grid.size; col++) {
        expect(restored.grid.cells[row][col].display).toBe(RESULT.grid.cells[row][col].display);
        expect(restored.grid.cells[row][col].normalized).toBe(
          RESULT.grid.cells[row][col].normalized,
        );
        expect(restored.grid.cells[row][col].isWordCell).toBe(
          RESULT.grid.cells[row][col].isWordCell,
        );
      }
    }
  });

  it("verifies a stored puzzle is internally consistent", () => {
    const serialized = serializePuzzle(RESULT);
    const check = verifyStoredPuzzle({
      displayRows: serialized.gridRows,
      normalizedRows: serialized.normalizedGridRows,
      placements: serialized.placements,
    });
    expect(check.valid).toBe(true);
  });

  it("detects a corrupted stored puzzle", () => {
    const serialized = serializePuzzle(RESULT);
    const corrupted = [...serialized.normalizedGridRows];
    // Flip a letter that a word depends on.
    const target = PLACEMENTS[0].start;
    const row = [...corrupted[target.row]];
    row[target.col] = row[target.col] === "Z" ? "Q" : "Z";
    corrupted[target.row] = row.join("");

    const check = verifyStoredPuzzle({
      displayRows: serialized.gridRows,
      normalizedRows: corrupted,
      placements: serialized.placements,
    });
    expect(check.valid).toBe(false);
  });
});
