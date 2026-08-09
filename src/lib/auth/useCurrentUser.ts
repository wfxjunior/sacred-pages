import { useEffect, useState } from "react";
import { authService } from "./service";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { resolveAvatarUrl } from "./avatar";

// The signed-in reader as the UI needs it: a display name, an email and an
// initial. Screens must never hardcode a person's name.

export type CurrentUser = {
  loading: boolean;
  userId: string | null;
  email: string | null;
  displayName: string | null;
  initial: string;
  /** Storage path (or legacy absolute URL) stored on the profile row. */
  avatarPath: string | null;
  /** Short-lived signed URL ready to drop into an <img src>. */
  avatarUrl: string | null;
  /** Re-reads the profile — call after changing the photo. */
  refresh: () => void;
};

const INITIAL: CurrentUser = {
  loading: true,
  userId: null,
  email: null,
  displayName: null,
  initial: "?",
  avatarPath: null,
  avatarUrl: null,
  refresh: () => {},
};

/** Best-effort country/locale of the visitor, from the browser only. */
function detectRegion(): { country: string | null; locale: string | null } {
  if (typeof navigator === "undefined") return { country: null, locale: null };
  const locale = navigator.language ?? null;
  const region = locale?.split("-")[1];
  return { country: region ? region.toUpperCase() : null, locale };
}

export function useCurrentUser(): CurrentUser {
  const [user, setUser] = useState<CurrentUser>(INITIAL);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (!isSupabaseConfigured()) {
        if (!cancelled) setUser({ ...INITIAL, loading: false });
        return;
      }
      const session = await authService.getSession();
      if (cancelled) return;
      const authUser = session?.user ?? null;
      if (!authUser) {
        setUser({ ...INITIAL, loading: false });
        return;
      }

      const { data } = await getSupabaseClient()
        .from("profiles")
        .select("display_name, country_code, avatar_url")
        .eq("id", authUser.id)
        .maybeSingle();
      if (cancelled) return;

      const metaName =
        (authUser.user_metadata?.display_name as string | undefined) ??
        (authUser.user_metadata?.full_name as string | undefined) ??
        null;
      const name =
        (data?.display_name as string | undefined) ??
        metaName ??
        authUser.email?.split("@")[0] ??
        null;

      const avatarPath = (data?.avatar_url as string | undefined) ?? null;
      const avatarUrl = await resolveAvatarUrl(avatarPath);
      if (cancelled) return;

      setUser({
        loading: false,
        userId: authUser.id,
        email: authUser.email ?? null,
        displayName: name,
        initial: (name ?? "?").trim().charAt(0).toUpperCase() || "?",
        avatarPath,
        avatarUrl,
        refresh: () => setNonce((n) => n + 1),
      });

      // Record where the reader signs in from, once, so the team can see which
      // countries the audience comes from. Never overwrites an existing value.
      if (!data?.country_code) {
        const { country, locale } = detectRegion();
        if (country) {
          await getSupabaseClient()
            .from("profiles")
            .update({ country_code: country, detected_locale: locale })
            .eq("id", authUser.id);
        }
      }

      // Keep the stored time zone in step with the device. Every "today" and
      // consistency-day calculation reads this, so a traveller (or a reader in
      // Florida whose row still said UTC) sees their own calendar day.
      await syncTimeZone(authUser.id);
    }

    void resolve();
    const unsubscribe = authService.onAuthStateChange(() => void resolve());
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [nonce]);

  return user;
}

function currentDeviceTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

async function syncTimeZone(userId: string): Promise<void> {
  const tz = currentDeviceTimeZone();
  if (!tz) return;
  try {
    const client = getSupabaseClient();
    const { data } = await client
      .from("user_preferences")
      .select("timezone")
      .eq("user_id", userId)
      .maybeSingle();
    if ((data as { timezone: string | null } | null)?.timezone === tz) return;
    await client
      .from("user_preferences")
      .upsert({ user_id: userId, timezone: tz }, { onConflict: "user_id" });
  } catch {
    // A failed sync must never block sign-in; the fallback is the device zone.
  }
}