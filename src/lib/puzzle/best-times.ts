import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { authService } from "@/lib/auth/service";

// Personal completion times for a word search. Kept deliberately gentle: no
// leaderboards, no comparison with anyone else — just the reader's own record.
//
// Times are always written to localStorage so the prototype and signed-out
// readers keep their record, and mirrored to Supabase when there is a session.

const LOCAL_KEY = "lumena:ws:best-times";

export type BestTimeEntry = {
  puzzleKey: string;
  bestTimeMs: number;
  lastTimeMs: number | null;
  completions: number;
};

type LocalMap = Record<string, { bestTimeMs: number; lastTimeMs: number | null; completions: number }>;

function readLocal(): LocalMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(window.localStorage.getItem(LOCAL_KEY) ?? "null");
    return raw && typeof raw === "object" ? (raw as LocalMap) : {};
  } catch {
    return {};
  }
}

function writeLocal(map: LocalMap) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
  } catch {
    /* storage unavailable — the record simply is not kept */
  }
}

/** Records a completion. Returns the reader's best time for that puzzle. */
export async function recordCompletion(puzzleKey: string, elapsedMs: number): Promise<number> {
  if (!puzzleKey || !Number.isFinite(elapsedMs) || elapsedMs <= 0) return 0;
  const map = readLocal();
  const previous = map[puzzleKey];
  const best = previous ? Math.min(previous.bestTimeMs, elapsedMs) : elapsedMs;
  map[puzzleKey] = {
    bestTimeMs: best,
    lastTimeMs: elapsedMs,
    completions: (previous?.completions ?? 0) + 1,
  };
  writeLocal(map);

  if (isSupabaseConfigured()) {
    try {
      const session = await authService.getSession();
      const userId = session?.user?.id;
      if (userId) {
        await getSupabaseClient()
          .from("word_search_best_times")
          .upsert(
            {
              user_id: userId,
              puzzle_key: puzzleKey,
              best_time_ms: best,
              last_time_ms: elapsedMs,
              completions: map[puzzleKey]!.completions,
            },
            { onConflict: "user_id,puzzle_key" },
          );
      }
    } catch {
      /* offline or signed out — the local record still stands */
    }
  }

  return best;
}

/** The reader's saved times, merged from the account when signed in. */
export function useBestTimes(): { loading: boolean; entries: BestTimeEntry[]; refresh: () => void } {
  const [entries, setEntries] = useState<BestTimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const local = readLocal();
      const merged = new Map<string, BestTimeEntry>();
      Object.entries(local).forEach(([puzzleKey, value]) =>
        merged.set(puzzleKey, { puzzleKey, ...value }),
      );

      if (isSupabaseConfigured()) {
        try {
          const session = await authService.getSession();
          const userId = session?.user?.id;
          if (userId) {
            const { data } = await getSupabaseClient()
              .from("word_search_best_times")
              .select("puzzle_key, best_time_ms, last_time_ms, completions")
              .eq("user_id", userId);
            (data ?? []).forEach((row: Record<string, unknown>) => {
              const key = String(row.puzzle_key);
              const remote: BestTimeEntry = {
                puzzleKey: key,
                bestTimeMs: Number(row.best_time_ms),
                lastTimeMs: row.last_time_ms == null ? null : Number(row.last_time_ms),
                completions: Number(row.completions ?? 1),
              };
              const current = merged.get(key);
              merged.set(
                key,
                current
                  ? {
                      puzzleKey: key,
                      bestTimeMs: Math.min(current.bestTimeMs, remote.bestTimeMs),
                      lastTimeMs: current.lastTimeMs ?? remote.lastTimeMs,
                      completions: Math.max(current.completions, remote.completions),
                    }
                  : remote,
              );
            });
          }
        } catch {
          /* keep the local view */
        }
      }

      if (cancelled) return;
      setEntries([...merged.values()].sort((a, b) => a.bestTimeMs - b.bestTimeMs));
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  return { loading, entries, refresh };
}

/** mm:ss for a duration in milliseconds. */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
