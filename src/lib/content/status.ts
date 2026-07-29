import type { ContentStatus } from "./types";

// Editorial workflow state machine.
//
// This mirrors public.is_valid_status_transition() and
// public.enforce_content_workflow() in supabase/migrations/0004. The database
// is authoritative; this module exists so the admin UI can disable impossible
// actions instead of surfacing a database error. Both must change together.

/** Roles that matter for content workflow decisions. */
export type ContentCapability = "edit" | "review" | "publish" | "super";

export const ALLOWED_TRANSITIONS: Readonly<Record<ContentStatus, readonly ContentStatus[]>> = {
  draft: ["in_review", "archived"],
  in_review: ["approved", "changes_requested", "draft"],
  changes_requested: ["draft", "in_review"],
  approved: ["scheduled", "published", "draft"],
  scheduled: ["published", "approved", "draft"],
  published: ["unpublished"],
  unpublished: ["published", "draft", "archived"],
  archived: ["draft"],
};

export function isValidTransition(from: ContentStatus, to: ContentStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** Capability required to move content INTO a given status. */
export function capabilitiesFor(to: ContentStatus): readonly ContentCapability[] {
  switch (to) {
    case "in_review":
    case "draft":
      return ["edit", "review", "publish", "super"];
    case "approved":
    case "changes_requested":
      return ["review", "super"];
    case "scheduled":
    case "published":
    case "unpublished":
    case "archived":
      return ["publish", "super"];
  }
}

export type TransitionRefusal =
  | { allowed: true }
  | { allowed: false; reason: "invalid_transition" | "insufficient_role" | "self_approval" };

/**
 * Full check: legality of the transition, the actor's capabilities, and the
 * no-self-approval rule. `super` bypasses self-approval as the documented
 * emergency override, and is the only capability that may restore archived
 * content.
 */
export function canTransition(input: {
  from: ContentStatus;
  to: ContentStatus;
  capabilities: readonly ContentCapability[];
  actorId?: string | null;
  contentCreatedBy?: string | null;
}): TransitionRefusal {
  const { from, to, capabilities, actorId, contentCreatedBy } = input;

  if (!isValidTransition(from, to)) {
    return { allowed: false, reason: "invalid_transition" };
  }

  const isSuper = capabilities.includes("super");
  const required = capabilitiesFor(to);
  if (!required.some((c) => capabilities.includes(c))) {
    return { allowed: false, reason: "insufficient_role" };
  }

  // Restoring archived content is a super-admin action.
  if (from === "archived" && !isSuper) {
    return { allowed: false, reason: "insufficient_role" };
  }

  if (
    to === "approved" &&
    !isSuper &&
    actorId &&
    contentCreatedBy &&
    actorId === contentCreatedBy
  ) {
    return { allowed: false, reason: "self_approval" };
  }

  return { allowed: true };
}

/** Statuses an editor may still freely edit the body of. */
export const EDITABLE_STATUSES: readonly ContentStatus[] = [
  "draft",
  "changes_requested",
  "in_review",
];

export function isEditableByEditor(status: ContentStatus): boolean {
  return EDITABLE_STATUSES.includes(status);
}

/** Human-facing label key for a status (resolved through i18n). */
export function statusLabelKey(status: ContentStatus): string {
  return `admin.status.${status}`;
}
