import { describe, expect, it } from "vitest";
import {
  applyFinishVerseHint,
  availableBankEntries,
  buildFinishVerseRound,
  clearAllPlacements,
  clearSlot,
  createInitialFinishVerseState,
  mapFinishVerseKey,
  placeBankEntry,
  placeByChar,
  removeLastPlacement,
  resetFinishVerse,
  resolveFinishVerseSettings,
  revealFinishVerse,
  reviewFinishVerse,
  submitFinishVerse,
  summarizeFinishVerseReview,
  tokenizeVerse,
} from "./engine";
import { finishVersePassagesForLocale } from "./verses";
import type { FinishVerseRound, FinishVerseState } from "./types";

const PASSAGE = {
  reference: "Proverbs 3:5",
  text: "Trust in Yahweh with all your heart, and don't lean on your own understanding.",
};
const DISTRACTORS = ["mercy", "shepherd", "kingdom", "light", "rest", "glory"];

function round(difficulty: Parameters<typeof resolveFinishVerseSettings>[0] = "balanced") {
  return buildFinishVerseRound(PASSAGE, resolveFinishVerseSettings(difficulty), DISTRACTORS, "day");
}

/** Fills every slot with its correct bank chip. */
function solve(state: FinishVerseState, r: FinishVerseRound): FinishVerseState {
  let next = state;
  for (const slot of r.hiddenSlots) {
    const wanted = r.tokens[slot]!.matchable!;
    const entry = r.bank.find((e) => !next.placed.includes(e.id) && e.word === wanted)!;
    next = placeBankEntry(next, r, entry.id);
  }
  return next;
}

describe("tokenizeVerse", () => {
  it("keeps punctuation attached and marks pure punctuation unmatchable", () => {
    const tokens = tokenizeVerse("Be still, and know — now.");
    expect(tokens.map((t) => t.text)).toEqual(["Be", "still,", "and", "know", "—", "now."]);
    expect(tokens[1]!.matchable).toBe("STILL");
    expect(tokens[4]!.matchable).toBeNull();
  });
});

describe("buildFinishVerseRound", () => {
  it("is deterministic per seed and hides only real words", () => {
    const a = round();
    expect(round()).toEqual(a);
    for (const slot of a.hiddenSlots) {
      expect(a.tokens[slot]!.matchable).toBeTruthy();
    }
  });

  it("hides more of the verse as difficulty rises and respects the cap", () => {
    const gentle = round("gentle").hiddenSlots.length;
    const expert = round("expert").hiddenSlots.length;
    expect(expert).toBeGreaterThan(gentle);
    expect(expert).toBeLessThanOrEqual(resolveFinishVerseSettings("expert").maxHidden);
  });

  it("banks every hidden word plus distractors that never collide", () => {
    const r = round();
    const bankWords = r.bank.map((e) => e.word);
    for (const slot of r.hiddenSlots) {
      expect(bankWords).toContain(r.tokens[slot]!.matchable);
    }
    expect(r.bank.length).toBeGreaterThan(r.hiddenSlots.length);
  });

  it("varies with the seed", () => {
    const a = buildFinishVerseRound(
      PASSAGE,
      resolveFinishVerseSettings("expert"),
      DISTRACTORS,
      "a",
    );
    const b = buildFinishVerseRound(
      PASSAGE,
      resolveFinishVerseSettings("expert"),
      DISTRACTORS,
      "b",
    );
    expect(a.hiddenSlots.join() === b.hiddenSlots.join() && a.bank.join() === b.bank.join()).toBe(
      false,
    );
  });
});

describe("placing and editing", () => {
  it("places into the first empty slot, removes, clears one and clears all", () => {
    const r = round();
    const first = r.bank[0]!.id;
    let state = placeBankEntry(createInitialFinishVerseState(r), r, first);
    expect(state.placed[0]).toBe(first);
    expect(state.status).toBe("in_progress");
    expect(placeBankEntry(state, r, first)).toBe(state);
    state = placeBankEntry(state, r, r.bank[1]!.id);
    state = removeLastPlacement(state);
    expect(state.placed[1]).toBeNull();
    state = clearSlot(state, 0);
    expect(state.placed[0]).toBeNull();
    expect(clearAllPlacements(solve(state, r)).placed.every((v) => v == null)).toBe(true);
  });

  it("places by typed first letter from the available bank", () => {
    const r = round();
    const target = r.bank.find((e) => e.word.startsWith("H"));
    if (!target) return;
    const state = placeByChar(createInitialFinishVerseState(r), r, "h");
    expect(state.placed[0]).toBe(target.id);
  });

  it("tracks available bank entries", () => {
    const r = round();
    const state = placeBankEntry(createInitialFinishVerseState(r), r, r.bank[0]!.id);
    expect(availableBankEntries(state, r).map((e) => e.id)).not.toContain(r.bank[0]!.id);
  });
});

describe("submitting", () => {
  it("accepts the correct verse", () => {
    const r = round();
    const settings = resolveFinishVerseSettings("balanced");
    const { state, result } = submitFinishVerse(
      solve(createInitialFinishVerseState(r), r),
      r,
      settings,
    );
    expect(result).toBe("correct");
    expect(state.status).toBe("completed");
  });

  it("reports incomplete while slots are empty", () => {
    const r = round();
    const settings = resolveFinishVerseSettings("balanced");
    expect(submitFinishVerse(createInitialFinishVerseState(r), r, settings).result).toBe(
      "incomplete",
    );
  });

  it("keeps correct placements and returns wrong ones to the bank", () => {
    const r = round("expert");
    const settings = resolveFinishVerseSettings("expert");
    // solve, then swap two differing placements to make exactly those wrong
    let state = solve(createInitialFinishVerseState(r), r);
    const swapA = 0;
    const swapB = state.placed.findIndex(
      (id, i) =>
        i > 0 &&
        r.bank.find((e) => e.id === id)!.word !==
          r.bank.find((e) => e.id === state.placed[0])!.word,
    );
    if (swapB === -1) return;
    const placed = [...state.placed];
    [placed[swapA], placed[swapB]] = [placed[swapB]!, placed[swapA]!];
    state = { ...state, placed };
    const outcome = submitFinishVerse(state, r, settings);
    expect(outcome.result).toBe("incorrect");
    expect(outcome.state.placed[swapA]).toBeNull();
    expect(outcome.state.placed[swapB]).toBeNull();
    expect(
      outcome.state.placed.filter((id, i) => i !== swapA && i !== swapB && id != null).length,
    ).toBe(state.placed.length - 2);
  });

  it("fails gently at the attempt limit and protects finished rounds", () => {
    const r = round("expert");
    const settings = { ...resolveFinishVerseSettings("expert"), maximumIncorrectAttempts: 1 };
    let state = solve(createInitialFinishVerseState(r), r);
    const placed = [...state.placed].reverse();
    state = { ...state, placed };
    const wrongEverywhere = submitFinishVerse(state, r, settings);
    if (wrongEverywhere.result === "correct") return; // pathological palindrome — skip
    expect(wrongEverywhere.state.status).toBe("failed");
    expect(submitFinishVerse(wrongEverywhere.state, r, settings).result).toBe("already_completed");
    const revealed = revealFinishVerse(createInitialFinishVerseState(r), r);
    expect(submitFinishVerse(revealed, r, settings).result).toBe("solution_revealed");
  });
});

describe("hint, reveal, reset", () => {
  it("fixes one slot at a time and can complete the verse", () => {
    const r = round();
    let state = createInitialFinishVerseState(r);
    for (let i = 1; i <= r.hiddenSlots.length; i += 1) {
      state = applyFinishVerseHint(state, r);
      expect(state.hintsUsed).toBe(i);
    }
    expect(state.status).toBe("completed");
  });

  it("repairs a wrong placement before filling empties", () => {
    const r = round();
    const wrongEntry = r.bank.find((e) => e.word !== r.tokens[r.hiddenSlots[0]!]!.matchable)!;
    let state = placeBankEntry(createInitialFinishVerseState(r), r, wrongEntry.id);
    state = applyFinishVerseHint(state, r);
    const placedWord = r.bank.find((e) => e.id === state.placed[0])!.word;
    expect(placedWord).toBe(r.tokens[r.hiddenSlots[0]!]!.matchable);
  });

  it("reveals the whole verse and blocks further play", () => {
    const r = round();
    const state = revealFinishVerse(createInitialFinishVerseState(r), r);
    expect(state.status).toBe("revealed");
    state.placed.forEach((id, slotIndex) => {
      expect(r.bank.find((e) => e.id === id)!.word).toBe(
        r.tokens[r.hiddenSlots[slotIndex]!]!.matchable,
      );
    });
    expect(applyFinishVerseHint(state, r)).toBe(state);
  });

  it("resets to a fresh round", () => {
    const r = round();
    expect(resetFinishVerse(r)).toEqual(createInitialFinishVerseState(r));
  });
});

describe("review", () => {
  it("judges every slot: correct, wrong and left empty", () => {
    const r = round();
    const solved = solve(createInitialFinishVerseState(r), r);
    // keep slot 0 correct, make slot 1 wrong, leave slot 2 empty
    const placed = [...solved.placed];
    const wrongEntry = r.bank.find(
      (e) =>
        !placed.slice(0, 1).includes(e.id) && e.word !== r.tokens[r.hiddenSlots[1]!]!.matchable,
    )!;
    placed[1] = wrongEntry.id;
    placed[2] = null;

    const review = reviewFinishVerse(r, placed);
    expect(review).toHaveLength(r.hiddenSlots.length);
    expect(review[0]!.status).toBe("correct");
    expect(review[0]!.placedWord).toBe(review[0]!.correctWord);
    expect(review[1]!.status).toBe("wrong");
    expect(review[1]!.placedWord).toBe(wrongEntry.word);
    expect(review[1]!.correctWord).toBe(r.tokens[r.hiddenSlots[1]!]!.matchable);
    expect(review[2]!.status).toBe("empty");
    expect(review[2]!.placedWord).toBeNull();
    // display text keeps the verse's own casing and punctuation
    expect(review[0]!.correctText).toBe(r.tokens[r.hiddenSlots[0]!]!.text);
  });

  it("marks a fully solved round as all correct, and an untouched one as all empty", () => {
    const r = round();
    const solved = solve(createInitialFinishVerseState(r), r);
    expect(summarizeFinishVerseReview(reviewFinishVerse(r, solved.placed))).toMatchObject({
      correct: r.hiddenSlots.length,
      wrong: 0,
      empty: 0,
      total: r.hiddenSlots.length,
    });
    const untouched = createInitialFinishVerseState(r);
    expect(summarizeFinishVerseReview(reviewFinishVerse(r, untouched.placed))).toMatchObject({
      correct: 0,
      wrong: 0,
      empty: r.hiddenSlots.length,
    });
  });

  it("treats an unknown bank id as an empty slot instead of throwing", () => {
    const r = round();
    const review = reviewFinishVerse(r, [9999, ...r.hiddenSlots.slice(1).map(() => null)]);
    expect(review[0]!.status).toBe("empty");
  });
});

describe("keyboard and content", () => {
  it("maps keys to actions", () => {
    expect(mapFinishVerseKey("Backspace")).toEqual({ type: "remove" });
    expect(mapFinishVerseKey("Enter")).toEqual({ type: "submit" });
    expect(mapFinishVerseKey("a")).toEqual({ type: "char", char: "a" });
    expect(mapFinishVerseKey("Tab")).toBeNull();
  });

  it("curates at least 12 public-domain passages per locale with sound data", () => {
    for (const locale of ["en", "pt", "es"] as const) {
      const verses = finishVersePassagesForLocale(locale);
      expect(verses.length).toBeGreaterThanOrEqual(12);
      expect(new Set(verses.map((v) => v.reference)).size).toBe(verses.length);
      for (const verse of verses) {
        expect(tokenizeVerse(verse.text).filter((t) => t.matchable).length).toBeGreaterThanOrEqual(
          5,
        );
      }
    }
  });
});
