import { useEffect, useState, type ReactNode } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// The one container every game route renders inside. It owns the page width,
// the vertical rhythm, and — the reason it exists — a single expand control
// so every mode can be played on the whole screen, exactly like the word
// search's focus mode. Expanding also asks the browser for real fullscreen
// where that is allowed; if it is refused, the in-page overlay still fills
// the viewport, so the control never feels broken.

export function GameStage({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [expanded]);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    void (async () => {
      try {
        if (next) {
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          }
        } else if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } catch {
        /* fullscreen refused — the overlay alone is enough */
      }
    })();
  };

  const label = expanded ? t("fs.exit") : t("fs.enter");

  const control = (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="absolute right-2 top-2 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/80 text-muted-foreground backdrop-blur transition hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
    >
      {expanded ? (
        <Minimize2 className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Maximize2 className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );

  if (expanded) {
    return (
      <div className="fixed inset-0 z-[60] overflow-y-auto bg-background">
        <div
          className="relative mx-auto w-full max-w-3xl px-3 pb-10"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
        >
          {control}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-3xl px-1 py-6 sm:py-10">
      {control}
      {children}
    </div>
  );
}
