import { describe, expect, it } from "vitest";
import {
  ALLOWED_TRANSITIONS,
  canTransition,
  capabilitiesFor,
  isEditableByEditor,
  isValidTransition,
  type ContentCapability,
} from "./status";
import { CONTENT_STATUSES, type ContentStatus } from "./types";

const EDITOR: ContentCapability[] = ["edit"];
const REVIEWER: ContentCapability[] = ["review"];
const PUBLISHER: ContentCapability[] = ["publish"];
const SUPER: ContentCapability[] = ["super"];

describe("isValidTransition", () => {
  it("allows the documented happy path", () => {
    expect(isValidTransition("draft", "in_review")).toBe(true);
    expect(isValidTransition("in_review", "approved")).toBe(true);
    expect(isValidTransition("approved", "scheduled")).toBe(true);
    expect(isValidTransition("scheduled", "published")).toBe(true);
    expect(isValidTransition("published", "unpublished")).toBe(true);
    expect(isValidTransition("unpublished", "archived")).toBe(true);
    expect(isValidTransition("archived", "draft")).toBe(true);
  });

  it("allows changes_requested to return to draft", () => {
    expect(isValidTransition("in_review", "changes_requested")).toBe(true);
    expect(isValidTransition("changes_requested", "draft")).toBe(true);
  });

  it("rejects skipping review", () => {
    expect(isValidTransition("draft", "published")).toBe(false);
    expect(isValidTransition("draft", "approved")).toBe(false);
    expect(isValidTransition("changes_requested", "approved")).toBe(false);
  });

  it("rejects editing published content backwards without unpublishing", () => {
    expect(isValidTransition("published", "draft")).toBe(false);
    expect(isValidTransition("published", "archived")).toBe(false);
  });

  it("never allows a transition to itself", () => {
    for (const status of CONTENT_STATUSES) {
      expect(isValidTransition(status, status)).toBe(false);
    }
  });

  it("only references known statuses", () => {
    const known = new Set<string>(CONTENT_STATUSES);
    for (const [from, targets] of Object.entries(ALLOWED_TRANSITIONS)) {
      expect(known.has(from)).toBe(true);
      for (const to of targets) expect(known.has(to)).toBe(true);
    }
  });
});

describe("capabilitiesFor", () => {
  it("requires review rights to approve or request changes", () => {
    expect(capabilitiesFor("approved")).toEqual(["review", "super"]);
    expect(capabilitiesFor("changes_requested")).toEqual(["review", "super"]);
  });

  it("requires publish rights for every live-state change", () => {
    for (const status of ["scheduled", "published", "unpublished", "archived"] as ContentStatus[]) {
      expect(capabilitiesFor(status)).toEqual(["publish", "super"]);
    }
  });
});

describe("canTransition", () => {
  it("lets an editor submit for review", () => {
    expect(canTransition({ from: "draft", to: "in_review", capabilities: EDITOR })).toEqual({
      allowed: true,
    });
  });

  it("blocks an editor from approving", () => {
    expect(canTransition({ from: "in_review", to: "approved", capabilities: EDITOR })).toEqual({
      allowed: false,
      reason: "insufficient_role",
    });
  });

  it("blocks an editor and a reviewer from publishing", () => {
    expect(canTransition({ from: "approved", to: "published", capabilities: EDITOR })).toEqual({
      allowed: false,
      reason: "insufficient_role",
    });
    expect(canTransition({ from: "approved", to: "published", capabilities: REVIEWER })).toEqual({
      allowed: false,
      reason: "insufficient_role",
    });
    expect(canTransition({ from: "approved", to: "published", capabilities: PUBLISHER })).toEqual({
      allowed: true,
    });
  });

  it("blocks self-approval", () => {
    expect(
      canTransition({
        from: "in_review",
        to: "approved",
        capabilities: REVIEWER,
        actorId: "user-1",
        contentCreatedBy: "user-1",
      }),
    ).toEqual({ allowed: false, reason: "self_approval" });
  });

  it("allows a different reviewer to approve", () => {
    expect(
      canTransition({
        from: "in_review",
        to: "approved",
        capabilities: REVIEWER,
        actorId: "user-2",
        contentCreatedBy: "user-1",
      }),
    ).toEqual({ allowed: true });
  });

  it("lets a super admin override self-approval (documented emergency path)", () => {
    expect(
      canTransition({
        from: "in_review",
        to: "approved",
        capabilities: SUPER,
        actorId: "user-1",
        contentCreatedBy: "user-1",
      }),
    ).toEqual({ allowed: true });
  });

  it("only lets a super admin restore archived content", () => {
    expect(canTransition({ from: "archived", to: "draft", capabilities: PUBLISHER })).toEqual({
      allowed: false,
      reason: "insufficient_role",
    });
    expect(canTransition({ from: "archived", to: "draft", capabilities: SUPER })).toEqual({
      allowed: true,
    });
  });

  it("reports an illegal transition before checking roles", () => {
    expect(canTransition({ from: "draft", to: "published", capabilities: SUPER })).toEqual({
      allowed: false,
      reason: "invalid_transition",
    });
  });
});

describe("isEditableByEditor", () => {
  it("permits body edits only before approval", () => {
    expect(isEditableByEditor("draft")).toBe(true);
    expect(isEditableByEditor("changes_requested")).toBe(true);
    expect(isEditableByEditor("approved")).toBe(false);
    expect(isEditableByEditor("published")).toBe(false);
  });
});
