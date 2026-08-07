import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type {
  Companionship,
  CompanionshipPreview,
  CompanionshipProfile,
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

/**
 * `companionships` has no foreign key to `profiles` (its keys point at
 * auth.users), so PostgREST cannot embed them. Profiles are fetched in a
 * second query and stitched in by user id.
 */
async function attachProfiles(
  supabase: ReturnType<typeof createClient<Database>>,
  rows: Companionship[],
): Promise<CompanionshipWithProfiles[]> {
  const ids = Array.from(
    new Set(rows.flatMap((r) => [r.inviter_id, r.invitee_user_id].filter(Boolean) as string[])),
  );
  const byId = new Map<string, CompanionshipProfile>();
  if (ids.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", ids);
    for (const p of data ?? []) {
      byId.set(p.id, { display_name: p.display_name, avatar_url: p.avatar_url, email: null });
    }
  }
  return rows.map((row) => ({
    ...row,
    inviter: byId.get(row.inviter_id) ?? null,
    invitee: row.invitee_user_id ? (byId.get(row.invitee_user_id) ?? null) : null,
  }));
}

export async function listMyCompanions(
  supabase: ReturnType<typeof createClient<Database>>,
  userId: string,
  email: string,
): Promise<CompanionshipWithProfiles[]> {
  const { data, error } = await supabase
    .from("companionships")
    .select("*")
    .or(`inviter_id.eq.${userId},invitee_user_id.eq.${userId},invitee_email.eq.${email}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return attachProfiles(supabase, (data ?? []) as unknown as Companionship[]);
}

export async function getInvitationByToken(
  supabase: ReturnType<typeof createClient<Database>>,
  token: string,
): Promise<CompanionshipWithProfiles | null> {
  const { data, error } = await supabase
    .from("companionships")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) return null;
  const [row] = await attachProfiles(supabase, [data as unknown as Companionship]);
  return row ?? null;
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

/** Archives a pending invitation. RLS allows only the inviter to update it. */
export async function cancelInvitation(
  supabase: ReturnType<typeof createClient<Database>>,
  token: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("companionships")
    .update({ status: "archived" })
    .eq("token", token)
    .eq("status", "pending");
  if (error) throw error;
  return true;
}
