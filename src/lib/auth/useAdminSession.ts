import { useEffect, useState } from "react";
import { authService } from "./service";
import { capabilitiesFromRoles, fetchUserRoles, isContentStaff, type AppRole } from "./roles";
import type { ContentCapability } from "@/lib/content/status";

// Session + roles for admin screens.
//
// This gates what the UI OFFERS, never what the database ALLOWS. Hiding a
// button is a courtesy; RLS policies and workflow triggers are the actual
// authorization boundary, so a user who forges this state still cannot write.

export type AdminSession = {
  status: "loading" | "unauthenticated" | "forbidden" | "ready";
  userId: string | null;
  email: string | null;
  roles: AppRole[];
  capabilities: ContentCapability[];
  isStaff: boolean;
};

const INITIAL: AdminSession = {
  status: "loading",
  userId: null,
  email: null,
  roles: [],
  capabilities: [],
  isStaff: false,
};

export function useAdminSession(): AdminSession {
  const [session, setSession] = useState<AdminSession>(INITIAL);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (!authService.isConfigured()) {
        if (!cancelled) setSession({ ...INITIAL, status: "unauthenticated" });
        return;
      }

      const current = await authService.getSession();
      if (cancelled) return;

      if (!current?.user) {
        setSession({ ...INITIAL, status: "unauthenticated" });
        return;
      }

      const roles = await fetchUserRoles(current.user.id);
      if (cancelled) return;

      const staff = isContentStaff(roles);
      setSession({
        status: staff ? "ready" : "forbidden",
        userId: current.user.id,
        email: current.user.email ?? null,
        roles,
        capabilities: capabilitiesFromRoles(roles),
        isStaff: staff,
      });
    }

    void resolve();
    const unsubscribe = authService.onAuthStateChange(() => void resolve());

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return session;
}
