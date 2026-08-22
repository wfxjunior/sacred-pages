// The one set of control sizes every game uses. Extracted from three drifted
// copies of the same pill class — and measured: game actions rendered at 36px
// on phones while the difficulty rail sat at 44px. One definition, one
// standard: comfortable touch targets on phones (44px), compact on desktop.

/** Secondary in-game action (Clear, Reveal, hints): pill outline. */
export const gamePillClass =
  "inline-flex h-11 items-center gap-1.5 rounded-full border border-border px-3.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] disabled:pointer-events-none disabled:opacity-40 sm:h-9 sm:px-3";

/** Primary action (Check word, Continue): pass to Button's className. */
export const gamePrimaryClass = "h-11 rounded-full px-5 sm:h-10";

/** Secondary Button beside a primary (Try another, Try again, Reveal). */
export const gameSecondaryClass = "h-11 rounded-full px-4 sm:h-10";

// Completion / end-of-round actions. One column of equal-width buttons on a
// phone (Continue must never look smaller than the option below it), a
// centered row from sm up.
export const gameActionsClass =
  "mx-auto flex w-full max-w-[300px] flex-col items-stretch gap-2 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center";

export const gameActionPrimaryClass = `${gamePrimaryClass} w-full sm:w-auto sm:min-w-[168px]`;

export const gameActionSecondaryClass = `${gameSecondaryClass} w-full sm:w-auto sm:min-w-[168px]`;
