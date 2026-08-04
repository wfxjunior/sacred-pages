import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

// Profile photos live in a private `avatars` bucket, one folder per user id.
// We persist the storage PATH in profiles.avatar_url and mint a short-lived
// signed URL when rendering, so a photo is never guessable from a raw URL.

const BUCKET = "avatars";
const SIGNED_TTL_SECONDS = 60 * 60;

export const AVATAR_MAX_BYTES = 4 * 1024 * 1024;
export const AVATAR_ACCEPT = "image/png,image/jpeg,image/webp";

export async function resolveAvatarUrl(pathOrUrl: string | null): Promise<string | null> {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (!isSupabaseConfigured()) return null;
  const { data } = await getSupabaseClient()
    .storage.from(BUCKET)
    .createSignedUrl(pathOrUrl, SIGNED_TTL_SECONDS);
  return data?.signedUrl ?? null;
}

/** Uploads a new profile photo and points the profile row at it. Returns a signed URL. */
export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  const supabase = getSupabaseClient();
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${userId}/${Date.now()}.${ext || "jpg"}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: true, contentType: file.type });
  if (uploadError) throw uploadError;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_url: path })
    .eq("id", userId);
  if (profileError) throw profileError;

  return resolveAvatarUrl(path);
}

export async function removeAvatar(userId: string, path: string | null): Promise<void> {
  const supabase = getSupabaseClient();
  if (path && !/^https?:\/\//i.test(path)) {
    await supabase.storage.from(BUCKET).remove([path]);
  }
  await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId);
}
