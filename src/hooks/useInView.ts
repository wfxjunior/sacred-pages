import { useEffect, useRef, useState } from "react";

/**
 * Whether an element is currently on screen.
 *
 * Used to keep animation off while a section is scrolled away — an animation
 * loop running in a section nobody is looking at is pure battery cost on mobile.
 *
 * Disconnects on unmount, so no observer outlives its element.
 */
export function useInView<T extends HTMLElement>(options?: {
  /** Fraction of the element that must be visible. */
  threshold?: number;
  /** Grows the viewport box, so animation can start just before it scrolls in. */
  rootMargin?: string;
}): { ref: React.RefObject<T | null>; inView: boolean } {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  const threshold = options?.threshold ?? 0.15;
  const rootMargin = options?.rootMargin ?? "0px";

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Without IntersectionObserver, treat the section as visible rather than
    // leaving it frozen forever.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold,
      rootMargin,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, inView };
}
