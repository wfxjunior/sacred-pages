import { describe, expect, it } from "vitest";
import { wordGuessQuestionsForLocale } from "@/lib/word-guess/questions";
import { whoAmIQuestionsForLocale } from "@/lib/who-am-i/questions";
import { dailyChallengeFor } from "./engine";

function dates(count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const day = `${(i % 28) + 1}`.padStart(2, "0");
    const month = `${Math.floor(i / 28) + 1}`.padStart(2, "0");
    return `2026-${month}-${day}`;
  });
}

describe("dailyChallengeFor", () => {
  it("is deterministic for the same date and locale", () => {
    expect(dailyChallengeFor("2026-08-05", "en")).toEqual(dailyChallengeFor("2026-08-05", "en"));
  });

  it("varies across dates and rotates through every mode", () => {
    const challenges = dates(60).map((date) => dailyChallengeFor(date, "en"));
    const modes = new Set(challenges.map((c) => c.mode));
    expect(modes).toEqual(new Set(["word_search", "word_guess", "who_am_i"]));
  });

  it("embeds a question from the locale pool on question days", () => {
    for (const challenge of dates(60).map((date) => dailyChallengeFor(date, "en"))) {
      if (challenge.mode === "word_guess") {
        expect(wordGuessQuestionsForLocale("en")).toContainEqual(challenge.question);
      }
      if (challenge.mode === "who_am_i") {
        expect(whoAmIQuestionsForLocale("en")).toContainEqual(challenge.question);
      }
    }
  });

  it("keeps the date it was built for", () => {
    expect(dailyChallengeFor("2026-08-05", "en").date).toBe("2026-08-05");
  });
});
