import { useEffect, useState } from "react";
import { isGameDifficulty, type GameDifficulty, type GameMode } from "./index";

// Remembers where the reader stood in a game route — difficulty and round
// cursor — so leaving for the journey and coming back resumes the same spot.
// Deliberately NOT exported from the platform barrel: lib/games stays
// React-free there; this hook is a UI-side convenience beside it, persisted
// per device (the GameProgressStore contract is the server-side upgrade path).

type StoredPosition = { difficulty?: unknown; cursor?: unknown };

export function useGamePosition(
  mode: GameMode,
  defaultDifficulty: GameDifficulty = "gentle",
): {
  difficulty: GameDifficulty;
  chooseDifficulty: (next: GameDifficulty) => void;
  cursor: number;
  setCursor: (updater: (current: number) => number) => void;
} {
  const key = `lumena:game-pos:${mode}`;
  const [difficulty, setDifficultyState] = useState<GameDifficulty>(defaultDifficulty);
  const [cursor, setCursorState] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  // Restore after hydration so SSR and the first client render agree.
  useEffect(() => {
    try {
      const raw = JSON.parse(window.localStorage.getItem(key) ?? "null") as StoredPosition | null;
      if (raw && isGameDifficulty(raw.difficulty)) setDifficultyState(raw.difficulty);
      if (raw && Number.isInteger(raw.cursor) && (raw.cursor as number) >= 0) {
        setCursorState(raw.cursor as number);
      }
    } catch {
      /* storage unavailable — the position simply is not restored */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify({ difficulty, cursor }));
    } catch {
      /* storage unavailable — nothing to persist */
    }
  }, [key, difficulty, cursor, hydrated]);

  return {
    difficulty,
    chooseDifficulty: (next) => {
      setDifficultyState(next);
      setCursorState(0);
    },
    cursor,
    setCursor: (updater) => setCursorState((current) => updater(current)),
  };
}
