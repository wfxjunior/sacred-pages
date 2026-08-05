// Shared contracts for Scripture interaction modes.
//
// These types centralize what every game has in common — identity, difficulty,
// lifecycle, attempts, hints, completion — while each game keeps its own
// domain engine (lib/puzzle for Word Search, lib/word-guess for Word Guess).
// Nothing here is a generic game engine, and nothing here imports React.

import type { GameDifficulty } from "./difficulty";
import type { GameStatus } from "./lifecycle";

/** Mirrors the UI's Locale union without importing the React-bound i18n module. */
export type GameLocale = "en" | "pt" | "es";

export const GAME_MODES = [
  "word_search",
  "word_guess",
  "who_am_i",
  "bible_quiz",
  "finish_the_verse",
  "unscramble",
  "verse_builder",
  "timeline",
  "memory_match",
  "daily_challenge",
] as const;

export type GameMode = (typeof GAME_MODES)[number];

export type GameAvailability = "active" | "coming_soon" | "hidden";

/** Semantic icon slots — the UI layer maps them to actual glyphs when a games
 * library ships, so the registry never imports an icon package. */
export type GameIconKey =
  | "search"
  | "guess"
  | "identity"
  | "quiz"
  | "verse"
  | "shuffle"
  | "builder"
  | "timeline"
  | "memory"
  | "daily";

/** One registry entry. Name and description are i18n keys, not display text —
 * every surface of this app is localized and the registry must not regress that. */
export interface GameDefinition {
  id: GameMode;
  nameKey: string;
  descriptionKey: string;
  /** Router path; null until the mode ships a route. Active modes must have one. */
  route: string | null;
  availability: GameAvailability;
  iconKey: GameIconKey;
  /** Premium gating flag — consumed by GameEntitlementGate when billing ships. */
  premium: boolean;
  supportedDifficulties: readonly GameDifficulty[];
}

/** The quiet facts of one play session, as completion screens present them. */
export interface GameSessionSummary {
  mode: GameMode;
  difficulty: GameDifficulty;
  status: GameStatus;
  attemptsUsed: number;
  hintsUsed: number;
  lettersRevealed: number;
  /** Wall-clock play time; null when the mode does not time itself. */
  durationMs: number | null;
}

/** How a session ended. `score` is a scoring hook — null until a scoring
 * system exists; no mode computes points today. */
export interface GameCompletionResult {
  summary: GameSessionSummary;
  outcome: Extract<GameStatus, "completed" | "revealed" | "failed">;
  score: number | null;
}

/** Outcome of asking for a hint. */
export interface GameHintResult {
  granted: boolean;
  hintsUsed: number;
}

/** A screen-reader announcement, expressed as an i18n key so the domain never
 * carries display text. The UI resolves it through t() into one polite
 * aria-live region — the pattern Word Search and Word Guess already follow. */
export interface GameAnnouncement {
  kind: "status" | "progress" | "hint" | "success" | "error";
  messageKey: string;
}
