import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Lock, LogIn, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authService } from "@/lib/auth/service";
import type { AdminSession } from "@/lib/auth/useAdminSession";

// Renders admin content only for signed-in content staff.
//
// IMPORTANT: this is a user-experience guard, not a security boundary. Every
// table the admin screens touch is protected by RLS, so bypassing this
// component reveals nothing — the queries themselves return no rows.

export function AdminGate({ session, children }: { session: AdminSession; children: ReactNode }) {
  if (!authService.isConfigured()) {
    return (
      <EmptyState
        icon={<ServerCrash className="h-5 w-5" aria-hidden />}
        title="Content backend not configured"
        body="Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then apply the migrations in supabase/migrations to use Content Studio."
      />
    );
  }

  if (session.status === "loading") {
    return (
      <div className="space-y-4" role="status" aria-live="polite" aria-busy="true">
        <span className="sr-only">Loading Content Studio…</span>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (session.status === "unauthenticated") {
    return (
      <EmptyState
        icon={<LogIn className="h-5 w-5" aria-hidden />}
        title="Sign in to continue"
        body="Content Studio is available to editorial staff."
        action={
          <Button asChild size="sm">
            <Link to="/signin">Sign in</Link>
          </Button>
        }
      />
    );
  }

  if (session.status === "forbidden") {
    return (
      <EmptyState
        icon={<Lock className="h-5 w-5" aria-hidden />}
        title="You don't have access to Content Studio"
        body="Your account is signed in but has no editorial role. Ask a super admin to grant you access."
        action={
          <Button asChild size="sm" variant="outline">
            <Link to="/my-journey">Back to my journey</Link>
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
}

function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
      <div
        className="mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl"
        style={{
          background: "color-mix(in oklab, var(--gold) 12%, transparent)",
          color: "var(--walnut)",
        }}
      >
        {icon}
      </div>
      <h2 className="font-serif text-lg">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
