import { Check } from "lucide-react";
import type { JournalEntryPhase, LivingJournalEntry } from "./livingJournal.types";

/**
 * One journal entry, presented as a page from a premium devotional journal.
 *
 * Composition rules that keep this from becoming a testimonial card: the date
 * leads (a journal is dated), the message is set in serif at reading size, and
 * attribution sits quietly beneath an em dash. No rating, no decorative quote
 * glyph, no avatar, no role.
 *
 * The card holds a fixed minimum height so a short entry and a long one occupy
 * the same space — otherwise every entry change would shift the page.
 */
export function JournalEntryCard({
  entry,
  typedText,
  phase,
  showCursor,
}: {
  entry: LivingJournalEntry;
  typedText: string;
  phase: JournalEntryPhase;
  showCursor: boolean;
}) {
  const isWriting = phase === "writing";
  const isIntro = phase === "intro";

  return (
    <article
      className="paper-texture lj-paper relative overflow-hidden rounded-2xl border border-[#E4E0D6] px-6 py-7 shadow-[0_18px_50px_-28px_rgba(43,43,43,0.28)] sm:px-9 sm:py-10 dark:border-border/60"
      aria-labelledby={`lj-entry-${entry.id}`}
    >
      {/* A single ruled margin line, as in a bound journal. Decorative only. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-6 left-3 w-px sm:left-5"
        style={{ background: "color-mix(in oklab, var(--gold) 28%, transparent)" }}
      />

      <div className="relative">
        <header className="flex items-baseline justify-between gap-4">
          {entry.dateLabel && (
            <p className="font-serif text-[13px] tracking-wide" style={{ color: "var(--walnut)" }}>
              {entry.dateLabel}
            </p>
          )}

          {/* Writing status — quiet, and never a chat "sent" receipt. */}
          <p
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em]"
            style={{ color: "var(--walnut)" }}
          >
            {phase === "complete" ? (
              <>
                <Check
                  className="h-3 w-3"
                  style={{ color: "color-mix(in oklab, var(--sage) 85%, transparent)" }}
                  aria-hidden
                />
                Entry complete
              </>
            ) : (
              <>{entry.firstName} is writing</>
            )}
          </p>
        </header>

        {/*
          The visible message is hidden from assistive technology while it
          animates: announcing it character by character would be unusable. The
          complete text is exposed once, below.
        */}
        <blockquote
          aria-hidden={!isIntro}
          className="mt-5 min-h-[7.5rem] font-serif text-[19px] leading-[1.6] text-foreground sm:min-h-[8.5rem] sm:text-[22px] sm:leading-[1.55]"
        >
          {isIntro ? (
            <span className="inline-flex items-center" style={{ color: "var(--walnut)" }}>
              <span
                aria-hidden
                className={`inline-block h-[1.15em] w-px align-middle ${
                  showCursor ? "lj-cursor" : ""
                }`}
                style={{ background: "var(--ink)" }}
              />
            </span>
          ) : (
            <>
              {typedText}
              {isWriting && (
                <span
                  aria-hidden
                  className={`ml-0.5 inline-block h-[1.05em] w-px align-middle ${
                    showCursor ? "lj-cursor" : ""
                  }`}
                  style={{ background: "var(--ink)" }}
                />
              )}
            </>
          )}
        </blockquote>

        <footer className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-[#E4E0D6]/80 pt-4 dark:border-border/50">
          <p className="text-[14px] text-foreground">
            <span aria-hidden>— </span>
            {entry.firstName}
          </p>
          {entry.location && (
            <p className="text-[12px]" style={{ color: "var(--walnut)" }}>
              {entry.location}
            </p>
          )}
          {entry.journeyLabel && (
            <p
              className="ml-auto text-[10px] uppercase tracking-[0.16em]"
              style={{ color: "color-mix(in oklab, var(--walnut) 85%, transparent)" }}
            >
              {entry.journeyLabel}
            </p>
          )}
        </footer>
      </div>

      {/*
        The accessible version: the finished entry as one readable sentence.
        Deliberately NOT an aria-live region — a live region here would
        interrupt a screen reader every few seconds, unprompted, forever.
      */}
      <p id={`lj-entry-${entry.id}`} className="sr-only">
        {entry.dateLabel ? `${entry.dateLabel}. ` : ""}
        {entry.message} — {entry.firstName}
        {entry.location ? `, ${entry.location}` : ""}
        {entry.journeyLabel ? `. ${entry.journeyLabel}` : ""}
      </p>
    </article>
  );
}
