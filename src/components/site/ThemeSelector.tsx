import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type ThemeMode } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

const OPTIONS: { key: ThemeMode; labelKey: string; icon: typeof Sun }[] = [
  { key: "light", labelKey: "settings.light", icon: Sun },
  { key: "dark", labelKey: "settings.dark", icon: Moon },
  { key: "system", labelKey: "settings.system", icon: Monitor },
];

export function ThemeSelector() {
  const { mode, setMode } = useTheme();
  const { t } = useI18n();
  return (
    <div
      role="radiogroup"
      aria-label={t("theme.aria")}
      className="inline-flex w-full items-center gap-1 rounded-full border border-border/60 bg-card p-1 sm:w-auto"
    >
      {OPTIONS.map((o) => {
        const active = mode === o.key;
        const Icon = o.icon;
        return (
          <button
            key={o.key}
            role="radio"
            aria-checked={active}
            onClick={() => setMode(o.key)}
            className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full px-3 text-[13px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-8 sm:flex-none ${
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            style={active ? { background: "var(--gold)" } : undefined}
          >
            <Icon className="h-3.5 w-3.5" />
            {t(o.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
