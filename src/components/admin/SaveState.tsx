import { useEffect } from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";

export type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

/**
 * Save-state indicator. Uses aria-live so screen-reader users are told when a
 * save completes or fails, not just sighted users.
 */
export function SaveState({ status, error }: { status: SaveStatus; error?: string | null }) {
  const content = (() => {
    switch (status) {
      case "unsaved":
        return {
          icon: <AlertCircle className="h-3.5 w-3.5" aria-hidden />,
          text: "Unsaved changes",
        };
      case "saving":
        return {
          icon: <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />,
          text: "Saving…",
        };
      case "saved":
        return { icon: <Check className="h-3.5 w-3.5" aria-hidden />, text: "Saved" };
      case "error":
        return {
          icon: <AlertCircle className="h-3.5 w-3.5" aria-hidden />,
          text: error ?? "Could not save",
        };
      default:
        return null;
    }
  })();

  return (
    <span
      role="status"
      aria-live="polite"
      className="inline-flex min-h-5 items-center gap-1.5 text-xs"
      style={{ color: status === "error" ? "#B4542F" : "var(--muted-foreground)" }}
    >
      {content?.icon}
      {content?.text}
    </span>
  );
}

/**
 * Warns before the browser discards unsaved edits. Deliberately native: the
 * beforeunload dialog is the only reliable cross-browser guard, and it also
 * covers tab close, not just in-app navigation.
 */
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);
}
