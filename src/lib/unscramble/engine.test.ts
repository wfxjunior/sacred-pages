import { describe, expect, it } from "vitest";
import {
  applyUnscrambleHint,
  clearUnscramble,
  createInitialUnscrambleState,
  isUnscrambleWord,
  mapUnscrambleKey,
  pickUnscrambleByChar,
  pickUnscrambleLetter,
  removeLastUnscrambleLetter,
  resetUnscramble,
  ghostLetterFor,
  resolveUnscrambleSettings,
  revealUnscramble,
  scrambleWord,
  submitUnscramble,
  unscrambleRounds,
} from "./engine";
import type { UnscrambleRound, UnscrambleState } from "./types";

const WORDS = ["GRACE", "FAITH", "PEACE", "GRATITUDE", "JOY", "CONTENTMENT", "HOPE"];

function round(word = "GRACE", seed = "test"): UnscrambleRound {
  return { word, letters: scrambleWord(word, seed) };
}

/** Builds the correct word by picking pool indexes in reading order. */
function solve(state: UnscrambleState, r: UnscrambleRound): UnscrambleState {
  let next = state;
  for (const char of r.word) next = pickUnscrambleByChar(next, r, char);
  return next;
}

describe("scrambleWord", () => {
  it("is deterministic, keeps the letters, and never returns the original order", () => {
    for (const word of WORDS) {
      const a = scrambleWord(word, "seed-1");
      expect(scrambleWord(word, "seed-1")).toEqual(a);
      expect([...a].sort()).toEqual([...word].sort());
      expect(a.join("")).not.toBe(word);
    }
  });

  it("varies with the seed", () => {
    const seeds = ["a", "b", "c", "d", "e"];
    const orders = new Set(seeds.map((s) => scrambleWord("GRATITUDE", s).join("")));
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe("round building", () => {
  it("filters unplayable words", () => {
    expect(isUnscrambleWord("GRACE")).toBe(true);
    expect(isUnscrambleWord("NO")).toBe(false);
    expect(isUnscrambleWord("AAA")).toBe(false);
  });

  it("prefers the difficulty band and falls back when it is empty", () => {
    const gentle = unscrambleRounds(WORDS, "gentle", "day");
    for (const r of gentle) {
      expect(r.word.length).toBeGreaterThanOrEqual(3);
      expect(r.word.length).toBeLessThanOrEqual(5);
    }
    const expert = unscrambleRounds(["JOY", "HOPE"], "expert", "day");
    expect(expert.length).toBeGreaterThan(0);
  });

  it("orders rounds deterministically per seed and dedupes words", () => {
    const a = unscrambleRounds([...WORDS, "grace"], "balanced", "day-1");
    expect(unscrambleRounds([...WORDS, "grace"], "balanced", "day-1")).toEqual(a);
    expect(a.filter((r) => r.word === "GRACE")).toHaveLength(1);
  });
});

describe("picking and editing", () => {
  it("places, removes and clears letters", () => {
    const r = round();
    let state = pickUnscrambleLetter(createInitialUnscrambleState(r), r, 0);
    expect(state.picked).toEqual([0]);
    expect(state.status).toBe("in_progress");
    state = pickUnscrambleLetter(state, r, 0);
    expect(state.picked).toEqual([0]);
    state = pickUnscrambleLetter(state, r, 2);
    state = removeLastUnscrambleLetter(state);
    expect(state.picked).toEqual([0]);
    expect(clearUnscramble(state).picked).toEqual([]);
  });

  it("picks by typed character, skipping already-used pool letters", () => {
    const r = round("PEACE");
    let state = pickUnscrambleByChar(createInitialUnscrambleState(r), r, "e");
    const first = state.picked[0]!;
    state = pickUnscrambleByChar(state, r, "E");
    expect(state.picked).toHaveLength(2);
    expect(state.picked[1]).not.toBe(first);
    expect(pickUnscrambleByChar(state, r, "z").picked).toHaveLength(2);
  });
});

describe("submitting", () => {
  it("accepts the exact order and completes", () => {
    const r = round();
    const settings = resolveUnscrambleSettings("gentle");
    const { state, result } = submitUnscramble(
      solve(createInitialUnscrambleState(r), r),
      r,
      settings,
    );
    expect(result).toBe("correct");
    expect(state.status).toBe("completed");
  });

  it("reports incomplete before every letter is placed", () => {
    const r = round();
    const settings = resolveUnscrambleSettings("gentle");
    const one = pickUnscrambleLetter(createInitialUnscrambleState(r), r, 0);
    expect(submitUnscramble(one, r, settings).result).toBe("incomplete");
  });

  it("counts wrong orders and fails at the limit", () => {
    const r = round("GRATITUDE");
    const settings = resolveUnscrambleSettings("expert");
    let state = createInitialUnscrambleState(r);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      state = clearUnscramble(state);
      for (let i = 0; i < r.letters.length; i += 1) state = pickUnscrambleLetter(state, r, i);
      // pool order is guaranteed different from the word, so this is wrong
      state = submitUnscramble(state, r, settings).state;
    }
    expect(state.incorrectAttempts).toBe(3);
    expect(state.status).toBe("failed");
  });

  it("protects finished rounds", () => {
    const r = round();
    const settings = resolveUnscrambleSettings("gentle");
    const done = submitUnscramble(solve(createInitialUnscrambleState(r), r), r, settings).state;
    expect(submitUnscramble(done, r, settings).result).toBe("already_completed");
    expect(pickUnscrambleLetter(done, r, 0)).toBe(done);
    const revealed = revealUnscramble(createInitialUnscrambleState(r), r);
    expect(submitUnscramble(revealed, r, settings).result).toBe("solution_revealed");
  });
});

describe("hint and reveal", () => {
  it("advances one correct letter at a time and can finish the word", () => {
    const r = round();
    let state = createInitialUnscrambleState(r);
    for (let i = 1; i <= r.letters.length; i += 1) {
      state = applyUnscrambleHint(state, r);
      expect(state.hintsUsed).toBe(i);
      const built = state.picked.map((p) => r.letters[p]).join("");
      expect(r.word.startsWith(built)).toBe(true);
    }
    expect(state.status).toBe("completed");
  });

  it("trims a wrong prefix before helping", () => {
    const r = round("GRACE");
    // place a deliberately wrong first letter (anything that isn't G)
    const wrongIndex = r.letters.findIndex((l) => l !== "G");
    let state = pickUnscrambleLetter(createInitialUnscrambleState(r), r, wrongIndex);
    state = applyUnscrambleHint(state, r);
    expect(r.letters[state.picked[0]!]).toBe("G");
    expect(state.picked).toHaveLength(1);
  });

  it("reveals the word in reading order and blocks further play", () => {
    const r = round();
    const state = revealUnscramble(createInitialUnscrambleState(r), r);
    expect(state.status).toBe("revealed");
    expect(state.picked.map((p) => r.letters[p]).join("")).toBe(r.word);
    expect(applyUnscrambleHint(state, r)).toBe(state);
  });

  it("resets to a fresh round", () => {
    const r = round();
    const played = pickUnscrambleLetter(createInitialUnscrambleState(r), r, 1);
    expect(resetUnscramble(r)).toEqual(createInitialUnscrambleState(r));
    expect(played.picked).toHaveLength(1);
  });
});

describe("ghost letters", () => {
  it("anchors gentle rounds at both ends so the target word is unambiguous", () => {
    const r = round("PURE");
    const settings = resolveUnscrambleSettings("gentle");
    expect(ghostLetterFor(r, settings, 0)).toBe("P");
    expect(ghostLetterFor(r, settings, r.letters.length - 1)).toBe("E");
    expect(ghostLetterFor(r, settings, 1)).toBeNull();
  });

  it("shows only the first letter at balanced and challenging", () => {
    for (const level of ["balanced", "challenging"] as const) {
      const r = round("GRATITUDE");
      const settings = resolveUnscrambleSettings(level);
      expect(ghostLetterFor(r, settings, 0)).toBe("G");
      expect(ghostLetterFor(r, settings, r.letters.length - 1)).toBeNull();
    }
  });

  it("shows nothing at expert", () => {
    const r = round("CONTENTMENT");
    const settings = resolveUnscrambleSettings("expert");
    expect(ghostLetterFor(r, settings, 0)).toBeNull();
  });
});

describe("keyboard mapping", () => {
  it("maps keys to actions", () => {
    expect(mapUnscrambleKey("Backspace")).toEqual({ type: "remove" });
    expect(mapUnscrambleKey("Enter")).toEqual({ type: "submit" });
    expect(mapUnscrambleKey("a")).toEqual({ type: "char", char: "a" });
    expect(mapUnscrambleKey("ArrowUp")).toBeNull();
    expect(mapUnscrambleKey(" ")).toBeNull();
  });
});
