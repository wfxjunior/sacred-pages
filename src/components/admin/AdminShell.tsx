import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Image,
  LayoutDashboard,
  Languages,
  ScrollText,
  Grid3x3,
} from "lucide-react";
import { BrandMark } from "@/components/site/BrandMark";
import { useAdminSession } from "@/lib/auth/useAdminSession";
import { AdminGate } from "./AdminGate";

// Admin chrome. Deliberately reuses the site's tokens (--walnut, --gold,
// border, card) and the existing BrandMark so the admin area feels like part
// of the approved product rather than a bolted-on CMS.

type NavItem = {
  to:
    | "/admin"
    | "/admin/collections"
    | "/admin/journeys"
    | "/admin/templates"
    | "/admin/review"
    | "/admin/calendar"
    | "/admin/translations"
    | "/admin/media"
    | "/admin/audit";
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const NAV: readonly NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/collections", label: "Collections", icon: BookOpen },
  { to: "/admin/journeys", label: "Journeys", icon: FileText },
  { to: "/admin/templates", label: "Puzzle templates", icon: Grid3x3 },
  { to: "/admin/review", label: "Review queue", icon: ClipboardCheck },
  { to: "/admin/calendar", label: "Daily Journey", icon: CalendarDays },
  { to: "/admin/translations", label: "Translations", icon: Languages },
  { to: "/admin/media", label: "Media", icon: Image },
  { to: "/admin/audit", label: "Audit log", icon: ScrollText },
];

export function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const session = useAdminSession();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1500px] flex-col md:flex-row">
        <aside className="hidden w-60 shrink-0 border-r border-border/60 md:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <Link to="/admin" className="flex items-center gap-2.5 px-6 py-6">
              <BrandMark />
              <span className="font-serif text-[13px] font-semibold uppercase leading-tight tracking-[0.15em]">
                Content Studio
              </span>
            </Link>

            <nav className="flex-1 space-y-1 px-3" aria-label="Admin sections">
              {NAV.map((item) => {
                const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] ${
                      active
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-border/60 p-4 text-xs text-muted-foreground">
              <p className="truncate">{session.email ?? "Not signed in"}</p>
              <p className="mt-1 truncate" style={{ color: "var(--walnut)" }}>
                {session.roles.length > 0 ? session.roles.join(", ") : "no roles"}
              </p>
              <Link to="/my-journey" className="mt-3 block underline underline-offset-4">
                Back to the app
              </Link>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-border/60 px-6 py-5 md:px-10 md:py-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="font-serif text-2xl md:text-3xl">{title}</h1>
                {description && (
                  <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
                )}
              </div>
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
          </header>

          <main className="min-w-0 flex-1 px-6 py-8 md:px-10">
            <AdminGate session={session}>{children}</AdminGate>
          </main>
        </div>
      </div>
    </div>
  );
}
