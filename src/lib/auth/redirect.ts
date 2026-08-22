/**
 * Where the reader was heading before we asked them to sign in.
 * Only a same-origin path is ever stored, so this can never send someone off
 * to an external URL after authentication.
 */
const KEY = "lumena:intended-path";

export function rememberIntendedPath(path: string): void {
  if (typeof sessionStorage === "undefined") return;
  if (!path.startsWith("/") || path.startsWith("//")) return;
  if (path.startsWith("/signin") || path.startsWith("/signup")) return;
  try {
    sessionStorage.setItem(KEY, path);
  } catch {
    // Private browsing: falling back to the default destination is fine.
  }
}

/** Reads and clears the stored path; defaults to the signed-in home. */
export function takeIntendedPath(fallback = "/my-journey"): string {
  if (typeof sessionStorage === "undefined") return fallback;
  try {
    const path = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return path && path.startsWith("/") && !path.startsWith("//") ? path : fallback;
  } catch {
    return fallback;
  }
}
