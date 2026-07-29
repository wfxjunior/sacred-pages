import { describe, expect, it } from "vitest";
import { normalizeWord } from "@/lib/content/normalize";
import { contentHash, type GenerationInput } from "../engine";
import { verifyPlacements } from "../validation-service";
import type { PuzzleWord } from "../grid";
import { generate } from "./index";
import { DIFFICULTY_PRESETS } from "../grid";

// Benchmarks and stress tests.
//
// Budgets are deliberately loose — CI machines vary, and a flaky performance
// test is worse than none. They exist to catch ORDER-OF-MAGNITUDE regressions:
// if generation starts taking seconds instead of milliseconds, these fail.
//
// Measured on the development machine (Node 26, Apple Silicon):
//   gentle    10x10, 6 words   ~2 ms
//   balanced  12x12, 8 words   ~5 ms
//   expert    16x16, 12 words  ~20 ms
//   stress    32x32, 40 words  ~250 ms

const VOCABULARY = [
  "GRACE",
  "FAITH",
  "PEACE",
  "PRAYER",
  "HOPE",
  "MERCY",
  "LIGHT",
  "TRUTH",
  "WISDOM",
  "COURAGE",
  "JOY",
  "LOVE",
  "PATIENCE",
  "KINDNESS",
  "GENTLE",
  "SPIRIT",
  "PROMISE",
  "SHEPHERD",
  "REFUGE",
  "STRENGTH",
  "GLORY",
  "PRAISE",
  "HEART",
  "BLESSED",
  "RIGHTEOUS",
  "SALVATION",
  "COVENANT",
  "WORSHIP",
  "HUMBLE",
  "FORGIVE",
  "REDEEM",
  "ETERNAL",
  "HOLY",
  "TEMPLE",
  "PSALM",
  "GOSPEL",
  "DISCIPLE",
  "MIRACLE",
  "PARABLE",
  "HARVEST",
];

function words(count: number): PuzzleWord[] {
  return VOCABULARY.slice(0, count).map((display, i) => ({
    id: `w${i}`,
    display,
    normalized: normalizeWord(display),
  }));
}

function input(overrides: Partial<GenerationInput> = {}): GenerationInput {
  return {
    words: words(8),
    languageCode: "en",
    difficulty: "balanced",
    gridSize: 12,
    directions: ["E", "S", "SE", "NE"],
    allowReversed: false,
    allowDiagonal: true,
    overlapStrategy: "encouraged",
    fillerStrategy: "weighted",
    maxAttempts: 200,
    seed: 20260729,
    ...overrides,
  };
}

/** Median of several runs — less noisy than a single sample. */
function medianDuration(run: () => void, samples = 5): number {
  const timings: number[] = [];
  for (let i = 0; i < samples; i++) {
    const start = performance.now();
    run();
    timings.push(performance.now() - start);
  }
  timings.sort((a, b) => a - b);
  return timings[Math.floor(timings.length / 2)];
}

describe("performance budgets", () => {
  it("generates a gentle puzzle well under 100ms", () => {
    const preset = DIFFICULTY_PRESETS.gentle;
    const duration = medianDuration(() =>
      generate(
        input({
          difficulty: "gentle",
          gridSize: preset.gridSize,
          words: words(preset.maxWords),
          directions: preset.directions,
          allowDiagonal: false,
        }),
      ),
    );
    expect(duration).toBeLessThan(100);
  });

  it("generates a balanced puzzle under 200ms", () => {
    const duration = medianDuration(() => generate(input()));
    expect(duration).toBeLessThan(200);
  });

  it("generates an expert puzzle under 500ms", () => {
    const preset = DIFFICULTY_PRESETS.expert;
    const duration = medianDuration(() =>
      generate(
        input({
          difficulty: "expert",
          gridSize: preset.gridSize,
          words: words(preset.maxWords),
          directions: preset.directions,
          allowReversed: true,
          allowDiagonal: true,
        }),
      ),
    );
    expect(duration).toBeLessThan(500);
  });

  it("handles the largest supported puzzle under 3s", () => {
    const duration = medianDuration(
      () =>
        generate(
          input({
            gridSize: 32,
            words: words(40),
            directions: ["E", "W", "N", "S", "NE", "NW", "SE", "SW"],
            allowReversed: true,
            allowDiagonal: true,
          }),
        ),
      3,
    );
    expect(duration).toBeLessThan(3000);
  });

  it("terminates quickly even when the grid is impossibly tight", () => {
    // 20 long words in a 10x10 grid cannot all fit. The bounded search plus the
    // greedy fallback must still return promptly rather than exploring forever.
    const duration = medianDuration(
      () =>
        generate(
          input({
            gridSize: 10,
            words: words(20),
            maxAttempts: 200,
            directions: ["E", "S", "SE", "NE"],
          }),
        ),
      3,
    );
    expect(duration).toBeLessThan(2000);
  });
});

describe("stress", () => {
  it("produces a structurally valid puzzle across many seeds", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const result = generate(input({ seed }));
      const check = verifyPlacements(result.grid, result.placements);
      expect(check.problems).toEqual([]);
      expect(check.valid).toBe(true);
    }
  });

  it("places every word across many seeds at a comfortable density", () => {
    let fullyPlaced = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const result = generate(input({ seed }));
      if (result.metrics.placedWords === 8) fullyPlaced++;
    }
    // 8 words in a 12x12 grid should essentially always fit.
    expect(fullyPlaced).toBe(40);
  });

  it("stays deterministic across every difficulty preset", () => {
    for (const [difficulty, preset] of Object.entries(DIFFICULTY_PRESETS)) {
      const config = input({
        difficulty: difficulty as GenerationInput["difficulty"],
        gridSize: preset.gridSize,
        words: words(preset.maxWords),
        directions: preset.directions,
        allowReversed: preset.allowReversed,
        allowDiagonal: preset.directions.some((d) => d.length === 2),
      });
      const a = generate(config);
      const b = generate(config);
      expect(contentHash(a.grid, a.placements)).toBe(contentHash(b.grid, b.placements));
    }
  });

  it("never throws for plausible content across locales and strategies", () => {
    const locales = ["en", "pt", "es"] as const;
    const fillers = ["uniform", "weighted", "word_letters"] as const;
    const overlaps = ["none", "allowed", "encouraged"] as const;

    for (const languageCode of locales) {
      for (const fillerStrategy of fillers) {
        for (const overlapStrategy of overlaps) {
          const result = generate(
            input({ languageCode, fillerStrategy, overlapStrategy, words: words(6) }),
          );
          expect(verifyPlacements(result.grid, result.placements).valid).toBe(true);
          expect(result.grid.cells.flat().every((c) => c.display.length > 0)).toBe(true);
        }
      }
    }
  });

  it("degrades gracefully when the grid is far too small", () => {
    const result = generate(input({ gridSize: 6, words: words(20) }));
    // Some words will not fit — every one of them must be reported.
    expect(result.failedWords.length).toBeGreaterThan(0);
    expect(result.metrics.placedWords + result.metrics.failedWords).toBe(20);
    expect(result.success).toBe(false);
    // What did get placed is still correct.
    expect(verifyPlacements(result.grid, result.placements).valid).toBe(true);
  });

  it("keeps quality high for well-sized puzzles across seeds", () => {
    const scores: number[] = [];
    for (let seed = 1; seed <= 25; seed++) {
      scores.push(generate(input({ seed })).qualityScore);
    }
    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    expect(mean).toBeGreaterThan(70);
    expect(Math.min(...scores)).toBeGreaterThan(50);
  });
});
