import { seededRandomFromString } from "@/lib/games";

// What the reader meets on a day the calendar left unassigned.
//
// The calendar is curated by hand and routinely runs out — and the old
// fallback served the most recent assignment again, so every uncurated day
// repeated the previous puzzle. This picks instead: deterministically by
// date (every reader sees the same journey, today's choice never changes
// under refresh), avoiding whatever the calendar used recently, preferring
// what has gone unused longest.

export interface RotationCandidate {
  id: string;
  /** Stable tiebreaker so ordering never depends on query order. */
  slug: string;
}

export interface RotationHistoryEntry {
  journeyId: string;
  /** ISO date (yyyy-mm-dd) the journey was served. */
  date: string;
}

/**
 * Chooses the journey for `isoDate`. Journeys served within the exclusion
 * window (the last `pool - 1` days, capped at 14) are skipped unless that
 * would empty the pool entirely; among the remainder the least-recently-used
 * come first, and the date seed picks among the freshest.
 */
export function chooseRotationJourney(
  isoDate: string,
  pool: readonly RotationCandidate[],
  history: readonly RotationHistoryEntry[],
): RotationCandidate | null {
  if (pool.length === 0) return null;
  if (pool.length === 1) return pool[0]!;

  const windowDays = Math.min(pool.length - 1, 14);
  const cutoff = shiftIsoDate(isoDate, -windowDays);
  const lastServed = new Map<string, string>();
  for (const entry of history) {
    const seen = lastServed.get(entry.journeyId);
    if (!seen || entry.date > seen) lastServed.set(entry.journeyId, entry.date);
  }

  const fresh = pool.filter((candidate) => {
    const served = lastServed.get(candidate.id);
    return !served || (served < cutoff && served < isoDate);
  });
  const candidates = fresh.length > 0 ? fresh : pool;

  // Least-recently-used first; never-used counts as oldest. Slug breaks ties
  // so the order is stable across environments.
  const ordered = [...candidates].sort((a, b) => {
    const servedA = lastServed.get(a.id) ?? "";
    const servedB = lastServed.get(b.id) ?? "";
    if (servedA !== servedB) return servedA < servedB ? -1 : 1;
    return a.slug < b.slug ? -1 : 1;
  });

  // The date picks among the least-recently-used third, so the sequence
  // varies day to day without ever reaching into what was just served.
  const band = Math.max(1, Math.ceil(ordered.length / 3));
  const random = seededRandomFromString(`daily-rotation:${isoDate}`);
  return ordered[Math.floor(random() * band)]!;
}

function shiftIsoDate(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
