import { describe, expect, it } from "vitest";
import { DIFFICULTY_LEVELS } from "@/lib/content/types";
import type { WordGuessDifficulty, WordGuessStatus } from "@/lib/word-guess/types";
import {
  GAME_DIFFICULTIES,
  GAME_MODES,
  GAME_REGISTRY,
  GAME_STATUSES,
  canTransitionGameStatus,
  compareGameDifficulty,
  getGameDefinition,
  isGameDifficulty,
  isTerminalGameStatus,
  listActiveGames,
  listGames,
} from "./index";
import type { GameDifficulty, GameStatus } from "./index";

describe("game registry integrity", () => {
  it("registers every mode exactly once, in canonical order", () => {
    const listed = listGames().map((game) => game.id);
    expect(listed).toEqual([...GAME_MODES]);
    expect(new Set(listed).size).toBe(GAME_MODES.length);
  });

  it("keeps ids consistent between key and definition", () => {
    for (const mode of GAME_MODES) {
      expect(GAME_REGISTRY[mode].id).toBe(mode);
      expect(getGameDefinition(mode)).toBe(GAME_REGISTRY[mode]);
    }
  });

  it("has unique routes among the modes that define one", () => {
    const routes = listGames()
      .map((game) => game.route)
      .filter((route): route is string => route != null);
    expect(new Set(routes).size).toBe(routes.length);
  });

  it("gives every active mode a valid route, and only the shipped games are active", () => {
    const active = listActiveGames();
    expect(active.map((game) => game.id)).toEqual(["word_search", "word_guess", "who_am_i"]);
    for (const game of active) {
      expect(game.route).toMatch(/^\//);
    }
    expect(GAME_REGISTRY.word_search.route).toBe("/today");
    expect(GAME_REGISTRY.word_guess.route).toBe("/play/word-guess");
    expect(GAME_REGISTRY.who_am_i.route).toBe("/play/who-am-i");
  });

  it("marks all unshipped modes as coming_soon without routes", () => {
    const comingSoon = listGames().filter((game) => game.availability === "coming_soon");
    expect(comingSoon).toHaveLength(GAME_MODES.length - 3);
    for (const game of comingSoon) {
      expect(game.route).toBeNull();
    }
  });

  it("declares supported difficulties from the canonical set, never empty", () => {
    for (const game of listGames()) {
      expect(game.supportedDifficulties.length).toBeGreaterThan(0);
      for (const difficulty of game.supportedDifficulties) {
        expect(isGameDifficulty(difficulty)).toBe(true);
      }
    }
  });

  it("uses well-formed i18n keys for name and description", () => {
    for (const game of listGames()) {
      expect(game.nameKey).toBe(`games.${game.id}.name`);
      expect(game.descriptionKey).toBe(`games.${game.id}.description`);
    }
  });
});

describe("difficulty", () => {
  it("orders tiers gentle → expert", () => {
    expect(compareGameDifficulty("gentle", "expert")).toBeLessThan(0);
    expect(compareGameDifficulty("expert", "gentle")).toBeGreaterThan(0);
    expect(compareGameDifficulty("balanced", "balanced")).toBe(0);
  });

  it("guards unknown values", () => {
    expect(isGameDifficulty("gentle")).toBe(true);
    expect(isGameDifficulty("impossible")).toBe(false);
    expect(isGameDifficulty(undefined)).toBe(false);
  });

  it("stays the single source the content domain re-exports", () => {
    expect(DIFFICULTY_LEVELS).toBe(GAME_DIFFICULTIES);
  });
});

describe("lifecycle", () => {
  it("declares the five statuses once", () => {
    expect(GAME_STATUSES).toEqual([
      "not_started",
      "in_progress",
      "completed",
      "revealed",
      "failed",
    ]);
  });

  it("treats completed, revealed and failed as terminal", () => {
    expect(isTerminalGameStatus("completed")).toBe(true);
    expect(isTerminalGameStatus("revealed")).toBe(true);
    expect(isTerminalGameStatus("failed")).toBe(true);
    expect(isTerminalGameStatus("not_started")).toBe(false);
    expect(isTerminalGameStatus("in_progress")).toBe(false);
  });

  it("allows only the documented transitions", () => {
    expect(canTransitionGameStatus("not_started", "in_progress")).toBe(true);
    expect(canTransitionGameStatus("not_started", "revealed")).toBe(true);
    expect(canTransitionGameStatus("in_progress", "completed")).toBe(true);
    expect(canTransitionGameStatus("in_progress", "failed")).toBe(true);
    expect(canTransitionGameStatus("in_progress", "revealed")).toBe(true);
    expect(canTransitionGameStatus("failed", "revealed")).toBe(true);

    expect(canTransitionGameStatus("not_started", "completed")).toBe(false);
    expect(canTransitionGameStatus("not_started", "failed")).toBe(false);
    expect(canTransitionGameStatus("completed", "in_progress")).toBe(false);
    expect(canTransitionGameStatus("revealed", "in_progress")).toBe(false);
    expect(canTransitionGameStatus("failed", "in_progress")).toBe(false);
    expect(canTransitionGameStatus("completed", "revealed")).toBe(false);
  });
});

describe("shared-type anchoring", () => {
  it("keeps Word Guess speaking the platform vocabulary (compile-time check)", () => {
    // These assignments only compile while the aliases stay anchored to the
    // shared unions — drift breaks the build, not just this test.
    const difficulty: GameDifficulty = "gentle" satisfies WordGuessDifficulty;
    const status: GameStatus = "completed" satisfies WordGuessStatus;
    expect(difficulty).toBe("gentle");
    expect(status).toBe("completed");
  });
});
