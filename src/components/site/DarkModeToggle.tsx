import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

export function DarkModeToggle({
  variant = "default",
}: {
  variant?: "default" | "light";
}) {
  const { t } = useI18n();
  const { resolved, setMode } = useTheme();
  const isDark = resolved === "dark";
  const isLight = variant === "light";
  return (
    <button
      type="button"
      onClick={() => setMode(isDark ? "light" : "dark")}
      aria-label={isDark ? t("header.lightMode") : t("header.darkMode")}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
        isLight
          ? "border-white/20 bg-white/10 text-white/80 hover:text-white"
          : "border-border/60 bg-card/60 text-muted-foreground hover:text-foreground focus-visible:ring-primary"
      }`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}