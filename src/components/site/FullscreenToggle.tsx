import { useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type Props = { className?: string };

export function FullscreenToggle({ className = "" }: Props) {
  const { t } = useI18n();
  const [isFs, setIsFs] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof document === "undefined") return;
    setSupported(!!document.documentElement.requestFullscreen);
    const onChange = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  if (!supported) return null;

  const toggle = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen({ navigationUI: "hide" } as FullscreenOptions);
      } else {
        await document.exitFullscreen();
      }
    } catch {
      /* ignore */
    }
  };

  const label = isFs ? t("fs.exit") : t("fs.enter");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:inline-flex ${className}`}
    >
      {isFs ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
    </button>
  );
}