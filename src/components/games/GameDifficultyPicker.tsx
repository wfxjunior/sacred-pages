import { useI18n } from "@/lib/i18n";
import type { GameDifficulty } from "@/lib/games";

// The difficulty rail every game route shows. Extracted from four copies that
// had drifted into 30px-tall chips — below a comfortable touch target on a
// phone. One component, one fix.

export function GameDifficultyPicker({
  value,
  options,
  onChange,
}: {
  value: GameDifficulty;
  options: readonly GameDifficulty[];
  onChange: (next: GameDifficulty) => void;
}) {
  const { t } = useI18n();
  return (
    <div
      className="mx-auto mt-5 grid w-full max-w-md grid-cols-2 gap-1 rounded-2xl border border-border bg-card p-1 sm:inline-flex sm:w-auto sm:rounded-full"
      role="radiogroup"
      aria-label={t("games.difficultyLabel")}
    >
      {options.map((level) => {
        const active = level === value;
        return (
          <button
            key={level}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(level)}
            className={`inline-flex h-11 items-center justify-center rounded-full px-3 text-[12px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] sm:h-9 ${
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            style={{
              background: active ? "color-mix(in oklab, var(--gold) 14%, transparent)" : undefined,
            }}
          >
            {t(`diff.${level}`)}
          </button>
        );
      })}
    </div>
  );
}
