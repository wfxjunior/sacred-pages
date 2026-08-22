/**
 * Tiny haptics helper. Uses the Vibration API where available (Android/Chrome)
 * and silently no-ops elsewhere (iOS Safari has no web haptics). Respects the
 * user's "reduce motion" preference, which we treat as "reduce fuss".
 */
function allowed(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return false;
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  } catch {
    /* ignore */
  }
  return true;
}

function buzz(pattern: number | number[]) {
  if (!allowed()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}

export const haptics = {
  /** Tab switch, button press. */
  tap: () => buzz(8),
  /** A word was found, a toggle landed. */
  light: () => buzz(14),
  /** Journey complete, milestone reached. */
  success: () => buzz([12, 40, 22]),
  /** Invalid selection. */
  warn: () => buzz([18, 30, 18]),
};
