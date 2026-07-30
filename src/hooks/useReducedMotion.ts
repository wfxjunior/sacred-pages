import { useEffect, useState } from "react";

/**
 * Whether the reader has asked for reduced motion.
 *
 * Two signals, both honoured: the OS-level `prefers-reduced-motion` query and
 * the app's own `.reduce-motion` class on <html> (the in-app preference toggle,
 * which styles.css also keys off). Watching only the media query would ignore a
 * reader who turned the setting on inside Lumena.
 *
 * Extracted from WordSearch so the Living Journal shares one definition rather
 * than a second copy that could drift.
 */
export function useReducedMotion(): boolean {
  // Starts false so server and client render identically; the effect corrects
  // it immediately after mount.
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () =>
      setReduced(mq.matches || document.documentElement.classList.contains("reduce-motion"));

    update();
    mq.addEventListener?.("change", update);

    // The class can change without any media-query event firing.
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      mq.removeEventListener?.("change", update);
      observer.disconnect();
    };
  }, []);

  return reduced;
}
