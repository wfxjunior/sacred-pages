import { contentErrors } from "@/lib/content/errors";
import type { DifficultyLevel } from "@/lib/content/types";
import { normalizeWord } from "@/lib/content/normalize";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ENGINE_VERSION } from "./engine";
import type { PuzzleWord } from "./grid";
import {
  puzzleInstanceService,
  puzzleSessionService,
  puzzleTemplateService,
  type ResolvedPuzzle,
} from "./services";
import { puzzleRepository } from "./repository";
import type { PuzzleSessionRow, PuzzleStatisticsRow } from "./rows";

// The puzzle API — the surface React components consume.
//
// Every function here is typed end to end and free of database details. Where
// generation is required the call reaches the engine, which is not implemented
// until Phase 4; those paths are marked and fail loudly rather than silently.

export type LoadedPuzzle = {
  readonly puzzle: ResolvedPuzzle;
  readonly words: readonly PuzzleWord[];
  readonly session: PuzzleSessionRow | null;
  readonly foundWords: readonly string[];
};

/**
 * Loads the published word list for a journey in one locale.
 *
 * The normalized form is recomputed here rather than trusted from the row, so a
 * hand-edited database value cannot desynchronise matching from display.
 */
export async function loadPuzzleWords(
  journeyId: string,
  languageCode: string,
): Promise<PuzzleWord[]> {
  const { data, error } = await getSupabaseClient()
    .from("journey_word_translations")
    .select("journey_word_id, display_value, normalized_value, explanation")
    .eq("journey_id", journeyId)
    .eq("language_code", languageCode)
    .eq("status", "published");

  if (error) throw contentErrors.validationFailed([error.message]);

  return (
    (data ?? []) as {
      journey_word_id: string;
      display_value: string;
      normalized_value: string;
      explanation: string | null;
    }[]
  ).map((row) => ({
    id: row.journey_word_id,
    display: row.display_value,
    normalized: normalizeWord(row.display_value),
    explanation: row.explanation,
  }));
}

export const puzzleApi = {
  /**
   * Generates (or fetches) the puzzle for a journey at a difficulty.
   * Requires the Phase 4 engine when no instance exists yet.
   */
  async generatePuzzle(input: {
    journeyId: string;
    languageCode: string;
    difficulty: DifficultyLevel;
    userId?: string | null;
    date?: string | null;
  }): Promise<ResolvedPuzzle> {
    const template = await puzzleTemplateService.getActive({
      journeyId: input.journeyId,
      languageCode: input.languageCode,
      difficulty: input.difficulty,
    });

    if (!template) {
      throw contentErrors.notFound(
        `Active puzzle template for ${input.languageCode}/${input.difficulty}`,
        input.journeyId,
      );
    }

    const words = await loadPuzzleWords(input.journeyId, input.languageCode);
    if (words.length === 0) {
      throw contentErrors.invalidWordList([
        `No published words for this journey in ${input.languageCode}`,
      ]);
    }

    return puzzleInstanceService.getOrGenerate({
      template,
      words,
      userId: input.userId,
      date: input.date,
    });
  },

  /** Loads an existing puzzle plus the caller's session and progress. */
  async loadPuzzle(input: {
    puzzleInstanceId: string;
    journeyId: string;
    languageCode: string;
    userId?: string | null;
  }): Promise<LoadedPuzzle> {
    const puzzle = await puzzleInstanceService.getById(input.puzzleInstanceId);
    if (!puzzle) throw contentErrors.notFound("Puzzle", input.puzzleInstanceId);

    const words = await loadPuzzleWords(input.journeyId, input.languageCode);

    if (!input.userId) {
      return { puzzle, words, session: null, foundWords: [] };
    }

    const [session, progress] = await Promise.all([
      puzzleRepository.getActiveSession(input.userId, input.puzzleInstanceId),
      puzzleSessionService.getProgress(input.userId, input.puzzleInstanceId),
    ]);

    return { puzzle, words, session, foundWords: progress?.found_words ?? [] };
  },

  /** Starts or resumes the caller's session for a puzzle. */
  async resumePuzzle(input: {
    userId: string;
    puzzleInstanceId: string;
    journeyId: string;
  }): Promise<{ session: PuzzleSessionRow; resumed: boolean }> {
    return puzzleSessionService.startOrResume(input);
  },

  /**
   * Persists found words and completion.
   *
   * `completionPercent` is recomputed from the word list rather than accepted
   * from the caller — a client cannot declare itself finished.
   */
  async saveProgress(input: {
    userId: string;
    puzzleInstanceId: string;
    foundWords: readonly string[];
    targetWords: readonly string[];
  }): Promise<void> {
    const percent = puzzleSessionService.computeCompletion(input.foundWords, input.targetWords);
    await puzzleSessionService.saveProgress(input.userId, {
      puzzleInstanceId: input.puzzleInstanceId,
      foundWords: [...input.foundWords],
      completionPercent: percent,
    });
  },

  async completePuzzle(input: {
    userId: string;
    sessionId: string;
    elapsedMs: number;
    hintsUsed: number;
    revealedSolution: boolean;
  }): Promise<PuzzleSessionRow> {
    return puzzleSessionService.complete(input.userId, {
      sessionId: input.sessionId,
      elapsedMs: input.elapsedMs,
      hintsUsed: input.hintsUsed,
      revealedSolution: input.revealedSolution,
    });
  },

  async getStatistics(puzzleInstanceId: string): Promise<PuzzleStatisticsRow | null> {
    return puzzleRepository.getStatistics(puzzleInstanceId);
  },

  /** Engine build the client is running against — surfaced for diagnostics. */
  engineVersion(): string {
    return ENGINE_VERSION;
  },
};
