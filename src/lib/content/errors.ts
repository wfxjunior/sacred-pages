import { AppError, type AppErrorCode } from "@/lib/errors";
import type { ContentStatus } from "./types";

// Content-domain errors. Every one carries a stable code that the admin UI maps
// to localized copy - raw PostgreSQL messages are never shown to users.

export class ContentError extends AppError {
  constructor(
    code: AppErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(code, message);
    this.name = "ContentError";
  }
}

export const contentErrors = {
  notFound: (entity: string, id?: string) =>
    new ContentError("content/not-found", `${entity} not found`, { entity, id }),

  unauthorized: (action: string) =>
    new ContentError("content/unauthorized-access", `Not authorized to ${action}`, { action }),

  invalidTransition: (from: ContentStatus, to: ContentStatus) =>
    new ContentError(
      "content/invalid-status-transition",
      `Cannot move content from ${from} to ${to}`,
      { from, to },
    ),

  duplicateSlug: (slug: string) =>
    new ContentError("content/duplicate-slug", `The slug "${slug}" is already in use`, { slug }),

  translationMissing: (languageCode: string) =>
    new ContentError("content/translation-missing", `Translation missing for ${languageCode}`, {
      languageCode,
    }),

  publicationConflict: (message: string, details?: Record<string, unknown>) =>
    new ContentError("content/publication-conflict", message, details),

  scheduledPublicationConflict: (date: string, languageCode: string) =>
    new ContentError(
      "content/scheduled-publication-conflict",
      `A Daily Journey is already assigned for ${date} (${languageCode})`,
      { date, languageCode },
    ),

  invalidScriptureReference: (message: string, details?: Record<string, unknown>) =>
    new ContentError("content/invalid-scripture-reference", message, details),

  invalidWordList: (issues: readonly string[]) =>
    new ContentError("content/invalid-word-list", "The word list has validation errors", {
      issues,
    }),

  invalidPuzzleConfiguration: (issues: readonly string[]) =>
    new ContentError(
      "content/invalid-puzzle-configuration",
      "The puzzle configuration is invalid",
      { issues },
    ),

  reviewRequired: () =>
    new ContentError("content/review-required", "This content must be approved before publishing"),

  selfApprovalNotAllowed: () =>
    new ContentError(
      "content/self-approval-not-allowed",
      "You cannot approve content you authored; another reviewer must approve it",
    ),

  validationFailed: (issues: readonly string[]) =>
    new ContentError("content/validation-failed", "Validation failed", { issues }),
} as const;

/** i18n key for an error code, used by admin screens. */
export function contentErrorKey(code: AppErrorCode): string {
  switch (code) {
    case "content/not-found":
      return "admin.error.notFound";
    case "content/unauthorized-access":
      return "admin.error.unauthorized";
    case "content/invalid-status-transition":
      return "admin.error.invalidTransition";
    case "content/duplicate-slug":
      return "admin.error.duplicateSlug";
    case "content/translation-missing":
      return "admin.error.translationMissing";
    case "content/publication-conflict":
      return "admin.error.publicationConflict";
    case "content/scheduled-publication-conflict":
      return "admin.error.dailyJourneyConflict";
    case "content/invalid-scripture-reference":
      return "admin.error.invalidScripture";
    case "content/invalid-word-list":
      return "admin.error.invalidWordList";
    case "content/invalid-puzzle-configuration":
      return "admin.error.invalidPuzzleConfig";
    case "content/review-required":
      return "admin.error.reviewRequired";
    case "content/self-approval-not-allowed":
      return "admin.error.selfApproval";
    case "content/validation-failed":
      return "admin.error.validationFailed";
    default:
      return "admin.error.unknown";
  }
}

/**
 * Translates PostgreSQL/PostgREST failures into domain errors so the admin UI
 * never renders a raw database message.
 */
export function fromPostgrestError(error: {
  code?: string;
  message?: string;
  details?: string | null;
}): ContentError {
  const message = error.message ?? "";

  if (error.code === "23505") {
    if (message.includes("slug")) {
      return contentErrors.duplicateSlug("(duplicate)");
    }
    if (message.includes("daily_journeys")) {
      return contentErrors.publicationConflict("A Daily Journey already exists for that date");
    }
    if (message.includes("normalized")) {
      return contentErrors.invalidWordList(["Two words normalize to the same matching value"]);
    }
    return contentErrors.publicationConflict("That value must be unique");
  }

  if (message.includes("self-approval")) return contentErrors.selfApprovalNotAllowed();
  if (message.includes("invalid content status transition")) {
    return new ContentError(
      "content/invalid-status-transition",
      "That status change is not allowed",
    );
  }
  if (error.code === "42501" || message.includes("insufficient_privilege")) {
    return contentErrors.unauthorized("perform this action");
  }
  if (message.includes("does not permit storing verse text")) {
    return contentErrors.invalidScriptureReference(
      "This Bible translation does not permit storing verse text. Use a reference-only source.",
    );
  }

  return new ContentError("content/validation-failed", "The operation could not be completed");
}
