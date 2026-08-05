// Shared game lifecycle. The vocabulary comes from Word Guess — the first mode
// to model its round explicitly — and generalizes to every planned mode:
//
//   not_started → in_progress → completed | failed | revealed
//
// "revealed" means the reader asked to see the solution; "failed" means the
// attempt limit ran out. A reset is NOT a transition: it discards the session
// and creates a fresh one (each engine's reset function already works this
// way), so terminal states deliberately have almost no outgoing edges.

export const GAME_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
  "revealed",
  "failed",
] as const;

export type GameStatus = (typeof GAME_STATUSES)[number];

/** No further play without a reset. Matches the input guards in Word Guess. */
export function isTerminalGameStatus(status: GameStatus): boolean {
  return status === "completed" || status === "revealed" || status === "failed";
}

// failed → revealed is the one terminal exception: showing the answer after
// the last attempt is disclosure, not play (the Word Guess failure panel
// offers exactly this).
const TRANSITIONS: Record<GameStatus, readonly GameStatus[]> = {
  not_started: ["in_progress", "revealed"],
  in_progress: ["completed", "revealed", "failed"],
  completed: [],
  revealed: [],
  failed: ["revealed"],
};

export function canTransitionGameStatus(from: GameStatus, to: GameStatus): boolean {
  return TRANSITIONS[from].includes(to);
}
