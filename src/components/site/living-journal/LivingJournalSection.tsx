import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTabActive } from "@/hooks/useTabActive";
import { GlobalMomentList } from "./GlobalMomentList";
import { JournalEntryCard } from "./JournalEntryCard";
import { LivingJournalClosing } from "./LivingJournalClosing";
import { LIVING_JOURNAL_ENTRIES, LIVING_JOURNAL_MOMENTS } from "./livingJournalData";
import { useLivingJournalSequence } from "./useLivingJournalSequence";

/**
 * The Living Journal.
 *
 * A quiet editorial section: one journal entry being written at a time, with
 * anonymous global moments alongside it. Not a feed, not a testimonial grid —
 * there is nothing to like, follow, reply to or count, and the types cannot
 * carry those fields.
 *
 * Animation runs only when the section is on screen AND the tab is in the
 * foreground, so nothing burns battery behind the fold or in a background tab.
 */
export function LivingJournalSection() {
  const reducedMotion = useReducedMotion();
  const tabActive = useTabActive();
  // rootMargin lets the sequence start just before the section scrolls in, so
  // the reader arrives to writing already in progress rather than a blank card.
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2, rootMargin: "120px" });

  const active = inView && tabActive;
  const sequence = useLivingJournalSequence({
    entries: LIVING_JOURNAL_ENTRIES,
    active,
    reducedMotion,
  });

  return (
    <section
      id="living-journal"
      // Offset so the fixed header never covers the heading when the nav link
      // scrolls here.
      className="scroll-mt-20 bg-[color:var(--surface-2)] md:scroll-mt-24"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-28">
        {/* Heading — editorial, generous, left-aligned to read as a page opening. */}
        <div className="mx-auto max-w-2xl text-center">
          {/* Walnut, not --brand: every other section eyebrow uses walnut, and
              the cobalt/blue brand tone is the one cool note in an otherwise
              entirely warm section. */}
          <p
            className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--walnut)" }}
          >
            A Living Community
          </p>
          <h2 className="font-serif text-3xl leading-[1.1] tracking-tight text-foreground md:text-[44px]">
            The Living Journal
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            Every day, people around the world spend a few quiet moments in God&rsquo;s Word. Here
            are some of the moments that make that journey meaningful.
          </p>
        </div>

        <div
          ref={ref}
          className="mt-14 grid items-stretch gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12"
        >
          <div className="h-full">
            {sequence && (
              // Keyed by entry so each new page animates in instead of the text
              // snapping over the previous one.
              <div
                key={sequence.entry.id}
                className={`h-full ${reducedMotion ? "" : "lj-entry-in"}`}
              >
                <JournalEntryCard
                  entry={sequence.entry}
                  typedText={sequence.typedText}
                  phase={sequence.phase}
                  // The cursor rests when the tab is away, so a paused sequence
                  // looks paused rather than broken.
                  showCursor={active && !reducedMotion}
                />
              </div>
            )}

          </div>

          <GlobalMomentList
            moments={LIVING_JOURNAL_MOMENTS}
            active={active}
            reducedMotion={reducedMotion}
          />
        </div>

        <LivingJournalClosing />
      </div>
    </section>
  );
}
