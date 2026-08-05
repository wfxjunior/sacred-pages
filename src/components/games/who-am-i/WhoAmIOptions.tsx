import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// Name options. A tried-and-rejected name stays visible but dimmed and marked,
// so the reader is never punished twice for the same guess — feedback that
// does not rely on colour alone.

export function WhoAmIOptions({
  options,
  isGuessed,
  disabled,
  onGuess,
}: {
  options: readonly string[];
  isGuessed: (option: string) => boolean;
  disabled: boolean;
  onGuess: (option: string) => void;
}) {
  const { t } = useI18n();

  return (
    <div role="group" aria-label={t("whoami.optionsLabel")} className="mx-auto w-full max-w-md">
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {t("whoami.whoLabel")}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {options.map((option) => {
          const tried = isGuessed(option);
          return (
            <button
              key={option}
              type="button"
              disabled={disabled || tried}
              onClick={() => onGuess(option)}
              className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 font-serif text-[15px] uppercase tracking-[0.08em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] disabled:pointer-events-none ${
                tried
                  ? "border-border/40 text-muted-foreground/60 line-through"
                  : "border-border bg-card hover:border-[color:var(--gold)]"
              }`}
              style={{ boxShadow: tried ? undefined : "0 1px 2px rgba(43,41,38,0.04)" }}
            >
              {tried && <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
