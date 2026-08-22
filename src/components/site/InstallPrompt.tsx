import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LumenaLogo } from "./LumenaLogo";

const DISMISS_KEY = "lumena:install:dismissed";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Discreet "add to home screen" invitation. It only appears when the browser
 * itself offers the install prompt, never on desktop, and once dismissed it
 * stays gone.
 */
export function InstallPrompt() {
  const { t } = useI18n();
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
      if (window.matchMedia("(display-mode: standalone)").matches) return;
    } catch {
      /* ignore */
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferred) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDeferred(null);
  };

  return (
    <div className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 flex items-center gap-3 rounded-2xl border border-border/70 bg-card/95 px-4 py-3 shadow-lg backdrop-blur md:hidden">
      <LumenaLogo size="sm" />
      <p className="min-w-0 flex-1 text-xs leading-snug text-muted-foreground">
        {t("app.install.body")}
      </p>
      <button
        type="button"
        onClick={() => {
          void deferred.prompt().then(() => dismiss());
        }}
        className="tap-scale rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background"
      >
        {t("app.install.cta")}
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("common.close")}
        className="tap-scale text-muted-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
