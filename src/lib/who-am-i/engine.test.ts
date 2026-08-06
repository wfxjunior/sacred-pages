import { describe, expect, it } from "vitest";
import { normalizeWord } from "@/lib/content/normalize";
import { resolveWhoAmISettings, WHO_AM_I_DIFFICULTY_PRESETS } from "./config";
import {
  createInitialWhoAmIState,
  isGuessedWhoAmIOption,
  resetWhoAmI,
  revealNextWhoAmIClue,
  revealWhoAmISolution,
  submitWhoAmIGuess,
  whoAmIOptions,
  whoAmISessionSummary,
} from "./engine";
import { whoAmIQuestionsForLocale } from "./questions";
import type { WhoAmIQuestion } from "./types";

function question(overrides: Partial<WhoAmIQuestion> = {}): WhoAmIQuestion {
  return {
    id: "wai-test",
    locale: "en",
    clues: ["First clue.", "Second clue.", "Third clue.", "Fourth clue."],
    answer: "MOSES",
    acceptedAnswers: ["MOSHE"],
    distractors: ["AARON", "JOSHUA", "ABRAHAM", "JACOB", "SAMUEL", "DAVID"],
    difficulty: "gentle",
    ...overrides,
  };
}

describe("initial state", () => {
  it("shows the preset's initial clues and starts not_started", () => {
    expect(createInitialWhoAmIState(question()).cluesRevealed).toBe(2);
    expect(createInitialWhoAmIState(question({ difficulty: "balanced" })).cluesRevealed).toBe(1);
    expect(createInitialWhoAmIState(question()).status).toBe("not_started");
  });

  it("never shows fewer than one clue nor more than exist", () => {
    const short = question({ clues: ["Only clue."] });
    expect(createInitialWhoAmIState(short).cluesRevealed).toBe(1);
  });
});

describe("options", () => {
  it("is deterministic per question id and contains the answer exactly once", () => {
    const q = question();
    const first = whoAmIOptions(q);
    expect(whoAmIOptions(q)).toEqual(first);
    expect(first.filter((o) => o === "MOSES")).toHaveLength(1);
    expect(first).toHaveLength(WHO_AM_I_DIFFICULTY_PRESETS.gentle.optionCount);
  });

  it("varies with the question id and respects the challenging count", () => {
    const a = whoAmIOptions(question({ id: "wai-a", difficulty: "challenging" }));
    const b = whoAmIOptions(question({ id: "wai-b", difficulty: "challenging" }));
    expect(a).toHaveLength(6);
    expect(a.join()).not.toBe(b.join());
  });

  it("returns no options in free_text mode", () => {
    expect(whoAmIOptions(question({ difficulty: "expert" }))).toEqual([]);
  });
});

describe("clue reveal", () => {
  it("reveals one clue at a time up to the last", () => {
    const q = question();
    let state = createInitialWhoAmIState(q);
    state = revealNextWhoAmIClue(state, q);
    expect(state.cluesRevealed).toBe(3);
    expect(state.status).toBe("in_progress");
    state = revealNextWhoAmIClue(state, q);
    expect(state.cluesRevealed).toBe(4);
    expect(revealNextWhoAmIClue(state, q)).toBe(state);
  });

  it("does nothing after the round ends", () => {
    const q = question();
    const done = submitWhoAmIGuess(createInitialWhoAmIState(q), q, "MOSES").state;
    expect(revealNextWhoAmIClue(done, q)).toBe(done);
  });
});

describe("guessing", () => {
  it("accepts the answer case- and accent-insensitively", () => {
    const q = question();
    expect(submitWhoAmIGuess(createInitialWhoAmIState(q), q, "moses").result).toBe("correct");
    const accented = question({ answer: "MOISÉS" });
    expect(submitWhoAmIGuess(createInitialWhoAmIState(accented), accented, "Moises").result).toBe(
      "correct",
    );
  });

  it("accepts declared aliases only", () => {
    const q = question();
    expect(submitWhoAmIGuess(createInitialWhoAmIState(q), q, "Moshe").result).toBe("correct");
    expect(submitWhoAmIGuess(createInitialWhoAmIState(q), q, "Aaron").result).toBe("incorrect");
  });

  it("ignores empty and punctuation-only guesses without charging an attempt", () => {
    const q = question();
    const { state, result } = submitWhoAmIGuess(createInitialWhoAmIState(q), q, "  '- ");
    expect(result).toBe("empty");
    expect(state.incorrectAttempts).toBe(0);
  });

  it("counts wrong guesses, remembers them, and fails at the limit", () => {
    const q = question({ difficulty: "challenging" });
    let state = createInitialWhoAmIState(q);
    ({ state } = submitWhoAmIGuess(state, q, "Aaron", resolveWhoAmISettings(q)));
    expect(state.incorrectAttempts).toBe(1);
    expect(isGuessedWhoAmIOption(state, "AARON")).toBe(true);
    expect(isGuessedWhoAmIOption(state, "JOSHUA")).toBe(false);
    ({ state } = submitWhoAmIGuess(state, q, "Joshua", resolveWhoAmISettings(q)));
    expect(state.status).toBe("failed");
  });

  it("never fails on gentle (unlimited attempts)", () => {
    const q = question();
    let state = createInitialWhoAmIState(q);
    for (const wrong of ["Aaron", "Joshua", "Abraham", "Jacob", "Samuel"]) {
      ({ state } = submitWhoAmIGuess(state, q, wrong));
    }
    expect(state.status).toBe("in_progress");
    expect(state.incorrectAttempts).toBe(5);
  });

  it("protects finished rounds", () => {
    const q = question();
    const done = submitWhoAmIGuess(createInitialWhoAmIState(q), q, "MOSES").state;
    expect(submitWhoAmIGuess(done, q, "Aaron").result).toBe("already_completed");
    const revealed = revealWhoAmISolution(createInitialWhoAmIState(q));
    expect(submitWhoAmIGuess(revealed, q, "MOSES").result).toBe("solution_revealed");
  });
});

describe("reveal solution and reset", () => {
  it("reveals from fresh, in-progress and failed states, but not from completed", () => {
    const q = question({ difficulty: "challenging" });
    expect(revealWhoAmISolution(createInitialWhoAmIState(q)).status).toBe("revealed");
    let state = createInitialWhoAmIState(q);
    ({ state } = submitWhoAmIGuess(state, q, "Aaron"));
    ({ state } = submitWhoAmIGuess(state, q, "Jacob"));
    expect(state.status).toBe("failed");
    expect(revealWhoAmISolution(state).status).toBe("revealed");
    const done = submitWhoAmIGuess(createInitialWhoAmIState(q), q, "MOSES").state;
    expect(revealWhoAmISolution(done)).toBe(done);
  });

  it("resets to a fresh round", () => {
    const q = question();
    const played = submitWhoAmIGuess(
      revealNextWhoAmIClue(createInitialWhoAmIState(q), q),
      q,
      "Aaron",
    ).state;
    expect(resetWhoAmI(q)).toEqual(createInitialWhoAmIState(q));
    expect(played.incorrectAttempts).toBe(1);
  });
});

describe("session summary (shared platform contract)", () => {
  it("reports clues beyond the initial reveal as hints", () => {
    const q = question();
    let state = createInitialWhoAmIState(q);
    state = revealNextWhoAmIClue(state, q);
    state = revealNextWhoAmIClue(state, q);
    const { state: done } = submitWhoAmIGuess(state, q, "MOSES");
    const summary = whoAmISessionSummary(done, q);
    expect(summary).toMatchObject({
      mode: "who_am_i",
      difficulty: "gentle",
      status: "completed",
      attemptsUsed: 1,
      hintsUsed: 2,
      lettersRevealed: 0,
    });
  });
});

describe("demo content", () => {
  it("provides at least 12 questions with unique ids and sound data", () => {
    const questions = whoAmIQuestionsForLocale("en");
    expect(questions.length).toBeGreaterThanOrEqual(22);
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    for (const q of questions) {
      expect(q.clues.length).toBeGreaterThanOrEqual(3);
      expect(normalizeWord(q.answer).length).toBeGreaterThan(0);
      const settings = resolveWhoAmISettings(q);
      if (settings.inputMode === "options") {
        expect(q.distractors.length).toBeGreaterThanOrEqual(settings.optionCount - 1);
      }
      expect(q.distractors.map(normalizeWord)).not.toContain(normalizeWord(q.answer));
    }
  });

  it("ships translated sets for every locale, in that locale and structurally sound", () => {
    for (const locale of ["pt", "es"] as const) {
      const set = whoAmIQuestionsForLocale(locale);
      expect(set.length).toBeGreaterThanOrEqual(22);
      expect(new Set(set.map((q) => q.id)).size).toBe(set.length);
      for (const q of set) {
        expect(q.locale).toBe(locale);
        expect(q.clues.length).toBeGreaterThanOrEqual(3);
        const settings = resolveWhoAmISettings(q);
        if (settings.inputMode === "options") {
          expect(q.distractors.length).toBeGreaterThanOrEqual(settings.optionCount - 1);
        }
        expect(q.distractors.map(normalizeWord)).not.toContain(normalizeWord(q.answer));
      }
    }
  });
});
