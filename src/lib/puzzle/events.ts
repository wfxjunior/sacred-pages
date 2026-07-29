import type { Coordinate, NormalizedWord } from "./grid";

// Typed, idempotent puzzle events.
//
// Idempotency is structural: every event carries a key derived from its own
// content, and the database has a unique constraint on (session_id,
// idempotency_key). A retried request, a double-tap, or an offline queue
// flushing twice all collapse to a single row — no counters double, no
// milestone fires twice.

export const PUZZLE_EVENT_TYPES = [
  "puzzle_started",
  "puzzle_paused",
  "puzzle_resumed",
  "puzzle_completed",
  "word_found",
  "hint_used",
  "puzzle_reset",
  "puzzle_regenerated",
] as const;

export type PuzzleEventType = (typeof PUZZLE_EVENT_TYPES)[number];

type BaseEvent<T extends PuzzleEventType, P> = {
  readonly type: T;
  readonly sessionId: string;
  readonly payload: P;
  readonly idempotencyKey: string;
  readonly occurredAt: string;
};

export type PuzzleStartedEvent = BaseEvent<"puzzle_started", { puzzleInstanceId: string }>;
export type PuzzlePausedEvent = BaseEvent<"puzzle_paused", { elapsedMs: number }>;
export type PuzzleResumedEvent = BaseEvent<"puzzle_resumed", Record<string, never>>;
export type PuzzleCompletedEvent = BaseEvent<
  "puzzle_completed",
  { elapsedMs: number; hintsUsed: number; revealedSolution: boolean }
>;
export type WordFoundEvent = BaseEvent<
  "word_found",
  { word: NormalizedWord; start: Coordinate; end: Coordinate }
>;
export type HintUsedEvent = BaseEvent<
  "hint_used",
  { kind: "first_letter" | "direction" | "reveal_word" | "full_solution"; word?: NormalizedWord }
>;
export type PuzzleResetEvent = BaseEvent<"puzzle_reset", Record<string, never>>;
export type PuzzleRegeneratedEvent = BaseEvent<
  "puzzle_regenerated",
  { previousInstanceId: string; newInstanceId: string }
>;

export type PuzzleEvent =
  | PuzzleStartedEvent
  | PuzzlePausedEvent
  | PuzzleResumedEvent
  | PuzzleCompletedEvent
  | WordFoundEvent
  | HintUsedEvent
  | PuzzleResetEvent
  | PuzzleRegeneratedEvent;

// ---------------------------------------------------------------------------
// Idempotency keys
// ---------------------------------------------------------------------------

/**
 * Builds a key from the parts that make an event unique.
 *
 * Content-derived, not random: two independent attempts to record "the user
 * found GRACE in this session" must produce the SAME key, otherwise
 * deduplication cannot work. That is why `word_found` keys on the word rather
 * than on a timestamp.
 */
export function eventIdempotencyKey(
  type: PuzzleEventType,
  sessionId: string,
  discriminator?: string,
): string {
  return [type, sessionId, discriminator].filter(Boolean).join(":");
}

// ---------------------------------------------------------------------------
// Constructors — the only sanctioned way to build an event
// ---------------------------------------------------------------------------

function now(occurredAt?: string): string {
  return occurredAt ?? new Date().toISOString();
}

export const puzzleEvents = {
  started(sessionId: string, puzzleInstanceId: string, occurredAt?: string): PuzzleStartedEvent {
    return {
      type: "puzzle_started",
      sessionId,
      payload: { puzzleInstanceId },
      // Once per session, by construction.
      idempotencyKey: eventIdempotencyKey("puzzle_started", sessionId),
      occurredAt: now(occurredAt),
    };
  },

  paused(sessionId: string, elapsedMs: number, occurredAt?: string): PuzzlePausedEvent {
    return {
      type: "puzzle_paused",
      sessionId,
      payload: { elapsedMs },
      // A session may pause repeatedly, so the elapsed time distinguishes them.
      idempotencyKey: eventIdempotencyKey("puzzle_paused", sessionId, String(elapsedMs)),
      occurredAt: now(occurredAt),
    };
  },

  resumed(sessionId: string, sequence: number, occurredAt?: string): PuzzleResumedEvent {
    return {
      type: "puzzle_resumed",
      sessionId,
      payload: {},
      idempotencyKey: eventIdempotencyKey("puzzle_resumed", sessionId, String(sequence)),
      occurredAt: now(occurredAt),
    };
  },

  completed(
    sessionId: string,
    input: { elapsedMs: number; hintsUsed: number; revealedSolution: boolean },
    occurredAt?: string,
  ): PuzzleCompletedEvent {
    return {
      type: "puzzle_completed",
      sessionId,
      payload: input,
      // A session completes exactly once — no discriminator, so a duplicate
      // completion can never be recorded.
      idempotencyKey: eventIdempotencyKey("puzzle_completed", sessionId),
      occurredAt: now(occurredAt),
    };
  },

  wordFound(
    sessionId: string,
    word: NormalizedWord,
    start: Coordinate,
    end: Coordinate,
    occurredAt?: string,
  ): WordFoundEvent {
    return {
      type: "word_found",
      sessionId,
      payload: { word, start, end },
      // Keyed on the word: finding GRACE twice records one event.
      idempotencyKey: eventIdempotencyKey("word_found", sessionId, word),
      occurredAt: now(occurredAt),
    };
  },

  hintUsed(
    sessionId: string,
    kind: HintUsedEvent["payload"]["kind"],
    word?: NormalizedWord,
    occurredAt?: string,
  ): HintUsedEvent {
    return {
      type: "hint_used",
      sessionId,
      payload: { kind, word },
      idempotencyKey: eventIdempotencyKey(
        "hint_used",
        sessionId,
        [kind, word].filter(Boolean).join("-"),
      ),
      occurredAt: now(occurredAt),
    };
  },

  reset(sessionId: string, sequence: number, occurredAt?: string): PuzzleResetEvent {
    return {
      type: "puzzle_reset",
      sessionId,
      payload: {},
      idempotencyKey: eventIdempotencyKey("puzzle_reset", sessionId, String(sequence)),
      occurredAt: now(occurredAt),
    };
  },

  regenerated(
    sessionId: string,
    previousInstanceId: string,
    newInstanceId: string,
    occurredAt?: string,
  ): PuzzleRegeneratedEvent {
    return {
      type: "puzzle_regenerated",
      sessionId,
      payload: { previousInstanceId, newInstanceId },
      idempotencyKey: eventIdempotencyKey("puzzle_regenerated", sessionId, newInstanceId),
      occurredAt: now(occurredAt),
    };
  },
};

/**
 * Removes events that share an idempotency key, keeping the first occurrence.
 * Used when flushing a locally queued batch before it reaches the database.
 */
export function dedupeEvents(events: readonly PuzzleEvent[]): PuzzleEvent[] {
  const seen = new Set<string>();
  const result: PuzzleEvent[] = [];
  for (const event of events) {
    const key = `${event.sessionId}:${event.idempotencyKey}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(event);
  }
  return result;
}
