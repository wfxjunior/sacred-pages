import { Lightbulb } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/** The hint, shown only after the reader asks for it. */
export function WordGuessHint({ hint, shown }: { hint: string; shown: boolean }) {
  const { t } = useI18n();
  if (!shown) return null;
  return (
    <div
      className="mx-auto flex max-w-md items-start gap-2 rounded-xl border border-border/60 p-3 text-left text-[13px] text-muted-foreground"
      style={{ background: "var(--surface-2)" }}
      role="note"
    >
      <Lightbulb
        className="mt-0.5 h-3.5 w-3.5 shrink-0"
        style={{ color: "var(--gold)" }}
        aria-hidden="true"
      />
      <span>
        <span className="font-medium text-foreground">{t("wordguess.hint")}: </span>
        {hint}
      </span>
    </div>
  );
}
