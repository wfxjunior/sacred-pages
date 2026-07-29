import { AppError, type AppErrorCode } from "@/lib/errors";
import type { JourneySessionStatus, JourneyStepType } from "./state";

// Progress-domain errors.
//
// Every message here is written to be shown to a reader, not an operator: this
// domain is the one a person meets while reading Scripture, so "That step is not
// open yet" is the right register — never a PostgREST string.

export class ProgressError extends AppError {
  constructor(
    code: AppErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(code, message);
    this.name = "ProgressError";
  }
}

export const progressErrors = {
  sessionNotFound: (id?: string) =>
    new ProgressError("progress/session-not-found", "That journey session could not be found", {
      id,
    }),

  invalidTransition: (from: JourneySessionStatus, to: JourneySessionStatus) =>
    new ProgressError(
      "progress/invalid-session-transition",
      `A journey cannot move from ${from} to ${to}`,
      { from, to },
    ),

  requiredStepIncomplete: (missing: readonly JourneyStepType[]) =>
    new ProgressError(
      "progress/required-step-incomplete",
      "Some steps still need to be finished first",
      { missing: [...missing] },
    ),

  stepLocked: (step: JourneyStepType) =>
    new ProgressError("progress/step-locked", "That step is not open yet", { step }),

  alreadyCompleted: (id?: string) =>
    new ProgressError("progress/already-completed", "This journey is already complete", { id }),

  /**
   * Raised when code attempts to read another reader's private response. RLS
   * refuses this at the database anyway; the error exists so the attempt is
   * legible in application code rather than surfacing as an empty result.
   */
  privateContentForbidden: () =>
    new ProgressError(
      "progress/private-content-forbidden",
      "Reflections and prayers are readable only by the person who wrote them",
    ),

  sharePayloadRejected: (issues: readonly string[]) =>
    new ProgressError("progress/share-payload-rejected", "That content cannot be shared", {
      issues: [...issues],
    }),

  validationFailed: (issues: readonly string[]) =>
    new ProgressError("progress/validation-failed", "Validation failed", { issues: [...issues] }),
} as const;

/** i18n key for a progress error code. */
export function progressErrorKey(code: AppErrorCode): string {
  switch (code) {
    case "progress/session-not-found":
      return "progress.error.sessionNotFound";
    case "progress/invalid-session-transition":
      return "progress.error.invalidTransition";
    case "progress/required-step-incomplete":
      return "progress.error.requiredStepIncomplete";
    case "progress/step-locked":
      return "progress.error.stepLocked";
    case "progress/already-completed":
      return "progress.error.alreadyCompleted";
    case "progress/private-content-forbidden":
      return "progress.error.privateContent";
    case "progress/share-payload-rejected":
      return "progress.error.shareRejected";
    case "progress/validation-failed":
      return "progress.error.validationFailed";
    default:
      return "progress.error.unknown";
  }
}
