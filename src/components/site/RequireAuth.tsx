import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { rememberIntendedPath } from "@/lib/auth/redirect";

/**
 * Account-only pages (profile, settings, progress…) render nothing for a
 * visitor without a session and send them to sign in, keeping the intended
 * destination so they land back here afterwards.
 *
 * The check is client-side on purpose: the Supabase session lives in
 * localStorage, which the server cannot read, so a server-side gate on these
 * SSR routes would bounce signed-in readers on a hard refresh.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const href = useRouterState({ select: (s) => s.location.href });

  useEffect(() => {
    if (user.loading || user.userId) return;
    rememberIntendedPath(href);
    void navigate({ to: "/signin", replace: true });
  }, [user.loading, user.userId, href, navigate]);

  if (user.loading || !user.userId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground/60" />
      </div>
    );
  }

  return <>{children}</>;
}

/** `head()` meta shared by every account-only page. */
export const PRIVATE_ROUTE_META = { name: "robots", content: "noindex, nofollow" } as const;
