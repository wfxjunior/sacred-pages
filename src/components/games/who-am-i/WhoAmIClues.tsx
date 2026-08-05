import { Plus, ScrollText } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// The clue sheet — journal-voiced lines revealed one at a time. Asking for
// another clue is this mode's hint; the button quietly disappears when the
// sheet is complete or the round is over.

export function WhoAmIClues({
  clues,
  revealed,
  canRevealMore,
  onRevealNext,
}: {
  clues: readonly string[];
  revealed: number;
  canRevealMore: boolean;
  onRevealNext: () => void;
}) {
  const { t } = useI18n();
  const shown = clues.slice(0, revealed);

  return (
    <div className="mx-auto w-full max-w-md">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <ScrollText className="h-3.5 w-3.5" aria-hidden="true" />
        {t("whoami.cluesLabel")} · {shown.length}/{clues.length}
      </p>
      <ol className="mt-3 space-y-2.5">
        {shown.map((clue, index) => (
          <li
            key={index}
            className="rounded-xl border border-border/60 bg-card p-3 font-serif text-[15px] leading-relaxed"
            style={{ boxShadow: "0 1px 2px rgba(43,41,38,0.04)" }}
          >
            {clue}
          </li>
        ))}
      </ol>
      {canRevealMore && (
        <button
          type="button"
          onClick={onRevealNext}
          className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-border px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          {t("whoami.revealClue")}
        </button>
      )}
    </div>
  );
}
