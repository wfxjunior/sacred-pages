import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import type { DifficultyLevel } from "@/lib/content/types";
import type { GameLocale } from "@/lib/games";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { journeyApi, journeyQueryKeys } from "./api";
import type { ConsistencySummary } from "./consistency";

// React bindings for the progress domain — the bridge the dashboards were
// missing: journeyApi owns the rules, these hooks own caching and the session.
// (Precedent for hooks living in lib: lib/auth/useCurrentUser.)

const EMPTY_SUMMARY: ConsistencySummary = {
  activeDays: 0,
  currentRun: 0,
  longestRun: 0,
  lastActiveDate: null,
  activeToday: false,
};

/** The reader's real consistency summary. Signed out → zeros, never mock data. */
export function useConsistency(): {
  summary: ConsistencySummary;
  loading: boolean;
  signedIn: boolean;
} {
  const user = useCurrentUser();
  const enabled = Boolean(user.userId) && isSupabaseConfigured();
  const query = useQuery({
    queryKey: journeyQueryKeys.consistency(user.userId ?? "anonymous"),
    enabled,
    staleTime: 60_000,
    queryFn: () => journeyApi.consistency(user.userId!),
  });
  return {
    summary: query.data ?? EMPTY_SUMMARY,
    loading: user.loading || (enabled && query.isLoading),
    signedIn: Boolean(user.userId),
  };
}

/** The last N local days with an active flag each — for week strips and the
 * progress heatmap. Oldest first. Signed out → all inactive. */
export function useConsistencyWindow(days: number): {
  window: { date: string; active: boolean }[];
  loading: boolean;
} {
  const user = useCurrentUser();
  const enabled = Boolean(user.userId) && isSupabaseConfigured();
  const query = useQuery({
    queryKey: [...journeyQueryKeys.consistency(user.userId ?? "anonymous"), "window", days],
    enabled,
    staleTime: 60_000,
    queryFn: () => journeyApi.consistencyWindow(user.userId!, days),
  });
  const fallback = useMemo(
    () => Array.from({ length: days }, () => ({ date: "", active: false })),
    [days],
  );
  return {
    window: query.data ?? fallback,
    loading: user.loading || (enabled && query.isLoading),
  };
}

/** Real completion counts for the progress tiles, from the durable
 * user_collection_progress rows the completion trigger maintains. */
export function useProgressStats(): {
  journeysCompleted: number;
  collectionsStarted: number;
  loading: boolean;
} {
  const user = useCurrentUser();
  const enabled = Boolean(user.userId) && isSupabaseConfigured();
  const query = useQuery({
    queryKey: journeyQueryKeys.collectionProgress(user.userId ?? "anonymous"),
    enabled,
    staleTime: 60_000,
    queryFn: () => journeyApi.collectionProgress(user.userId!),
  });
  const rows = query.data ?? [];
  return {
    journeysCompleted: rows.reduce((sum, row) => sum + row.journeys_completed, 0),
    collectionsStarted: rows.filter((row) => row.journeys_completed > 0).length,
    loading: user.loading || (enabled && query.isLoading),
  };
}

/** Per-collection completion (0..1) keyed by collection id — what lights up
 * the progress bar on collection cards. Empty when signed out. */
export function useCollectionProgressMap(): Map<string, number> {
  const user = useCurrentUser();
  const enabled = Boolean(user.userId) && isSupabaseConfigured();
  const query = useQuery({
    queryKey: journeyQueryKeys.collectionProgress(user.userId ?? "anonymous"),
    enabled,
    staleTime: 60_000,
    queryFn: () => journeyApi.collectionProgress(user.userId!),
  });
  return useMemo(() => {
    const map = new Map<string, number>();
    for (const row of query.data ?? []) {
      if (row.journeys_available > 0) {
        map.set(row.collection_id, Math.min(1, row.journeys_completed / row.journeys_available));
      }
    }
    return map;
  }, [query.data]);
}

/**
 * Records a finished Today journey as a real session so the completion
 * trigger can write the active day, durable progress and milestones.
 *
 * The Today screen shows scripture, devotional and puzzle together on one
 * spread, so the three required steps are marked complete at the moment the
 * reader finishes the puzzle. Fire-and-forget by design: recording must never
 * block or break the completion moment — failures are logged, not shown.
 */
export function useJourneyCompletionRecorder(): (input: {
  journeyId: string | null;
  collectionId?: string | null;
  languageCode: GameLocale;
  difficulty: DifficultyLevel;
  elapsedMs: number;
}) => void {
  const user = useCurrentUser();
  const queryClient = useQueryClient();

  return useCallback(
    (input) => {
      const userId = user.userId;
      if (!userId || !input.journeyId || !isSupabaseConfigured()) return;
      const journeyId = input.journeyId;

      void (async () => {
        try {
          const { state } = await journeyApi.startJourney({
            userId,
            journeyId,
            collectionId: input.collectionId ?? undefined,
            languageCode: input.languageCode,
            difficulty: input.difficulty,
          });
          if (state.session.status === "completed") return;

          for (const stepType of ["scripture", "devotional", "puzzle"] as const) {
            const done = state.stepStates.some((s) => s.type === stepType && s.completed);
            if (!done) {
              await journeyApi.completeStep({
                userId,
                sessionId: state.session.id,
                stepType,
              });
            }
          }
          await journeyApi.completeJourney({
            userId,
            sessionId: state.session.id,
            elapsedMs: Math.max(0, Math.round(input.elapsedMs)),
          });
        } catch (error) {
          // Never interrupt the celebration; the next completion tries again.
          console.error("[journey] completion recording failed", error);
        } finally {
          void queryClient.invalidateQueries({ queryKey: journeyQueryKeys.all(userId) });
        }
      })();
    },
    [user.userId, queryClient],
  );
}
