import { describe, expect, it } from "vitest";
import { LIVING_JOURNAL_ENTRIES, LIVING_JOURNAL_MOMENTS } from "./livingJournalData";
import { __testing } from "./useLivingJournalSequence";

const { delayAfterCharacter, shuffledIndices } = __testing;

const BASE = 50;

describe("delayAfterCharacter", () => {
  it("rests longest at the end of a sentence, where a person actually stops", () => {
    expect(delayAfterCharacter(".", 3, BASE)).toBe(BASE * 9);
    expect(delayAfterCharacter("!", 3, BASE)).toBe(BASE * 9);
    expect(delayAfterCharacter("?", 3, BASE)).toBe(BASE * 9);
  });

  it("rests less at a mid-sentence break than at a full stop", () => {
    expect(delayAfterCharacter(",", 3, BASE)).toBe(BASE * 5);
    expect(delayAfterCharacter(";", 3, BASE)).toBe(BASE * 5);
    expect(delayAfterCharacter(":", 3, BASE)).toBe(BASE * 5);
    expect(delayAfterCharacter(",", 3, BASE)).toBeLessThan(delayAfterCharacter(".", 3, BASE));
  });

  it("gives a word boundary a short breath", () => {
    expect(delayAfterCharacter(" ", 3, BASE)).toBe(BASE * 1.6);
  });

  it("types an ordinary letter at the base pace", () => {
    expect(delayAfterCharacter("a", 3, BASE)).toBe(BASE);
  });

  it("adds one longer hesitation partway through a run of plain letters", () => {
    expect(delayAfterCharacter("a", 37, BASE)).toBe(BASE * 4);
    expect(delayAfterCharacter("a", 74, BASE)).toBe(BASE * 4);
  });

  it("never treats the very first character as a hesitation point", () => {
    // 0 % 37 === 0, so this only stays base-paced because of the index > 0 guard.
    expect(delayAfterCharacter("a", 0, BASE)).toBe(BASE);
  });

  it("lets punctuation win over the hesitation rhythm at the same index", () => {
    expect(delayAfterCharacter(".", 37, BASE)).toBe(BASE * 9);
    expect(delayAfterCharacter(" ", 37, BASE)).toBe(BASE * 1.6);
  });

  it("scales with the entry's own typing speed rather than a fixed constant", () => {
    expect(delayAfterCharacter("a", 3, 10)).toBe(10);
    expect(delayAfterCharacter(".", 3, 10)).toBe(90);
  });
});

describe("shuffledIndices", () => {
  it("returns the same order for the same seed, so the sequence is reproducible", () => {
    expect(shuffledIndices(10, 20260729)).toEqual(shuffledIndices(10, 20260729));
  });

  it("is a true permutation — every entry appears exactly once", () => {
    const order = shuffledIndices(10, 20260729);
    expect(order).toHaveLength(10);
    expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("actually reorders rather than returning the input untouched", () => {
    const identity = Array.from({ length: 10 }, (_, i) => i);
    expect(shuffledIndices(10, 20260729)).not.toEqual(identity);
  });

  it("produces a different order for a different seed", () => {
    expect(shuffledIndices(10, 1)).not.toEqual(shuffledIndices(10, 2));
  });

  it("handles the degenerate lengths without throwing", () => {
    expect(shuffledIndices(0, 7)).toEqual([]);
    expect(shuffledIndices(1, 7)).toEqual([0]);
  });

  it("stays a permutation across many seeds", () => {
    for (let seed = 0; seed < 50; seed++) {
      const order = shuffledIndices(LIVING_JOURNAL_ENTRIES.length, seed);
      expect(new Set(order).size).toBe(LIVING_JOURNAL_ENTRIES.length);
    }
  });
});

/**
 * The Living Journal is deliberately not a feed. These assertions guard the
 * editorial contract described in livingJournal.types.ts — the kind of thing
 * that erodes one well-meaning content edit at a time.
 */
describe("living journal content", () => {
  it("gives every entry a unique id, so the React keys cannot collide", () => {
    const ids = LIVING_JOURNAL_ENTRIES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every moment a unique id", () => {
    const ids = LIVING_JOURNAL_MOMENTS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses first names only — never a surname", () => {
    for (const entry of LIVING_JOURNAL_ENTRIES) {
      expect(entry.firstName.trim()).toBe(entry.firstName);
      expect(entry.firstName).not.toMatch(/\s/);
    }
  });

  it("keeps every entry to a single short, readable thought", () => {
    for (const entry of LIVING_JOURNAL_ENTRIES) {
      expect(entry.message.length).toBeGreaterThan(0);
      expect(entry.message.length).toBeLessThanOrEqual(120);
    }
  });

  it("keeps the global moments anonymous — no first names borrowed from entries", () => {
    const names = LIVING_JOURNAL_ENTRIES.map((e) => e.firstName);
    for (const moment of LIVING_JOURNAL_MOMENTS) {
      for (const name of names) {
        expect(moment.text).not.toContain(name);
      }
    }
  });

  it("has enough moments to fill the visible list without repeating a key", () => {
    // GlobalMomentList renders four at a time from a rotating offset.
    expect(LIVING_JOURNAL_MOMENTS.length).toBeGreaterThan(4);
  });
});
