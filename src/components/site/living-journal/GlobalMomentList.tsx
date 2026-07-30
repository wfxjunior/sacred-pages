import { useEffect, useState } from "react";
import type { LivingJournalMoment } from "./livingJournal.types";

/** How long each moment rests before the next one takes its place. */
const MOMENT_INTERVAL_MS = 3400;

/** How many lines are visible at once. */
const VISIBLE_COUNT = 4;

/**
 * Quiet lines from a global activity journal.
 *
 * The restraint is the design. These are phrased as journal lines, not events:
 * no counters, no badges, no dots, no "new" markers, nothing that reads as a
 * notification. Each line fades in, rests, and is replaced.
 *
 * Only ever one timer, cleared on every dependency change — the same discipline
 * as the typing sequence.
 */
export function GlobalMomentList({
  moments,
  active,
  reducedMotion,
}: {
  moments: readonly LivingJournalMoment[];
  active: boolean;
  reducedMotion: boolean;
}) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!active || reducedMotion || moments.length <= VISIBLE_COUNT) return;

    const timer = setTimeout(() => setOffset((o) => o + 1), MOMENT_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [active, reducedMotion, moments.length, offset]);

  if (moments.length === 0) return null;

  const visible = Array.from({ length: Math.min(VISIBLE_COUNT, moments.length) }, (_, i) => {
    return moments[(offset + i) % moments.length];
  });

  return (
    <aside aria-labelledby="lj-moments-heading" className="mt-10 lg:mt-0">
      <h3
        id="lj-moments-heading"
        className="text-[10px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: "var(--walnut)" }}
      >
        Around the world
      </h3>

      <ul className="mt-5 space-y-4">
        {visible.map((moment, i) => (
          <li
            key={moment.id}
            // Keyed by id so React replaces the node and the fade restarts.
            // No aria-live: these are ambient, and announcing them would
            // interrupt a screen reader indefinitely.
            className={`flex gap-3 text-[13px] leading-relaxed ${
              reducedMotion ? "" : "lj-moment-in"
            }`}
            style={{
              color: "color-mix(in oklab, var(--ink) 62%, transparent)",
              // Slight stagger so the column settles as a group rather than
              // all four lines snapping at once.
              animationDelay: reducedMotion ? undefined : `${i * 70}ms`,
            }}
          >
            <span
              aria-hidden
              className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full"
              style={{ background: "color-mix(in oklab, var(--gold) 60%, transparent)" }}
            />
            {moment.text}
          </li>
        ))}
      </ul>
    </aside>
  );
}
