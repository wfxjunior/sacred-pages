/**
 * The closing note.
 *
 * The "coming soon" treatment is a plain label, not a control. There is no
 * working submission or waitlist backend in this phase, and a button or an
 * email field that quietly did nothing would be a small lie told to every
 * visitor — so nothing here is interactive.
 */
export function LivingJournalClosing() {
  return (
    <div className="mt-16 flex flex-col items-center text-center sm:mt-20">
      {/* Hairline rule, echoing the journal's ruled margin. */}
      <span
        aria-hidden
        className="h-px w-16"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in oklab, var(--gold) 55%, transparent), transparent)",
        }}
      />

      <p className="mt-8 font-serif text-[22px] leading-[1.35] text-foreground sm:text-[26px]">
        Thousands of quiet moments.
        <br />
        One shared journey.
      </p>

      <p
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#E4E0D6] px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] dark:border-border/60"
        style={{ color: "var(--walnut)" }}
      >
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "color-mix(in oklab, var(--gold) 70%, transparent)" }}
        />
        The Living Journal is coming soon to Lumena
      </p>
    </div>
  );
}
