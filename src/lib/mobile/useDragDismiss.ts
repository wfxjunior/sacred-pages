import { useRef, useState } from "react";
import { haptics } from "./haptics";

/**
 * Bottom-sheet gesture: drag the handle down and release past the threshold to
 * dismiss, exactly like a native sheet. Returns the live offset (for the
 * transform) plus touch handlers to spread on the grab area.
 */
export function useDragDismiss(onDismiss: () => void, threshold = 120) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<number | null>(null);
  const armed = useRef(false);

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => {
      start.current = e.touches[0]?.clientY ?? null;
      armed.current = false;
      setDragging(true);
    },
    onTouchMove: (e: React.TouchEvent) => {
      if (start.current == null) return;
      const delta = (e.touches[0]?.clientY ?? 0) - start.current;
      if (delta <= 0) {
        setOffset(0);
        return;
      }
      setOffset(delta);
      if (!armed.current && delta >= threshold) {
        armed.current = true;
        haptics.tap();
      }
    },
    onTouchEnd: () => {
      const shouldClose = offset >= threshold;
      start.current = null;
      setDragging(false);
      setOffset(0);
      if (shouldClose) onDismiss();
    },
  };

  return { offset, dragging, handlers };
}
