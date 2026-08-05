import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "./LanguageSelector";
import {
  BookOpen,
  Compass,
  Heart,
  Home,
  PanelLeft,
  Puzzle,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { LumenaLogo } from "./LumenaLogo";
import { NotificationsMenu } from "./NotificationsMenu";

const COLLAPSE_KEY = "lumena:sidebar:collapsed";

export function AppShell({
  children,
  mainClassName,
}: {
  children: ReactNode;
  mainClassName?: string;
}) {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };
  const items = [
    { to: "/my-journey", label: t("nav.myJourney"), icon: Home },
    { to: "/today", label: t("nav.today"), icon: Sparkles },
    { to: "/play", label: t("nav.play"), icon: Puzzle },
    { to: "/collections", label: t("nav.collections"), icon: BookOpen },
    { to: "/together", label: t("nav.together"), icon: Users },
    { to: "/progress", label: t("nav.progress"), icon: Compass },
    { to: "/favorites", label: t("nav.favorites"), icon: Heart },
    { to: "/profile", label: t("nav.profile"), icon: User },
  ];
  // The bottom bar carries the five destinations a reader actually needs on a
  // phone; Together and Favorites stay in the sidebar and the profile page.
  const mobileOrder = ["/my-journey", "/today", "/collections", "/progress", "/profile"];
  const mobileItems = mobileOrder
    .map((to) => items.find((i) => i.to === to))
    .filter((i): i is (typeof items)[number] => Boolean(i));

  return (
    <div className="journey-warm min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1400px] flex-col md:flex-row">
        <aside
          className={`hidden shrink-0 border-r border-border/60 transition-[width] duration-200 md:block ${
            collapsed ? "w-[60px]" : "w-[196px]"
          }`}
        >
          <div className="sticky top-0 flex h-screen flex-col">
            <div
              className={`flex items-center gap-1 py-5 ${collapsed ? "justify-center px-2" : "justify-between px-4"}`}
            >
              {!collapsed && (
                <Link to="/my-journey" className="flex min-w-0 items-center">
                  <LumenaLogo size="sm" />
                </Link>
              )}
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground/70 transition hover:bg-secondary/60 hover:text-foreground"
              >
                <PanelLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            <nav className="flex-1 border-t border-border/50">
              {items.map((i) => {
                const active = pathname === i.to || pathname.startsWith(`${i.to}/`);
                const Icon = i.icon;
                return (
                  <Link
                    key={i.to}
                    to={i.to}
                    title={collapsed ? i.label : undefined}
                    className={`flex items-center border-b border-border/50 text-[13px] transition ${
                      collapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-2.5"
                    } ${
                      active
                        ? "bg-secondary/70 text-foreground"
                        : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.5} />
                    {!collapsed && <span className="truncate">{i.label}</span>}
                  </Link>
                );
              })}
            </nav>
            <div className={`border-t border-border/50 py-3 ${collapsed ? "px-2" : "px-4"}`}>
              <div
                className={`flex items-center gap-2 ${collapsed ? "flex-col" : "justify-between"}`}
              >
                <Link
                  to="/settings"
                  title={t("nav.settings")}
                  className="truncate text-xs text-muted-foreground hover:text-foreground"
                >
                  {collapsed ? "···" : t("nav.settings")}
                </Link>
                <LanguageSelector />
              </div>
            </div>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border/60 px-6 py-4 md:hidden">
            <Link to="/my-journey" className="flex items-center">
              <LumenaLogo size="sm" />
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <NotificationsMenu />
            </div>
          </header>
          <main className={`min-w-0 flex-1 px-6 py-8 md:px-10 md:py-12 ${mainClassName ?? ""}`}>{children}</main>
          <nav className="sticky bottom-0 grid grid-cols-5 border-t border-border/60 bg-background md:hidden">
            {mobileItems.map((i) => {
              const active = pathname === i.to || pathname.startsWith(`${i.to}/`);
              const Icon = i.icon;
              return (
                <Link
                  key={i.to}
                  to={i.to}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[10px] ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {i.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}