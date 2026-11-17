import { describe, expect, it } from "vitest";
import { assertInvitationEmailAllowed } from "./invitation-email-policy";
import type { Companionship } from "./types";

const now = Date.parse("2026-11-17T05:00:00Z");
const invitation: Companionship = {
  id: "invite-1", inviter_id: "owner", invitee_email: "recipient@example.com",
  invitee_user_id: null, relationship: "Friend", personal_message: null,
  status: "pending", token: "token", expires_at: "2026-11-18T05:00:00Z",
  created_at: "2026-11-17T05:00:00Z", updated_at: "2026-11-17T05:00:00Z",
};

describe("invitation email permission", () => {
  it("blocks ordinary signed-in users from sending emails", () => {
    expect(() => assertInvitationEmailAllowed(invitation, "owner", false, now)).toThrow("Only administrators");
  });
  it("allows an administrator to send their own pending invitation", () => {
    expect(() => assertInvitationEmailAllowed(invitation, "owner", true, now)).not.toThrow();
  });
  it("blocks emailing someone else's invitation", () => {
    expect(() => assertInvitationEmailAllowed(invitation, "other", true, now)).toThrow("Invitation not found");
  });
  it("blocks expired invitations", () => {
    expect(() => assertInvitationEmailAllowed({ ...invitation, expires_at: "2026-11-17T05:00:00Z" }, "owner", true, now)).toThrow("unexpired");
  });
  it("blocks accepted, declined and archived invitations", () => {
    for (const status of ["active", "declined", "archived"] as const) {
      expect(() => assertInvitationEmailAllowed({ ...invitation, status }, "owner", true, now)).toThrow("pending");
    }
  });
});