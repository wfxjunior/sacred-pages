import { describe, expect, it } from "vitest";
import { wordsFor } from "./today";
import type { DifficultyLevel } from "./types";

// A shuffle must change what the reader *sees*: not only which words are drawn
// from the pool, but the order they are listed in. A draw that returns the same
// set in the same order feels like nothing happened, even if the pool logic ran.

const TIERS: DifficultyLevel[] = ["gentle", "balanced", "challenging", "expert"];

function pool(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    display: `WORD${i + 1}`,
    minDifficulty: TIERS[i % TIERS.length]!,
  }));
}

/** The full pool, all at the easiest tier: every draw returns the same set. */
function exactPool(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    display: `WORD${i + 1}`,
    minDifficulty: "gentle" as DifficultyLevel,
  }));
}

const day = "2026-08-02";

describe("wordsFor ordering", () => {
  it("changes the visual order when the variant changes, even with the same set", () => {
    // Six words, tier asks for six: the set is forced, so any difference the
    // reader notices has to come from the ordering.
    const words = exactPool(6);
    const a = wordsFor(words, "gentle", 1, "journey", [], [], day);
    const b = wordsFor(words, "gentle", 2, "journey", [], [], day);

    expect([...a].sort()).toEqual([...b].sort());
    expect(a).not.toEqual(b);
  });

  it("keeps varying the order across many consecutive shuffles", () => {
    const words = exactPool(6);
    const orders = new Set(
      Array.from({ length: 8 }, (_, i) => wordsFor(words, "gentle", i + 1, "j", [], [], day).join("|")),
    );
    expect(orders.size).toBeGreaterThan(4);
  });

  it("is deterministic for the same variant, so a re-render does not reorder", () => {
    const words = pool(16);
    expect(wordsFor(words, "balanced", 7, "journey", [], [], day)).toEqual(
      wordsFor(words, "balanced", 7, "journey", [], [], day),
    );
  });

  it("reorders even when the previous draw has to be reused entirely", () => {
    const words = exactPool(6);
    const previous = wordsFor(words, "gentle", 3, "journey", [], [], day);
    const next = wordsFor(words, "gentle", 4, "journey", previous, previous, day);

    expect([...next].sort()).toEqual([...previous].sort());
    expect(next).not.toEqual(previous);
  });

  it("changes both the set and the order when the pool has spare words", () => {
    const words = pool(16);
    const first = wordsFor(words, "gentle", 11, "journey", [], [], day);
    const second = wordsFor(words, "gentle", 12, "journey", first, first, day);

    expect(second).not.toEqual(first);
    expect(second.some((w) => !first.includes(w))).toBe(true);
  });

  it("orders differently per journey for the same day and variant", () => {
    const words = exactPool(6);
    const a = wordsFor(words, "gentle", 5, "journey-a", [], [], day);
    const b = wordsFor(words, "gentle", 5, "journey-b", [], [], day);
    expect(a).not.toEqual(b);
  });
});