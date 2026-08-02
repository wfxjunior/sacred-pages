import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type {
  Companionship,
  CompanionshipPreview,
  CompanionshipWithProfiles,
  CreateInvitationInput,
} from "./types";

export async function createInvitation(
  supabase: ReturnType<typeof createClient<Database>>,
  userId: string,
  input: CreateInvitationInput,
): Promise<Companionship> {
  const { data, error } = await supabase
    .from("companionships")
    .insert({
      inviter_id: userId,
      invitee_email: input.email.toLowerCase().trim(),
      relationship: input.relationship,
      personal_message: input.message?.trim() ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Companionship;
}

export async function listMyCompanions(
  supabase: ReturnType<typeof createClient<Database>>,
  userId: string,
  email: string,
): Promise<CompanionshipWithProfiles[]> {
  const { data, error } = await supabase
    .from("companionships")
    .select(
      "*, inviter:profiles!companionships_inviter_id_fkey(display_name, avatar_url, email), invitee:profiles!companionships_invitee_user_id_fkey(display_name, avatar_url, email)",
    )
    .or(
      `inviter_id.eq.${userId},invitee_user_id.eq.${userId},invitee_email.eq.${email}`,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as CompanionshipWithProfiles[];
}

export async function getInvitationByToken(
  supabase: ReturnType<typeof createClient<Database>>,
  token: string,
): Promise<CompanionshipWithProfiles | null> {
  const { data, error } = await supabase
    .from("companionships")
    .select(
      "*, inviter:profiles!companionships_inviter_id_fkey(display_name, avatar_url), invitee:profiles!companionships_invitee_user_id_fkey(display_name, avatar_url)",
    )
    .eq("token", token)
    .single();
  if (error) return null;
  return data as unknown as CompanionshipWithProfiles;
}

export async function getInvitationPreview(
  supabase: ReturnType<typeof createClient<Database>>,
  token: string,
): Promise<CompanionshipPreview | null> {
  const { data, error } = await supabase.rpc("get_companionship_preview", {
    _token: token,
  });
  if (error) return null;
  if (!data || Array.isArray(data) === false) return null;
  const rows = data as CompanionshipPreview[];
  return rows[0] ?? null;
}

export async function acceptInvitation(
  supabase: ReturnType<typeof createClient<Database>>,
  token: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("accept_companionship", {
    _token: token,
  });
  if (error) throw error;
  return data ?? false;
}
