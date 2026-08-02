export type CompanionshipStatus = "pending" | "active" | "declined" | "archived";

export interface Companionship {
  id: string;
  inviter_id: string;
  invitee_email: string;
  invitee_user_id: string | null;
  relationship: string;
  personal_message: string | null;
  status: CompanionshipStatus;
  token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface CompanionshipProfile {
  display_name: string | null;
  avatar_url: string | null;
}

export interface CompanionshipWithProfiles extends Companionship {
  inviter: CompanionshipProfile | null;
  invitee: CompanionshipProfile | null;
}

export interface CompanionshipPreview {
  relationship: string | null;
  personal_message: string | null;
  inviter_name: string | null;
  inviter_email: string | null;
  status: string | null;
  expires_at: string | null;
}

export interface CreateInvitationInput {
  email: string;
  relationship: string;
  message?: string;
}
