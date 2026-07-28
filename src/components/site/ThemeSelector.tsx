import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type ThemeMode } from "@/lib/theme";

const OPTIONS: { key: ThemeMode; label: string; icon: typeof Sun }[] = [
  { key: "light", label: "Light", icon: Sun },
  { key: "dark", label: "Dark", icon: Moon },
  { key: "system", label: "System", icon: Monitor },
];

export function ThemeSelector() {
  const { mode, setMode } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card p-1"
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
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            style={active ? { background: "var(--gold)" } : undefined}
          >
            <Icon className="h-3.5 w-3.5" />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}