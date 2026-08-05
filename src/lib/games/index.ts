// Public surface of the shared game platform. Game domains (lib/puzzle,
// lib/word-guess, future modes) and UI import from here.

export {
  GAME_DIFFICULTIES,
  GAME_DIFFICULTY_LABEL_KEYS,
  compareGameDifficulty,
  isGameDifficulty,
  type GameDifficulty,
} from "./difficulty";
export {
  GAME_STATUSES,
  canTransitionGameStatus,
  isTerminalGameStatus,
  type GameStatus,
} from "./lifecycle";
export {
  GAME_MODES,
  type GameAnnouncement,
  type GameAvailability,
  type GameCompletionResult,
  type GameDefinition,
  type GameHintResult,
  type GameIconKey,
  type GameLocale,
  type GameMode,
  type GameSessionSummary,
} from "./types";
export { GAME_REGISTRY, getGameDefinition, listActiveGames, listGames } from "./registry";
export {
  noopGameAnalyticsSink,
  type GameAnalyticsEvent,
  type GameAnalyticsSink,
} from "./analytics.types";
export {
  allowAllGameEntitlements,
  type GameEntitlementGate,
  type GameProgressSnapshot,
  type GameProgressStore,
} from "./persistence.types";
