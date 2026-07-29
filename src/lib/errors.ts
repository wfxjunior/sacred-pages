// Centralized application error taxonomy. UI layers map `code` to localized
// copy; never surface provider-internal messages directly to users.

export type AppErrorCode =
  | "config/not-configured"
  | "auth/invalid-credentials"
  | "auth/email-not-confirmed"
  | "auth/user-already-exists"
  | "auth/weak-password"
  | "auth/rate-limited"
  | "auth/unknown"
  | "network/unavailable"
  // Content platform (Phase 2)
  | "content/not-found"
  | "content/unauthorized-access"
  | "content/invalid-status-transition"
  | "content/duplicate-slug"
  | "content/translation-missing"
  | "content/publication-conflict"
  | "content/scheduled-publication-conflict"
  | "content/invalid-scripture-reference"
  | "content/invalid-word-list"
  | "content/invalid-puzzle-configuration"
  | "content/review-required"
  | "content/self-approval-not-allowed"
  | "content/validation-failed"
  // User progress (Phase 4)
  | "progress/session-not-found"
  | "progress/invalid-session-transition"
  | "progress/required-step-incomplete"
  | "progress/step-locked"
  | "progress/already-completed"
  | "progress/private-content-forbidden"
  | "progress/share-payload-rejected"
  | "progress/validation-failed"
  | "unknown";

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message?: string,
    options?: { cause?: unknown },
  ) {
    super(message ?? code, options);
    this.name = "AppError";
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}

export function toAppError(value: unknown, fallback: AppErrorCode = "unknown"): AppError {
  if (isAppError(value)) return value;
  if (value instanceof Error) return new AppError(fallback, value.message, { cause: value });
  return new AppError(fallback, typeof value === "string" ? value : undefined);
}
