import { useEffect, useState } from "react";

/**
 * Native-app header behaviour: the compact mobile header slides away while the
 * reader scrolls down and comes straight back on the first upward gesture.
 * Returns true while the header should be hidden.
 */
export function useHideOnScroll(threshold = 64) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const delta = y - last;
        if (Math.abs(delta) < 6) return;
        if (y < threshold) setHidden(false);
        else setHidden(delta > 0);
        last = y;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return hidden;
}
