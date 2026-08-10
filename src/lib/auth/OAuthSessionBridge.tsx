import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Completes a full-page Google/OAuth redirect.
 *
 * Outside the editor preview `lovable.auth.signInWithOAuth` navigates the whole
 * page to the broker, so the wrapper never gets to call `setSession()`. The
 * broker returns to our origin carrying the tokens in the hash (implicit) or in
 * the query string. Without this bridge the user "signs in" with Google and
 * lands back on the site still signed out.
 */
export function OAuthSessionBridge() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    const access_token = hash.get("access_token") ?? url.searchParams.get("access_token");
    const refresh_token = hash.get("refresh_token") ?? url.searchParams.get("refresh_token");
    if (!access_token || !refresh_token) return;

    let cancelled = false;
    void (async () => {
      try {
        await supabase.auth.setSession({ access_token, refresh_token });
      } catch {
        return;
      }
      if (cancelled) return;
      // Never leave credentials sitting in the address bar or history.
      for (const key of ["access_token", "refresh_token", "expires_in", "expires_at", "token_type", "provider_token", "type", "state"]) {
        url.searchParams.delete(key);
      }
      url.hash = "";
      window.history.replaceState(null, "", `${url.pathname}${url.search}`);
      if (url.pathname === "/" || url.pathname === "/signin" || url.pathname === "/signup") {
        window.location.replace("/my-journey");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
