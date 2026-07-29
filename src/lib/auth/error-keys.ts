import type { AppErrorCode } from "@/lib/errors";

// Maps auth error codes to i18n keys so screens never show provider messages.

export function authErrorKey(code: AppErrorCode): string {
  switch (code) {
    case "auth/invalid-credentials":
      return "auth.errorInvalidCredentials";
    case "auth/email-not-confirmed":
      return "auth.errorEmailNotConfirmed";
    case "auth/user-already-exists":
      return "auth.errorUserExists";
    case "auth/weak-password":
      return "auth.errorWeakPassword";
    case "auth/rate-limited":
      return "auth.errorRateLimited";
    default:
      return "auth.errorUnknown";
  }
}
