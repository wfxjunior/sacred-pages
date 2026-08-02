import confetti from "canvas-confetti";

/** Brand palette (gold, sage, dusty blue, walnut, plum) so the burst feels Lumena. */
const COLORS = ["#C89F4F", "#7A8F73", "#5E7FA3", "#B88A3B", "#8C6E9B", "#D9C48A"];

/** Above the focus-mode overlay and dialogs, but never clickable. */
const Z_INDEX = 9999;

function motionAllowed() {
  if (typeof window === "undefined") return false;
  if (document.documentElement.classList.contains("reduce-motion")) return false;
  return !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** Small pop for a single discovery. */
export function celebrateWord(origin?: { x: number; y: number }) {
  if (!motionAllowed()) return;
  confetti({
    particleCount: 28,
    spread: 55,
    startVelocity: 26,
    scalar: 0.7,
    ticks: 90,
    colors: COLORS,
    origin: origin ?? { x: 0.5, y: 0.55 },
    disableForReducedMotion: true,
    zIndex: Z_INDEX,
    gravity: 1.1,
    decay: 0.9,
  });
}

/** Full celebration when every word in the set is found. */
export function celebrateCompletion() {
  if (!motionAllowed()) return;
  const end = Date.now() + 900;
  confetti({
    particleCount: 120,
    spread: 90,
    startVelocity: 42,
    ticks: 200,
    colors: COLORS,
    origin: { x: 0.5, y: 0.5 },
    disableForReducedMotion: true,
    zIndex: Z_INDEX,
    scalar: 0.9,
    gravity: 1,
  });
  const side = (x: number, angle: number) =>
    confetti({
      particleCount: 40,
      angle,
      spread: 70,
      startVelocity: 45,
      ticks: 220,
      colors: COLORS,
      origin: { x, y: 0.65 },
      disableForReducedMotion: true,
      zIndex: Z_INDEX,
      scalar: 0.9,
    });
  const loop = () => {
    side(0.05, 60);
    side(0.95, 120);
    if (Date.now() < end) setTimeout(loop, 300);
  };
  setTimeout(loop, 120);
}
