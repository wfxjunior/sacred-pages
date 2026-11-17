import type { Companionship } from "./types";

export function assertInvitationEmailAllowed(
  invitation: Companionship,
  callerId: string,
  isAdmin: boolean,
  now = Date.now(),
): void {
  if (!isAdmin) throw new Error("Only administrators may send invitation emails");
  if (invitation.inviter_id !== callerId) throw new Error("Invitation not found");
  if (invitation.status !== "pending" || !(Date.parse(invitation.expires_at) > now)) {
    throw new Error("Only pending, unexpired invitations may be emailed");
  }
}