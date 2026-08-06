import { describe, expect, it } from "vitest";
import { resolveWordGuessSettings, WORD_GUESS_DIFFICULTY_PRESETS } from "./config";
import {
  answerCells,
  applyWordGuessHint,
  assembleGuess,
  clearEnteredAnswer,
  createInitialWordGuessState,
  insertCharacter,
  mapWordGuessKey,
  normalizeWordGuessAnswer,
  removeCharacter,
  resetWordGuess,
  resolveVisibleIndexes,
  revealWordGuessLetter,
  revealWordGuessSolution,
  validateWordGuessAnswer,
  wordGuessKeyboardFeedback,
} from "./engine";
import { wordGuessQuestionsForLocale } from "./questions";
import type { WordGuessQuestion, WordGuessState } from "./types";

function question(overrides: Partial<WordGuessQuestion> = {}): WordGuessQuestion {
  return {
    id: "wg-test",
    locale: "en",
    question: "Who parted the Red Sea?",
    answer: "MOSES",
    difficulty: "gentle",
    hint: "Raised in Pharaoh's palace.",
    // Pinned so gameplay tests know exactly which positions are hidden; the
    // difficulty presets themselves use varied random_letters positions and
    // are covered separately below.
    revealMode: "first_and_last",
    ...overrides,
  };
}

/** Types a full string into the hidden positions, left to right. */
function type(state: WordGuessState, q: WordGuessQuestion, text: string): WordGuessState {
  return Array.from(text).reduce((s, ch) => insertCharacter(s, q, ch), state);
}

describe("normalizeWordGuessAnswer", () => {
  it("uppercases and folds accents", () => {
    expect(normalizeWordGuessAnswer("Moisés")).toBe("MOISES");
    expect(normalizeWordGuessAnswer("oração")).toBe("ORACAO");
    expect(normalizeWordGuessAnswer("Jesús")).toBe("JESUS");
  });

  it("strips spaces, apostrophes and hyphens", () => {
    expect(normalizeWordGuessAnswer("NOAH'S ARK")).toBe("NOAHSARK");
    expect(normalizeWordGuessAnswer("MARY-MAGDALENE")).toBe("MARYMAGDALENE");
  });

  it("agrees for composed and decomposed Unicode", () => {
    expect(normalizeWordGuessAnswer("JESÚS")).toBe(normalizeWordGuessAnswer("JESÚS"));
  });

  it("keeps N-tilde distinct", () => {
    expect(normalizeWordGuessAnswer("año")).toBe("AÑO");
  });
});

describe("answerCells", () => {
  it("classifies letters, spaces and punctuation", () => {
    const cells = answerCells(question({ answer: "NOAH'S ARK" }));
    expect(cells.map((c) => c.kind)).toEqual([
      "letter",
      "letter",
      "letter",
      "letter",
      "punctuation",
      "letter",
      "space",
      "letter",
      "letter",
      "letter",
    ]);
    expect(cells[4]!.matchable).toBeNull();
    expect(cells[6]!.matchable).toBeNull();
  });

  it("keeps accented display characters while exposing folded matchables", () => {
    const cells = answerCells(question({ answer: "Oração" }));
    expect(cells.map((c) => c.char).join("")).toBe("ORAÇÃO");
    expect(cells.map((c) => c.matchable).join("")).toBe("ORACAO");
  });
});

describe("resolveVisibleIndexes", () => {
  it("reveals nothing for none", () => {
    expect(resolveVisibleIndexes(question({ revealMode: "none" }))).toEqual([]);
  });

  it("reveals only the first letter for first_letter", () => {
    expect(resolveVisibleIndexes(question({ revealMode: "first_letter" }))).toEqual([0]);
  });

  it("reveals first and last for first_and_last", () => {
    expect(resolveVisibleIndexes(question({ revealMode: "first_and_last" }))).toEqual([0, 4]);
  });

  it("collapses first_and_last for a single-letter answer", () => {
    expect(resolveVisibleIndexes(question({ answer: "A", revealMode: "first_and_last" }))).toEqual([
      0,
    ]);
  });

  it("skips punctuation for first_and_last on multi-word answers", () => {
    const indexes = resolveVisibleIndexes(
      question({ answer: "NOAH'S ARK", revealMode: "first_and_last" }),
    );
    expect(indexes).toEqual([0, 9]);
  });

  it("uses exactly the configured positions for custom, ignoring non-letters", () => {
    const indexes = resolveVisibleIndexes(
      question({ answer: "NOAH'S ARK", revealMode: "custom", customVisibleIndexes: [0, 4, 6, 7] }),
    );
    expect(indexes).toEqual([0, 7]);
  });

  it("is deterministic for random_letters with the same seed", () => {
    const q = question({ difficulty: "challenging", revealMode: "random_letters", seed: "seed-1" });
    const first = resolveVisibleIndexes(q);
    const second = resolveVisibleIndexes(q);
    expect(first).toEqual(second);
    expect(first.length).toBe(WORD_GUESS_DIFFICULTY_PRESETS.challenging.randomRevealCount);
  });

  it("changes with the seed and never reveals every letter", () => {
    const all = new Set(
      ["a", "b", "c", "d", "e", "f"].map((seed) =>
        resolveVisibleIndexes(
          question({ difficulty: "challenging", revealMode: "random_letters", seed }),
        ).join(","),
      ),
    );
    expect(all.size).toBeGreaterThan(1);
    const tiny = resolveVisibleIndexes(
      question({ answer: "AB", revealMode: "random_letters", difficulty: "gentle" }),
    );
    expect(tiny.length).toBeLessThan(2);
  });
});

describe("initial state and input", () => {
  it("starts not_started with the reveal pattern applied", () => {
    const q = question();
    const state = createInitialWordGuessState(q);
    expect(state.status).toBe("not_started");
    expect(state.visibleIndexes).toEqual([0, 4]);
    expect(state.entered).toHaveLength(5);
    expect(state.entered.every((c) => c == null)).toBe(true);
  });

  it("fills the leftmost hidden position and moves to in_progress", () => {
    const q = question();
    const state = insertCharacter(createInitialWordGuessState(q), q, "o");
    expect(state.status).toBe("in_progress");
    expect(state.entered[1]).toBe("O");
  });

  it("ignores punctuation input and overflow beyond the last hidden cell", () => {
    const q = question();
    let state = createInitialWordGuessState(q);
    state = insertCharacter(state, q, "'");
    expect(state.status).toBe("not_started");
    state = type(state, q, "OSEXX");
    expect(state.entered.filter((c) => c != null)).toHaveLength(3);
  });

  it("removes the last entered character and clears everything", () => {
    const q = question();
    let state = type(createInitialWordGuessState(q), q, "OS");
    state = removeCharacter(state);
    expect(state.entered[2]).toBeNull();
    expect(state.entered[1]).toBe("O");
    state = clearEnteredAnswer(state);
    expect(state.entered.every((c) => c == null)).toBe(true);
  });

  it("assembles fixed punctuation and spaces without user input", () => {
    const q = question({ answer: "NOAH'S ARK", revealMode: "none", difficulty: "expert" });
    const state = type(createInitialWordGuessState(q), q, "NOAHSARK");
    expect(assembleGuess(state, answerCells(q))).toBe("NOAH'S ARK");
  });
});

describe("validateWordGuessAnswer", () => {
  it("reports incomplete while hidden cells remain empty", () => {
    const q = question();
    const { result } = validateWordGuessAnswer(type(createInitialWordGuessState(q), q, "OS"), q);
    expect(result).toBe("incomplete");
  });

  it("accepts the exact answer", () => {
    const q = question();
    const { state, result } = validateWordGuessAnswer(
      type(createInitialWordGuessState(q), q, "OSE"),
      q,
    );
    expect(result).toBe("exact_match");
    expect(state.status).toBe("completed");
  });

  it("matches accent-insensitively in both directions", () => {
    const q = question({ answer: "MOISÉS", revealMode: "none", difficulty: "expert" });
    const { result } = validateWordGuessAnswer(
      type(createInitialWordGuessState(q), q, "MOISES"),
      q,
    );
    expect(result).toBe("exact_match");

    const plain = question({ answer: "JESUS", revealMode: "none", difficulty: "expert" });
    const typedAccent = type(createInitialWordGuessState(plain), plain, "JESÚS");
    expect(validateWordGuessAnswer(typedAccent, plain).result).toBe("exact_match");
  });

  it("counts incorrect attempts and records the guess", () => {
    const q = question();
    const { state, result } = validateWordGuessAnswer(
      type(createInitialWordGuessState(q), q, "ARE"),
      q,
    );
    expect(result).toBe("incorrect");
    expect(state.incorrectAttempts).toBe(1);
    expect(state.guesses).toEqual(["MARES"]);
    expect(state.entered[1]).toBe("A");
  });

  it("fails gently when the attempt limit is reached", () => {
    const q = question({ maximumIncorrectAttempts: 1 });
    const { state } = validateWordGuessAnswer(type(createInitialWordGuessState(q), q, "ARE"), q);
    expect(state.status).toBe("failed");
  });

  it("never fails when attempts are unlimited", () => {
    const q = question({ maximumIncorrectAttempts: null });
    let state = createInitialWordGuessState(q);
    for (let i = 0; i < 10; i += 1) {
      state = validateWordGuessAnswer(type(clearEnteredAnswer(state), q, "ARE"), q).state;
    }
    expect(state.status).toBe("in_progress");
    expect(state.incorrectAttempts).toBe(10);
  });

  it("protects completed and revealed rounds", () => {
    const q = question();
    const done = validateWordGuessAnswer(type(createInitialWordGuessState(q), q, "OSE"), q).state;
    expect(validateWordGuessAnswer(done, q).result).toBe("already_completed");
    expect(insertCharacter(done, q, "A")).toBe(done);
    expect(removeCharacter(done)).toBe(done);

    const revealed = revealWordGuessSolution(createInitialWordGuessState(q), q);
    expect(validateWordGuessAnswer(revealed, q).result).toBe("solution_revealed");
  });

  it("flags invalid characters defensively", () => {
    const q = question();
    const state = type(createInitialWordGuessState(q), q, "OSE");
    const corrupted = { ...state, entered: state.entered.map((c) => (c === "O" ? "?" : c)) };
    expect(validateWordGuessAnswer(corrupted, q).result).toBe("invalid_character");
  });
});

describe("hint, reveal letter, reveal solution, reset", () => {
  it("marks the hint as used, idempotently", () => {
    const q = question();
    const state = applyWordGuessHint(applyWordGuessHint(createInitialWordGuessState(q)));
    expect(state.hintUsed).toBe(true);
  });

  it("reveals the leftmost hidden letter, skipping punctuation", () => {
    const q = question({
      answer: "NOAH'S ARK",
      revealMode: "first_letter",
      difficulty: "balanced",
    });
    const state = revealWordGuessLetter(createInitialWordGuessState(q), q);
    expect(state.visibleIndexes).toContain(1);
    expect(state.revealedLetterCount).toBe(1);
  });

  it("discards a typed character on the revealed position", () => {
    const q = question();
    let state = type(createInitialWordGuessState(q), q, "X");
    expect(state.entered[1]).toBe("X");
    state = revealWordGuessLetter(state, q);
    expect(state.entered[1]).toBeNull();
    expect(state.visibleIndexes).toContain(1);
  });

  it("ends as revealed when the last hidden letter is revealed one by one", () => {
    const q = question();
    let state = createInitialWordGuessState(q);
    state = revealWordGuessLetter(state, q);
    state = revealWordGuessLetter(state, q);
    state = revealWordGuessLetter(state, q);
    expect(state.status).toBe("revealed");
  });

  it("reveals the full solution and blocks further play", () => {
    const q = question();
    const state = revealWordGuessSolution(createInitialWordGuessState(q), q);
    expect(state.status).toBe("revealed");
    expect(state.visibleIndexes).toEqual([0, 1, 2, 3, 4]);
    expect(revealWordGuessLetter(state, q)).toBe(state);
  });

  it("resets to a fresh round", () => {
    const q = question();
    const played = validateWordGuessAnswer(type(createInitialWordGuessState(q), q, "ARE"), q).state;
    expect(resetWordGuess(q)).toEqual(createInitialWordGuessState(q));
    expect(resetWordGuess(q).incorrectAttempts).toBe(0);
    expect(played.incorrectAttempts).toBe(1);
  });
});

describe("keyboard", () => {
  it("maps physical keys to actions", () => {
    expect(mapWordGuessKey("Backspace")).toEqual({ type: "remove" });
    expect(mapWordGuessKey("Enter")).toEqual({ type: "submit" });
    expect(mapWordGuessKey("a")).toEqual({ type: "insert", char: "a" });
    expect(mapWordGuessKey("ç")).toEqual({ type: "insert", char: "ç" });
    expect(mapWordGuessKey("ArrowLeft")).toBeNull();
    expect(mapWordGuessKey("'")).toBeNull();
    expect(mapWordGuessKey(" ")).toBeNull();
  });

  it("derives gentle present/absent feedback from submitted guesses", () => {
    const q = question();
    const state = validateWordGuessAnswer(type(createInitialWordGuessState(q), q, "ARE"), q).state;
    const feedback = wordGuessKeyboardFeedback(state, q);
    expect(feedback["E"]).toBe("present");
    expect(feedback["A"]).toBe("absent");
    expect(feedback["Z"]).toBeUndefined();
  });
});

describe("settings resolution", () => {
  it("derives behaviour from difficulty, with question overrides", () => {
    expect(resolveWordGuessSettings(question()).maximumIncorrectAttempts).toBeNull();
    expect(
      resolveWordGuessSettings(
        question({ difficulty: "expert", hint: "h", revealMode: undefined }),
      ),
    ).toMatchObject({
      revealMode: "none",
      hintAvailable: false,
      revealLetterAvailable: false,
    });
    expect(
      resolveWordGuessSettings(question({ maximumIncorrectAttempts: 2 })).maximumIncorrectAttempts,
    ).toBe(2);
    expect(resolveWordGuessSettings(question({ hint: undefined })).hintAvailable).toBe(false);
  });

  it("presets reveal varied positions per question, not a fixed pattern", () => {
    expect(WORD_GUESS_DIFFICULTY_PRESETS.gentle.revealMode).toBe("random_letters");
    expect(WORD_GUESS_DIFFICULTY_PRESETS.gentle.randomRevealCount).toBe(2);
    expect(WORD_GUESS_DIFFICULTY_PRESETS.balanced.revealMode).toBe("random_letters");
    expect(WORD_GUESS_DIFFICULTY_PRESETS.balanced.randomRevealCount).toBe(1);

    const patterns = new Set(
      ["wg-a", "wg-b", "wg-c", "wg-d", "wg-e", "wg-f"].map((id) =>
        resolveVisibleIndexes(question({ id, answer: "GRATITUDE", revealMode: undefined })).join(
          ",",
        ),
      ),
    );
    expect(patterns.size).toBeGreaterThan(1);
  });
});

describe("demo content", () => {
  it("provides at least 15 English questions with unique ids and matchable answers", () => {
    const questions = wordGuessQuestionsForLocale("en");
    expect(questions.length).toBeGreaterThanOrEqual(15);
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    for (const q of questions) {
      expect(normalizeWordGuessAnswer(q.answer).length).toBeGreaterThan(0);
      expect(answerCells(q).some((c) => c.kind === "letter")).toBe(true);
    }
  });

  it("ships translated sets for every locale, in that locale", () => {
    for (const locale of ["pt", "es"] as const) {
      const set = wordGuessQuestionsForLocale(locale);
      expect(set.length).toBeGreaterThanOrEqual(15);
      expect(new Set(set.map((q) => q.id)).size).toBe(set.length);
      for (const q of set) {
        expect(q.locale).toBe(locale);
        expect(normalizeWordGuessAnswer(q.answer).length).toBeGreaterThan(0);
      }
    }
  });
});
