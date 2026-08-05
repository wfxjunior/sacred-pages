// Analytics event contract for game modes — types only, no transport.
//
// No analytics provider is wired today (ANALYTICS_WRITE_KEY is a Phase 10
// placeholder in .env.example). Modes can already speak this vocabulary
// through a sink; the no-op sink keeps that a zero-behavior change until a
// provider ships.

import type { GameDifficulty } from "./difficulty";
import type { GameLocale, GameMode, GameSessionSummary } from "./types";

interface GameAnalyticsBase {
  mode: GameMode;
  difficulty: GameDifficulty;
  locale: GameLocale;
  /** Stable per-round identifier (e.g. question id, puzzle storage key). */
  roundId: string;
}

export type GameAnalyticsEvent =
  | ({ type: "game_started" } & GameAnalyticsBase)
  | ({ type: "attempt_submitted"; correct: boolean; attemptNumber: number } & GameAnalyticsBase)
  | ({ type: "hint_used" } & GameAnalyticsBase)
  | ({ type: "letter_revealed"; totalRevealed: number } & GameAnalyticsBase)
  | ({ type: "game_completed"; summary: GameSessionSummary } & GameAnalyticsBase)
  | ({ type: "game_failed"; summary: GameSessionSummary } & GameAnalyticsBase)
  | ({ type: "game_revealed"; summary: GameSessionSummary } & GameAnalyticsBase)
  | ({ type: "game_reset" } & GameAnalyticsBase);

export interface GameAnalyticsSink {
  record(event: GameAnalyticsEvent): void;
}

/** The default sink until an analytics provider exists. */
export const noopGameAnalyticsSink: GameAnalyticsSink = {
  record() {
    // Deliberately empty — see module comment.
  },
};
