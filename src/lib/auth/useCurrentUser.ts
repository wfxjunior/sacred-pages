import { useEffect, useState } from "react";
import { authService } from "./service";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

// The signed-in reader as the UI needs it: a display name, an email and an
// initial. Screens must never hardcode a person's name.

export type CurrentUser = {
  loading: boolean;
  userId: string | null;
  email: string | null;
  displayName: string | null;
  initial: string;
};

const INITIAL: CurrentUser = {
  loading: true,
  userId: null,
  email: null,
  displayName: null,
  initial: "?",
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
        .select("display_name, country_code")
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

      setUser({
        loading: false,
        userId: authUser.id,
        email: authUser.email ?? null,
        displayName: name,
        initial: (name ?? "?").trim().charAt(0).toUpperCase() || "?",
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
    }

    void resolve();
    const unsubscribe = authService.onAuthStateChange(() => void resolve());
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return user;
}