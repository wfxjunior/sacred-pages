import { useEffect, useMemo, useState } from "react";
import { DEFAULT_DISPLAY_DURATION_MS, DEFAULT_TYPING_SPEED_MS } from "./livingJournalData";
import type { JournalEntryPhase, LivingJournalEntry } from "./livingJournal.types";

/** How long "<Name> is writing…" rests before the first character appears. */
const INTRO_MS = 1150;

/** Beat between the last character and the completion mark. */
const SETTLE_MS = 620;

/**
 * How long to wait after typing a given character.
 *
 * Punctuation gets a real pause because that is where a person actually stops
 * to think, and it is what makes the effect read as writing rather than as a
 * teleprinter. Entirely deterministic — a seeded or random jitter would differ
 * between server and client, and randomness here buys nothing a rhythm cannot.
 */
function delayAfterCharacter(character: string, index: number, base: number): number {
  if (character === "." || character === "!" || character === "?") return base * 9;
  if (character === "," || character === ";" || character === ":") return base * 5;
  if (character === " ") return base * 1.6;

  // One slightly longer breath partway through a sentence. Never a typo, never
  // a correction — an occasional hesitation, which stays tasteful.
  if (index > 0 && index % 37 === 0) return base * 4;

  return base;
}

/**
 * Deterministic shuffle.
 *
 * Seeded rather than Math.random so a given seed always produces the same
 * order, which keeps this testable. It runs after mount, never during render,
 * so it cannot cause a hydration mismatch.
 */
function shuffledIndices(length: number, seed: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  let state = seed >>> 0;

  for (let i = length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return indices;
}

export type LivingJournalSequence = {
  readonly entry: LivingJournalEntry;
  readonly phase: JournalEntryPhase;
  /** The portion of the message written so far. Full text when reduced-motion. */
  readonly typedText: string;
  /** True once the whole message is on the page. */
  readonly isComplete: boolean;
};

/**
 * Drives the journal typing sequence.
 *
 * Exactly one timer exists at any moment: the effect schedules a single step
 * and clears it on every dependency change. That is what makes it impossible
 * for two typing loops to run at once, which is otherwise the classic failure
 * of this kind of animation when a component re-mounts or scrolls in twice.
 *
 * `active` should be false when the section is off-screen or the tab is in the
 * background. Because progress lives in state and the effect simply stops
 * scheduling, pausing and resuming are free — no elapsed-time bookkeeping.
 */
export function useLivingJournalSequence(input: {
  entries: readonly LivingJournalEntry[];
  active: boolean;
  reducedMotion: boolean;
  /** Seed for the entry order. Fixed by default so tests are deterministic. */
  seed?: number;
}): LivingJournalSequence | null {
  const { entries, active, reducedMotion } = input;
  const seed = input.seed ?? 20260729;

  const [order, setOrder] = useState<number[]>(() => entries.map((_, i) => i));
  const [position, setPosition] = useState(0);
  const [phase, setPhase] = useState<JournalEntryPhase>("intro");
  const [charCount, setCharCount] = useState(0);

  // Randomize after mount. The section is below the fold, so this settles long
  // before anyone sees it — and doing it here rather than in a state initializer
  // keeps the server and first client render identical.
  useEffect(() => {
    if (entries.length > 1) setOrder(shuffledIndices(entries.length, seed));
  }, [entries.length, seed]);

  const entry = useMemo(() => {
    if (entries.length === 0) return null;
    const index = order[position % order.length] ?? 0;
    return entries[index] ?? entries[0];
  }, [entries, order, position]);

  const message = entry?.message ?? "";
  const typingSpeed = entry?.typingSpeed ?? DEFAULT_TYPING_SPEED_MS;
  const displayDuration = entry?.displayDuration ?? DEFAULT_DISPLAY_DURATION_MS;

  useEffect(() => {
    if (!entry || !active) return;

    // Reduced motion: the entry is simply present, then replaced. No cursor, no
    // character animation — but the reader still sees every entry in turn, so
    // the section keeps its meaning rather than freezing on one card.
    if (reducedMotion) {
      const timer = setTimeout(() => {
        setPosition((p) => p + 1);
      }, displayDuration + INTRO_MS);
      return () => clearTimeout(timer);
    }

    if (phase === "intro") {
      const timer = setTimeout(() => setPhase("writing"), INTRO_MS);
      return () => clearTimeout(timer);
    }

    if (phase === "writing") {
      if (charCount >= message.length) {
        const timer = setTimeout(() => setPhase("complete"), SETTLE_MS);
        return () => clearTimeout(timer);
      }

      const delay = delayAfterCharacter(message[charCount] ?? "", charCount, typingSpeed);
      const timer = setTimeout(() => setCharCount((c) => c + 1), delay);
      return () => clearTimeout(timer);
    }

    // phase === "complete"
    const timer = setTimeout(() => setPosition((p) => p + 1), displayDuration);
    return () => clearTimeout(timer);
  }, [entry, active, reducedMotion, phase, charCount, message, typingSpeed, displayDuration]);

  // Reset the per-entry animation whenever the entry changes.
  useEffect(() => {
    setPhase("intro");
    setCharCount(0);
  }, [position]);

  if (!entry) return null;

  const typedText = reducedMotion ? message : message.slice(0, charCount);

  return {
    entry,
    phase: reducedMotion ? "complete" : phase,
    typedText,
    isComplete: reducedMotion || phase === "complete",
  };
}

export const __testing = { delayAfterCharacter, shuffledIndices, INTRO_MS, SETTLE_MS };
