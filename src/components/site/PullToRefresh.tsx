import { useEffect, useRef, useState, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { haptics } from "@/lib/mobile/haptics";

const TRIGGER = 72;

/**
 * App-style pull to refresh. The browser's own gesture is disabled globally
 * (overscroll-behavior), so this fills the gap: drag down from the very top of
 * a screen and release to re-run the caller's refresh. Touch only — desktop
 * keeps its normal scrolling.
 */
export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => void | Promise<unknown>;
  children: ReactNode;
}) {
  const [pull, setPull] = useState(0);
  const [busy, setBusy] = useState(false);
  const startY = useRef<number | null>(null);
  const armed = useRef(false);

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      if (window.scrollY > 0 || busy) return;
      startY.current = e.touches[0]?.clientY ?? null;
      armed.current = false;
    };
    const onMove = (e: TouchEvent) => {
      if (startY.current == null) return;
      const y = e.touches[0]?.clientY ?? 0;
      const delta = y - startY.current;
      if (delta <= 0 || window.scrollY > 0) {
        setPull(0);
        return;
      }
      // Rubber-band resistance, capped so it never looks like a layout break.
      const eased = Math.min(96, delta * 0.45);
      setPull(eased);
      if (!armed.current && eased >= TRIGGER) {
        armed.current = true;
        haptics.tap();
      }
    };
    const onEnd = () => {
      const shouldRefresh = pull >= TRIGGER;
      startY.current = null;
      if (!shouldRefresh) {
        setPull(0);
        return;
      }
      setBusy(true);
      setPull(48);
      void Promise.resolve(onRefresh()).finally(() => {
        window.setTimeout(() => {
          setBusy(false);
          setPull(0);
        }, 400);
      });
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [busy, onRefresh, pull]);

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-2 flex justify-center md:hidden"
        style={{ opacity: pull > 4 ? 1 : 0, transform: `translateY(${pull * 0.5}px)` }}
      >
        <span className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-background/90 shadow-sm">
          <RefreshCw
            className={`h-4 w-4 text-muted-foreground ${busy ? "animate-spin" : ""}`}
            style={{ transform: busy ? undefined : `rotate(${pull * 3}deg)` }}
          />
        </span>
      </div>
      <div
        style={{ transform: `translateY(${pull}px)` }}
        className={pull ? "" : "transition-transform duration-300"}
      >
        {children}
      </div>
    </div>
  );
}
