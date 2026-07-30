/**
 * The Living Journal — types.
 *
 * These describe a *demonstration* entry rendered from a local file. The shape
 * is deliberately close to what a real table would return, so replacing the
 * local array with a query later touches the data module and nothing else.
 *
 * Note what is absent, on purpose: no surname, no photo URL, no user id, no
 * like/comment counts, no engagement metrics. The Living Journal is not a feed,
 * and a type that cannot carry those fields cannot accidentally grow into one.
 */

export type LivingJournalLocale = "en" | "pt" | "es";

export interface LivingJournalEntry {
  readonly id: string;
  /** First name only. Never a surname. */
  readonly firstName: string;
  /** Human-readable place, e.g. "Austin, USA". Visually secondary. */
  readonly location?: string;
  /** ISO 3166-1 alpha-2, for optional discreet labelling. */
  readonly countryCode?: string;
  readonly language: LivingJournalLocale;
  readonly message: string;
  /** Pre-formatted, e.g. "July 29" — avoids locale drift between server and client. */
  readonly dateLabel?: string;
  /** Optional milestone, e.g. "Day 21 · Psalms". */
  readonly journeyLabel?: string;
  /** Milliseconds per character. Falls back to the section default. */
  readonly typingSpeed?: number;
  /** Milliseconds the finished entry rests before the next begins. */
  readonly displayDuration?: number;
  readonly featured?: boolean;
}

/**
 * A quiet, anonymous line from the global activity journal.
 * No name, no location precision beyond a country, nothing identifying.
 */
export interface LivingJournalMoment {
  readonly id: string;
  readonly text: string;
}

/** Where the typing sequence currently is for one entry. */
export type JournalEntryPhase =
  /** "<Name> is writing…" with a resting cursor. */
  | "intro"
  /** Characters appearing one at a time. */
  | "writing"
  /** Fully written; resting before the next entry. */
  | "complete";
