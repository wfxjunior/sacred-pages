// Future persistence and entitlement contracts — types only, no backend.
//
// Word Search keeps progress in localStorage with its own keys; nothing is
// migrated here. When server-side progress ships (per the roadmap's Supabase
// phase), stores implement GameProgressStore against these shapes and each
// game serializes its own state into `payload` — the platform never inspects
// game internals.

import type { GameDifficulty } from "./difficulty";
import type { GameStatus } from "./lifecycle";
import type { GameMode } from "./types";

export interface GameProgressSnapshot {
  mode: GameMode;
  difficulty: GameDifficulty;
  /** Stable per-round identifier (question id, puzzle storage key…). */
  roundId: string;
  status: GameStatus;
  /** Game-specific serialized state, owned entirely by that game's domain. */
  payload: unknown;
  /** ISO timestamp, written by the store. */
  updatedAt: string;
}

export interface GameProgressStore {
  load(mode: GameMode, roundId: string): Promise<GameProgressSnapshot | null>;
  save(snapshot: GameProgressSnapshot): Promise<void>;
  clear(mode: GameMode, roundId: string): Promise<void>;
}

/** Premium entitlement hook. Everything is free today; when billing ships
 * (Stripe, Phase 5) a real gate replaces the default without touching games. */
export interface GameEntitlementGate {
  canPlay(mode: GameMode): boolean;
}

export const allowAllGameEntitlements: GameEntitlementGate = {
  canPlay() {
    return true;
  },
};
