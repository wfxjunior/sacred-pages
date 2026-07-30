import { useEffect, useState } from "react";

/**
 * Whether the browser tab is currently in the foreground.
 *
 * A typing animation left running in a background tab keeps firing timers and
 * would have "typed" its way through several entries by the time the reader
 * comes back — so the sequence pauses instead of racing ahead unseen.
 */
export function useTabActive(): boolean {
  // Assume active for the first render so nothing depends on client-only state.
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const update = () => setActive(document.visibilityState !== "hidden");
    update();

    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return active;
}
