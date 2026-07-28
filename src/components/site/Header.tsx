import { Link, useRouterState } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "./LanguageSelector";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { DarkModeToggle } from "./DarkModeToggle";

type NavItem = { href: string; label: string; type: "route" | "hash" };

export function Header() {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const nav: NavItem[] = [
    { href: "/", label: t("nav.home"), type: "route" },
    { href: "/#features", label: t("nav.features"), type: "hash" },
    { href: "/today", label: t("nav.today"), type: "route" },
    { href: "/collections", label: t("nav.collections"), type: "route" },
    { href: "/pricing", label: t("nav.pricing"), type: "route" },
    { href: "/about", label: t("nav.about"), type: "route" },
    { href: "/#faq", label: t("nav.help"), type: "hash" },
  ];

  const renderLink = (n: NavItem, className: string, onClick?: () => void) => {
    if (n.type === "route") {
      return (
        <Link key={n.href} to={n.href} onClick={onClick} className={className}>
          {n.label}
        </Link>
      );
    }
    return (
      <a key={n.href} href={n.href} onClick={onClick} className={className}>
        {n.label}
      </a>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark />
          <span className="hidden font-serif text-[15px] font-semibold tracking-tight sm:inline">
            {t("brand.name")}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {nav.map((n) => {
            const active = n.type === "route" && pathname === n.href;
            const cls = `text-[13px] font-medium transition ${
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`;
            return renderLink(n, cls);
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSelector />
          <DarkModeToggle />
          <Link
            to="/signin"
            className="px-3 text-[13px] font-medium text-muted-foreground transition hover:text-foreground"
          >
            {t("cta.signin")}
          </Link>
          <Button asChild size="sm" className="rounded-full px-4">
            <Link to="/signup">{t("cta.startFree")}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <DarkModeToggle />
          <LanguageSelector />
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/50 bg-background lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4 sm:px-6">
            {nav.map((n) =>
              renderLink(
                n,
                "rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground",
                () => setOpen(false),
              ),
            )}
            <div className="mt-3 flex items-center gap-2 border-t border-border/50 pt-3">
              <Button asChild variant="ghost" size="sm" className="flex-1">
                <Link to="/signin">{t("cta.signin")}</Link>
              </Button>
              <Button asChild size="sm" className="flex-1 rounded-full">
                <Link to="/signup">{t("cta.startFree")}</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
