import { describe, expect, it } from "vitest";
import { GAME_DIFFICULTIES } from "@/lib/games";
import { wordGuessPool } from "./pool";
import { wordGuessQuestionsForLocale } from "./questions";

describe("wordGuessPool", () => {
  it("offers the whole pool at every difficulty, never a filtered handful", () => {
    const all = wordGuessQuestionsForLocale("en");
    for (const difficulty of GAME_DIFFICULTIES) {
      const pool = wordGuessPool("en", difficulty, "2026-08-06");
      expect(pool).toHaveLength(all.length);
      expect(new Set(pool.map((q) => q.id)).size).toBe(all.length);
    }
  });

  it("leads with the questions tagged for the chosen level", () => {
    for (const difficulty of GAME_DIFFICULTIES) {
      const pool = wordGuessPool("en", difficulty, "2026-08-06");
      const tagged = pool.filter((q) => q.difficulty === difficulty).length;
      expect(pool.slice(0, tagged).every((q) => q.difficulty === difficulty)).toBe(true);
    }
  });

  it("holds its order for a day and changes with the date", () => {
    const today = wordGuessPool("en", "gentle", "2026-08-06").map((q) => q.id);
    expect(wordGuessPool("en", "gentle", "2026-08-06").map((q) => q.id)).toEqual(today);
    const tomorrow = wordGuessPool("en", "gentle", "2026-08-07").map((q) => q.id);
    expect(tomorrow).not.toEqual(today);
  });

  it("orders differently per difficulty and per locale", () => {
    const gentle = wordGuessPool("en", "gentle", "d")
      .map((q) => q.id)
      .join();
    const expert = wordGuessPool("en", "expert", "d")
      .map((q) => q.id)
      .join();
    expect(gentle).not.toBe(expert);
    const pt = wordGuessPool("pt", "gentle", "d")
      .map((q) => q.id)
      .join();
    expect(pt).not.toBe(gentle);
  });
});
