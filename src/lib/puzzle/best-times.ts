import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { authService } from "@/lib/auth/service";

// Personal completion times for a word search. Kept deliberately gentle: no
// leaderboards, no comparison with anyone else — just the reader's own record.
//
// Times are always written to localStorage so the prototype and signed-out
// readers keep their record, and mirrored to Supabase when there is a session.

const LOCAL_KEY = "lumena:ws:best-times";
// Puzzle keys are content-derived, so they carry no readable title. A small
// side registry remembers which journey each key belonged to, letting the
// profile group a reader's records per journey instead of one flat list.
const LABEL_KEY = "lumena:ws:puzzle-labels";

export type BestTimeEntry = {
  puzzleKey: string;
  bestTimeMs: number;
  lastTimeMs: number | null;
  completions: number;
  journey?: string;
};

export type JourneyBestTime = {
  journey: string;
  bestTimeMs: number;
  lastTimeMs: number | null;
  completions: number;
  variants: number;
};

type LocalMap = Record<string, { bestTimeMs: number; lastTimeMs: number | null; completions: number }>;

function readLabels(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(window.localStorage.getItem(LABEL_KEY) ?? "null");
    return raw && typeof raw === "object" ? (raw as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeLabel(puzzleKey: string, journey: string) {
  try {
    const labels = readLabels();
    labels[puzzleKey] = journey;
    window.localStorage.setItem(LABEL_KEY, JSON.stringify(labels));
  } catch {
    /* storage unavailable — the record simply stays unlabelled */
  }
}

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

/** The locally saved best time for one puzzle, if any. */
export function getLocalBest(puzzleKey: string): number | null {
  const entry = readLocal()[puzzleKey];
  return entry ? entry.bestTimeMs : null;
}

/** Records a completion. Returns the reader's best time for that puzzle. */
export async function recordCompletion(
  puzzleKey: string,
  elapsedMs: number,
  journey?: string,
): Promise<number> {
  if (!puzzleKey || !Number.isFinite(elapsedMs) || elapsedMs <= 0) return 0;
  if (journey) writeLabel(puzzleKey, journey);
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
      const labels = readLabels();
      const merged = new Map<string, BestTimeEntry>();
      Object.entries(local).forEach(([puzzleKey, value]) =>
        merged.set(puzzleKey, { puzzleKey, ...value, ...(labels[puzzleKey] ? { journey: labels[puzzleKey] } : {}) }),
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
                ...(labels[key] ? { journey: labels[key] } : {}),
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
                      ...(current.journey ?? remote.journey
                        ? { journey: current.journey ?? remote.journey! }
                        : {}),
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

/**
 * The same records, folded per journey: one row per theme with its own best
 * time and completion count, so progress reads clearly instead of mixed
 * together. Different grid sizes of one journey count as variants of that row.
 */
export function groupByJourney(entries: BestTimeEntry[], fallbackLabel: string): JourneyBestTime[] {
  const groups = new Map<string, JourneyBestTime>();
  entries.forEach((entry) => {
    const journey = entry.journey ?? fallbackLabel;
    const current = groups.get(journey);
    if (!current) {
      groups.set(journey, {
        journey,
        bestTimeMs: entry.bestTimeMs,
        lastTimeMs: entry.lastTimeMs,
        completions: entry.completions,
        variants: 1,
      });
      return;
    }
    current.bestTimeMs = Math.min(current.bestTimeMs, entry.bestTimeMs);
    current.lastTimeMs = current.lastTimeMs ?? entry.lastTimeMs;
    current.completions += entry.completions;
    current.variants += 1;
  });
  return [...groups.values()].sort((a, b) => b.completions - a.completions || a.bestTimeMs - b.bestTimeMs);
}

/** mm:ss for a duration in milliseconds. */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
