import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ContentCapability } from "@/lib/content/status";

// Role resolution. Roles are read from the database (user_roles), never from
// browser state or JWT claims that a client could tamper with. Everything here
// drives UI affordances only — RLS is the real boundary.

export const APP_ROLES = [
  "free_user",
  "premium_user",
  "content_editor",
  "content_reviewer",
  "publication_admin",
  "support_admin",
  "super_admin",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const CONTENT_STAFF_ROLES: readonly AppRole[] = [
  "content_editor",
  "content_reviewer",
  "publication_admin",
  "support_admin",
  "super_admin",
];

export async function fetchUserRoles(userId: string): Promise<AppRole[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await getSupabaseClient()
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error || !data) return [];
  return (data as { role: AppRole }[]).map((r) => r.role);
}

export function isContentStaff(roles: readonly AppRole[]): boolean {
  return roles.some((r) => CONTENT_STAFF_ROLES.includes(r));
}

/** Maps database roles to the capabilities the workflow engine understands. */
export function capabilitiesFromRoles(roles: readonly AppRole[]): ContentCapability[] {
  const capabilities = new Set<ContentCapability>();
  for (const role of roles) {
    if (role === "content_editor") capabilities.add("edit");
    if (role === "content_reviewer") capabilities.add("review");
    if (role === "publication_admin") capabilities.add("publish");
    if (role === "super_admin") {
      capabilities.add("super");
      capabilities.add("edit");
      capabilities.add("review");
      capabilities.add("publish");
    }
  }
  return [...capabilities];
}
