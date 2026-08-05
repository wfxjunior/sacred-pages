// Canonical difficulty vocabulary for every Scripture interaction mode.
//
// This is THE source of the four tiers. lib/content re-exports it for the
// database-facing content domain, and lib/word-guess aliases it — one union,
// declared once. The i18n labels already exist as the diff.* keys; games reuse
// them instead of introducing parallel label sets.

export const GAME_DIFFICULTIES = ["gentle", "balanced", "challenging", "expert"] as const;

export type GameDifficulty = (typeof GAME_DIFFICULTIES)[number];

export function isGameDifficulty(value: unknown): value is GameDifficulty {
  return (GAME_DIFFICULTIES as readonly unknown[]).includes(value);
}

/** Tier order: gentle < balanced < challenging < expert. */
export function compareGameDifficulty(a: GameDifficulty, b: GameDifficulty): number {
  return GAME_DIFFICULTIES.indexOf(a) - GAME_DIFFICULTIES.indexOf(b);
}

/** Existing i18n label keys — the games layer adds no parallel labels. */
export const GAME_DIFFICULTY_LABEL_KEYS: Record<GameDifficulty, string> = {
  gentle: "diff.gentle",
  balanced: "diff.balanced",
  challenging: "diff.challenging",
  expert: "diff.expert",
};
