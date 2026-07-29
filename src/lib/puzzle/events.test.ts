import { describe, expect, it } from "vitest";
import { dedupeEvents, eventIdempotencyKey, puzzleEvents, type PuzzleEvent } from "./events";

const SESSION = "session-1";
const AT = "2026-07-29T10:00:00.000Z";

describe("eventIdempotencyKey", () => {
  it("is content-derived, so the same logical event always yields the same key", () => {
    expect(eventIdempotencyKey("word_found", SESSION, "GRACE")).toBe(
      eventIdempotencyKey("word_found", SESSION, "GRACE"),
    );
  });

  it("separates events by type, session and discriminator", () => {
    const keys = new Set([
      eventIdempotencyKey("word_found", SESSION, "GRACE"),
      eventIdempotencyKey("word_found", SESSION, "FAITH"),
      eventIdempotencyKey("word_found", "session-2", "GRACE"),
      eventIdempotencyKey("hint_used", SESSION, "GRACE"),
    ]);
    expect(keys.size).toBe(4);
  });

  it("omits an absent discriminator rather than leaving a trailing separator", () => {
    expect(eventIdempotencyKey("puzzle_started", SESSION)).toBe(`puzzle_started:${SESSION}`);
  });
});

describe("event constructors", () => {
  it("puzzle_started can only happen once per session", () => {
    const a = puzzleEvents.started(SESSION, "instance-1", AT);
    const b = puzzleEvents.started(SESSION, "instance-1", "2026-07-29T11:00:00.000Z");
    expect(a.idempotencyKey).toBe(b.idempotencyKey);
  });

  it("puzzle_completed can only happen once per session", () => {
    const payload = { elapsedMs: 1000, hintsUsed: 0, revealedSolution: false };
    const a = puzzleEvents.completed(SESSION, payload, AT);
    const b = puzzleEvents.completed(SESSION, { ...payload, elapsedMs: 2000 }, AT);
    // Even with different elapsed times, one session completes once.
    expect(a.idempotencyKey).toBe(b.idempotencyKey);
  });

  it("word_found keys on the word, so finding it twice is one event", () => {
    const a = puzzleEvents.wordFound(SESSION, "GRACE", { row: 0, col: 0 }, { row: 0, col: 4 }, AT);
    const b = puzzleEvents.wordFound(SESSION, "GRACE", { row: 2, col: 0 }, { row: 2, col: 4 }, AT);
    expect(a.idempotencyKey).toBe(b.idempotencyKey);
  });

  it("different words produce different events", () => {
    const a = puzzleEvents.wordFound(SESSION, "GRACE", { row: 0, col: 0 }, { row: 0, col: 4 }, AT);
    const b = puzzleEvents.wordFound(SESSION, "FAITH", { row: 0, col: 0 }, { row: 0, col: 4 }, AT);
    expect(a.idempotencyKey).not.toBe(b.idempotencyKey);
  });

  it("repeatable events are distinguished by an explicit discriminator", () => {
    expect(puzzleEvents.paused(SESSION, 1000, AT).idempotencyKey).not.toBe(
      puzzleEvents.paused(SESSION, 2000, AT).idempotencyKey,
    );
    expect(puzzleEvents.resumed(SESSION, 1, AT).idempotencyKey).not.toBe(
      puzzleEvents.resumed(SESSION, 2, AT).idempotencyKey,
    );
  });

  it("distinguishes hint kinds", () => {
    expect(puzzleEvents.hintUsed(SESSION, "first_letter", "GRACE", AT).idempotencyKey).not.toBe(
      puzzleEvents.hintUsed(SESSION, "reveal_word", "GRACE", AT).idempotencyKey,
    );
  });

  it("carries typed payloads", () => {
    const event = puzzleEvents.completed(
      SESSION,
      { elapsedMs: 5000, hintsUsed: 2, revealedSolution: true },
      AT,
    );
    expect(event.type).toBe("puzzle_completed");
    expect(event.payload.hintsUsed).toBe(2);
    expect(event.occurredAt).toBe(AT);
  });

  it("defaults occurredAt to now when not supplied", () => {
    const event = puzzleEvents.started(SESSION, "instance-1");
    expect(() => new Date(event.occurredAt).toISOString()).not.toThrow();
  });
});

describe("dedupeEvents", () => {
  it("collapses duplicates while preserving order", () => {
    const events: PuzzleEvent[] = [
      puzzleEvents.wordFound(SESSION, "GRACE", { row: 0, col: 0 }, { row: 0, col: 4 }, AT),
      puzzleEvents.wordFound(SESSION, "FAITH", { row: 1, col: 0 }, { row: 1, col: 4 }, AT),
      puzzleEvents.wordFound(SESSION, "GRACE", { row: 0, col: 0 }, { row: 0, col: 4 }, AT),
    ];
    const deduped = dedupeEvents(events);
    expect(deduped).toHaveLength(2);
    expect(deduped[0].payload).toMatchObject({ word: "GRACE" });
    expect(deduped[1].payload).toMatchObject({ word: "FAITH" });
  });

  it("keeps identical keys from different sessions", () => {
    const events: PuzzleEvent[] = [
      puzzleEvents.started("session-a", "i1", AT),
      puzzleEvents.started("session-b", "i1", AT),
    ];
    expect(dedupeEvents(events)).toHaveLength(2);
  });

  it("handles an empty batch", () => {
    expect(dedupeEvents([])).toEqual([]);
  });
});
