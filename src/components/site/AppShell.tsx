import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "./LanguageSelector";
import { BookOpen, Compass, Heart, Home, Sparkles, User } from "lucide-react";
import { BrandMark } from "./BrandMark";

export function AppShell({
  children,
  mainClassName,
}: {
  children: ReactNode;
  mainClassName?: string;
}) {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = [
    { to: "/my-journey", label: t("nav.myJourney"), icon: Home },
    { to: "/today", label: t("nav.today"), icon: Sparkles },
    { to: "/collections", label: t("nav.collections"), icon: BookOpen },
    { to: "/progress", label: t("nav.progress"), icon: Compass },
    { to: "/favorites", label: t("nav.favorites"), icon: Heart },
    { to: "/profile", label: t("nav.profile"), icon: User },
  ];
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1400px] flex-col md:flex-row">
        <aside className="hidden w-60 shrink-0 border-r border-border/60 md:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <Link to="/my-journey" className="flex items-center gap-2.5 px-6 py-6">
              <BrandMark />
              <span className="font-serif text-[13px] font-semibold uppercase tracking-[0.15em] leading-tight">
                {t("brand.name")}
              </span>
            </Link>
            <nav className="flex-1 space-y-1 px-3">
              {items.map((i) => {
                const active = pathname === i.to;
                const Icon = i.icon;
                return (
                  <Link
                    key={i.to}
                    to={i.to}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                      active
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {i.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-border/60 p-4">
              <div className="flex items-center justify-between">
                <Link to="/settings" className="text-xs text-muted-foreground hover:text-foreground">
                  {t("nav.settings")}
                </Link>
                <LanguageSelector />
              </div>
            </div>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border/60 px-6 py-4 md:hidden">
            <Link to="/my-journey" className="flex items-center gap-2">
              <BrandMark size={28} />
              <span className="font-serif text-[12px] font-semibold uppercase tracking-[0.15em]">
                {t("brand.name")}
              </span>
            </Link>
            <LanguageSelector />
          </header>
          <main className={`min-w-0 flex-1 px-6 py-8 md:px-10 md:py-12 ${mainClassName ?? ""}`}>{children}</main>
          <nav className="sticky bottom-0 grid grid-cols-5 border-t border-border/60 bg-background md:hidden">
            {items.slice(0, 5).map((i) => {
              const active = pathname === i.to;
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