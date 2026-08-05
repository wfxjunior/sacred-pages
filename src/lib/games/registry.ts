import { GAME_DIFFICULTIES } from "./difficulty";
import type { GameDefinition, GameMode } from "./types";
import { GAME_MODES } from "./types";

// The typed catalogue of every Scripture interaction mode, shipped or planned.
//
// Nothing in primary navigation reads this yet — there is no games library
// surface in the current UX, and coming-soon modes must not leak into the nav.
// When a games hub ships, it renders from this registry instead of hard-coding
// cards. Routes for unshipped modes stay null until their route file exists.

export const GAME_REGISTRY: Record<GameMode, GameDefinition> = {
  word_search: {
    id: "word_search",
    nameKey: "games.word_search.name",
    descriptionKey: "games.word_search.description",
    route: "/today",
    availability: "active",
    iconKey: "search",
    premium: false,
    supportedDifficulties: GAME_DIFFICULTIES,
  },
  word_guess: {
    id: "word_guess",
    nameKey: "games.word_guess.name",
    descriptionKey: "games.word_guess.description",
    route: "/play/word-guess",
    availability: "active",
    iconKey: "guess",
    premium: false,
    supportedDifficulties: GAME_DIFFICULTIES,
  },
  who_am_i: {
    id: "who_am_i",
    nameKey: "games.who_am_i.name",
    descriptionKey: "games.who_am_i.description",
    route: "/play/who-am-i",
    availability: "active",
    iconKey: "identity",
    premium: false,
    supportedDifficulties: GAME_DIFFICULTIES,
  },
  bible_quiz: {
    id: "bible_quiz",
    nameKey: "games.bible_quiz.name",
    descriptionKey: "games.bible_quiz.description",
    route: null,
    availability: "coming_soon",
    iconKey: "quiz",
    premium: false,
    supportedDifficulties: GAME_DIFFICULTIES,
  },
  finish_the_verse: {
    id: "finish_the_verse",
    nameKey: "games.finish_the_verse.name",
    descriptionKey: "games.finish_the_verse.description",
    route: null,
    availability: "coming_soon",
    iconKey: "verse",
    premium: false,
    supportedDifficulties: GAME_DIFFICULTIES,
  },
  unscramble: {
    id: "unscramble",
    nameKey: "games.unscramble.name",
    descriptionKey: "games.unscramble.description",
    route: null,
    availability: "coming_soon",
    iconKey: "shuffle",
    premium: false,
    supportedDifficulties: GAME_DIFFICULTIES,
  },
  verse_builder: {
    id: "verse_builder",
    nameKey: "games.verse_builder.name",
    descriptionKey: "games.verse_builder.description",
    route: null,
    availability: "coming_soon",
    iconKey: "builder",
    premium: false,
    supportedDifficulties: GAME_DIFFICULTIES,
  },
  timeline: {
    id: "timeline",
    nameKey: "games.timeline.name",
    descriptionKey: "games.timeline.description",
    route: null,
    availability: "coming_soon",
    iconKey: "timeline",
    premium: false,
    supportedDifficulties: GAME_DIFFICULTIES,
  },
  memory_match: {
    id: "memory_match",
    nameKey: "games.memory_match.name",
    descriptionKey: "games.memory_match.description",
    route: null,
    availability: "coming_soon",
    iconKey: "memory",
    premium: false,
    supportedDifficulties: GAME_DIFFICULTIES,
  },
  daily_challenge: {
    id: "daily_challenge",
    nameKey: "games.daily_challenge.name",
    descriptionKey: "games.daily_challenge.description",
    route: null,
    availability: "coming_soon",
    iconKey: "daily",
    premium: false,
    supportedDifficulties: GAME_DIFFICULTIES,
  },
};

export function getGameDefinition(mode: GameMode): GameDefinition {
  return GAME_REGISTRY[mode];
}

/** Every mode, in the canonical GAME_MODES order. */
export function listGames(): GameDefinition[] {
  return GAME_MODES.map((mode) => GAME_REGISTRY[mode]);
}

/** Modes with a shipped route — the only ones any navigation may surface. */
export function listActiveGames(): GameDefinition[] {
  return listGames().filter((game) => game.availability === "active");
}
