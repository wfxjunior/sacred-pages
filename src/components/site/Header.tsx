import { Link, useRouterState } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "./LanguageSelector";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandMark } from "./BrandMark";

export function Header() {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const nav = [
    { to: "/", label: t("nav.home") },
    { to: "/today", label: t("nav.today") },
    { to: "/collections", label: t("nav.collections") },
    { to: "/about", label: t("nav.about") },
    { to: "/pricing", label: t("nav.pricing") },
  ];
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark />
          <span className="font-serif text-[15px] font-semibold uppercase tracking-[0.15em] leading-tight">
            {t("brand.name")}
          </span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`text-sm transition ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSelector />
          <Link to="/signin" className="text-sm text-muted-foreground transition hover:text-foreground">
            {t("cta.signin")}
          </Link>
          <Button asChild size="sm">
            <Link to="/signup">{t("cta.startFree")}</Link>
          </Button>
        </div>
        <button
          className="inline-flex items-center justify-center rounded-md p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
              <LanguageSelector />
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/signin">{t("cta.signin")}</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/signup">{t("cta.startFree")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
