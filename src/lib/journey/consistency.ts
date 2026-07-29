// Consistency — "Days in the Word".
//
// Product stance, encoded here rather than left to UI copy:
//
//   * One qualifying activity grants one active day. Doing three journeys does
//     not grant three days — this is a rhythm, not a score.
//   * Missing a day never erases history. `longestRun` is permanent.
//   * A run stays "current" through yesterday, so someone who has not yet
//     opened the app today is never told their rhythm has ended.
//
// The word "streak" is avoided in user-facing copy: a streak implies something
// you can break and be punished for.

export const DEFAULT_TIME_ZONE = "UTC";

/**
 * The reader's local calendar date for an instant.
 *
 * Uses Intl rather than date arithmetic because only the ICU database knows
 * that Sao Paulo was UTC-2 during its old DST and is UTC-3 now, or exactly when
 * New York shifts. Hand-rolled offset maths gets this wrong every March.
 */
export function localDateFor(moment: Date, timeZone: string = DEFAULT_TIME_ZONE): string {
  try {
    // en-CA yields ISO-shaped YYYY-MM-DD.
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(moment);
  } catch {
    // An invalid IANA name must never break progress recording.
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: DEFAULT_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(moment);
  }
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

/** Days between two ISO dates, treating both as plain calendar dates. */
export function daysBetween(earlier: string, later: string): number {
  const a = Date.parse(`${earlier}T00:00:00Z`);
  const b = Date.parse(`${later}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

export function addDays(isoDate: string, days: number): string {
  const base = Date.parse(`${isoDate}T00:00:00Z`);
  return new Date(base + days * 86_400_000).toISOString().slice(0, 10);
}

export type ConsistencySummary = {
  /** Total distinct days with qualifying activity. Never decreases. */
  readonly activeDays: number;
  /** Length of the run ending today or yesterday; 0 when the rhythm lapsed. */
  readonly currentRun: number;
  /** Longest run ever achieved. Permanent. */
  readonly longestRun: number;
  readonly lastActiveDate: string | null;
  /** True when today already has qualifying activity. */
  readonly activeToday: boolean;
};

/**
 * Summarizes activity dates.
 *
 * `today` is passed in rather than read from a clock so the calculation is pure
 * and testable across time zones and DST boundaries.
 */
export function summarizeConsistency(
  activityDates: readonly string[],
  today: string,
): ConsistencySummary {
  if (activityDates.length === 0) {
    return {
      activeDays: 0,
      currentRun: 0,
      longestRun: 0,
      lastActiveDate: null,
      activeToday: false,
    };
  }

  // Duplicates are collapsed: several activities on one local day are one day.
  const unique = [...new Set(activityDates)].sort();

  let longestRun = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    if (daysBetween(unique[i - 1], unique[i]) === 1) {
      run++;
    } else {
      run = 1;
    }
    longestRun = Math.max(longestRun, run);
  }

  const lastActiveDate = unique[unique.length - 1];
  const gapFromToday = daysBetween(lastActiveDate, today);

  // A run counts as current through yesterday. Someone who simply has not
  // opened the app yet today still has an unbroken rhythm.
  let currentRun = 0;
  if (gapFromToday === 0 || gapFromToday === 1) {
    currentRun = 1;
    for (let i = unique.length - 2; i >= 0; i--) {
      if (daysBetween(unique[i], unique[i + 1]) === 1) currentRun++;
      else break;
    }
  }

  return {
    activeDays: unique.length,
    currentRun,
    longestRun,
    lastActiveDate,
    activeToday: gapFromToday === 0,
  };
}

/**
 * Whether recording activity now would add a NEW active day.
 * Used only to avoid a pointless write — the database primary key is the real
 * guarantee against duplicates.
 */
export function wouldAddActiveDay(
  existingDates: readonly string[],
  moment: Date,
  timeZone: string,
): boolean {
  return !existingDates.includes(localDateFor(moment, timeZone));
}

/**
 * Encouragement copy key for the current state.
 *
 * Every message is neutral or warm. There is deliberately no "you broke your
 * streak" state: lapsing is not a failure the product comments on.
 */
export function encouragementKey(summary: ConsistencySummary): string {
  if (summary.activeDays === 0) return "consistency.empty";
  if (summary.activeToday) return "consistency.today";
  if (summary.currentRun > 0) return "consistency.continuing";
  return "consistency.welcomeBack";
}

/** The last N local dates, oldest first — for the dashboard week strip. */
export function recentDateWindow(today: string, days: number): string[] {
  return Array.from({ length: days }, (_, i) => addDays(today, i - (days - 1)));
}

/** Marks which of a date window had activity, for rendering without lookups. */
export function activityWindow(
  activityDates: readonly string[],
  today: string,
  days = 7,
): { date: string; active: boolean }[] {
  const set = new Set(activityDates);
  return recentDateWindow(today, days).map((date) => ({ date, active: set.has(date) }));
}
