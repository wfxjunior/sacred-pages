import { Link, useRouterState } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "./LanguageSelector";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { DarkModeToggle } from "./DarkModeToggle";
import { NotificationsMenu } from "./NotificationsMenu";

type NavItem = { href: string; label: string; type: "route" | "hash" };

export function Header() {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHero = pathname === "/";

  useEffect(() => {
    if (!isHero) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHero]);

  const nav: NavItem[] = [
    { href: "/", label: t("nav.home"), type: "route" },
    { href: "/features", label: t("nav.features"), type: "route" },
    { href: "/together", label: "Together", type: "route" },
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

  const headerBase = isHero
    ? `fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-[#E4E0D6] bg-white/80 backdrop-blur-xl"
          : "bg-[#FCFBF8]/60"
      }`
    : "sticky top-0 z-40 w-full border-b border-border/50 bg-background/75 backdrop-blur-xl";

  const navLink = (active: boolean) =>
    `text-[13px] font-medium transition ${
      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <header className={headerBase}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark variant={isHero ? "light" : "default"} />
          <span
            className={`hidden font-serif text-[15px] font-semibold tracking-tight sm:inline ${
              isHero ? "text-white" : ""
            }`}
          >
            {t("brand.name")}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {nav.map((n) => {
            const active = n.type === "route" && pathname === n.href;
            return renderLink(n, navLink(active));
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSelector variant={isHero ? "light" : "default"} />
          <NotificationsMenu variant={isHero ? "light" : "default"} />
          <DarkModeToggle variant={isHero ? "light" : "default"} />
          <Link
            to="/signin"
            className={`px-3 text-[13px] font-medium transition ${
              isHero
                ? "text-white/80 hover:text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("cta.signin")}
          </Link>
          <Button
            asChild
            size="sm"
            className={`rounded-full px-4 ${
              isHero
                ? "bg-white text-zinc-950 hover:bg-white/90"
                : ""
            }`}
          >
            <Link to="/signup">{t("cta.startFree")}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <NotificationsMenu variant={isHero ? "light" : "default"} />
          <DarkModeToggle variant={isHero ? "light" : "default"} />
          <LanguageSelector variant={isHero ? "light" : "default"} />
          <button
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
              isHero
                ? "border-white/20 text-white hover:bg-white/10"
                : "border-border/60 text-foreground hover:bg-secondary"
            }`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className={`border-t lg:hidden ${
            isHero
              ? "border-white/10 bg-zinc-950/90 backdrop-blur-xl"
              : "border-border/50 bg-background"
          }`}
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4 sm:px-6">
            {nav.map((n) =>
              renderLink(
                n,
                `rounded-lg px-3 py-2.5 text-sm ${
                  isHero
                    ? "text-white/80 hover:bg-white/10 hover:text-white"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`,
                () => setOpen(false),
              ),
            )}
            <div
              className={`mt-3 flex items-center gap-2 border-t pt-3 ${
                isHero ? "border-white/10" : "border-border/50"
              }`}
            >
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={`flex-1 ${
                  isHero ? "text-white/80 hover:bg-white/10 hover:text-white" : ""
                }`}
              >
                <Link to="/signin">{t("cta.signin")}</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className={`flex-1 rounded-full ${
                  isHero ? "bg-white text-zinc-950 hover:bg-white/90" : ""
                }`}
              >
                <Link to="/signup">{t("cta.startFree")}</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
