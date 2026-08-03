import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LumenaLogo } from "./LumenaLogo";

type NavItem = {
  href: string;
  label: string;
  type: "route" | "hash";
  /** Small, quiet status word. Deliberately not a coloured dot or a count. */
  badge?: string;
};

export function Header() {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
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
    { href: "/collections", label: t("nav.collections"), type: "route" },
    // Scrolls to the landing-page section. Absolute so it also works from
    // another route, where a bare "#living-journal" would go nowhere.
    { href: "/#living-journal", label: t("nav.livingJournal"), type: "hash" },
    { href: "/pricing", label: t("nav.pricing"), type: "route" },
  ];

  const label = (n: NavItem) =>
    n.badge ? (
      <span className="inline-flex items-baseline gap-1.5">
        {n.label}
        <span
          className="rounded-full border px-1.5 py-px text-[9px] font-medium uppercase tracking-[0.12em]"
          style={{
            borderColor: "color-mix(in oklab, var(--gold) 40%, transparent)",
            color: "color-mix(in oklab, var(--gold) 92%, var(--foreground))",
          }}
        >
          {n.badge}
        </span>
      </span>
    ) : (
      n.label
    );

  /**
   * Hash links must not do a full page load. When already on the landing page
   * we smooth-scroll in place; from another route we navigate first and scroll
   * once the section has mounted.
   */
  const scrollToHash = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return false;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  };

  const onHashClick = (href: string, onClick?: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
    const [path, id] = href.split("#");
    const to = path || "/";
    if (pathname === to) {
      scrollToHash(id);
      window.history.replaceState(null, "", `${to}#${id}`);
      return;
    }
    void navigate({ to, hash: id }).then(() => {
      // Two frames: the route component mounts, then layout settles.
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToHash(id)));
    });
  };

  const renderLink = (n: NavItem, className: string, onClick?: () => void) => {
    if (n.type === "route") {
      return (
        <Link key={n.href} to={n.href} onClick={onClick} className={className}>
          {label(n)}
        </Link>
      );
    }
    return (
      <a key={n.href} href={n.href} onClick={onHashClick(n.href, onClick)} className={className}>
        {label(n)}
      </a>
    );
  };

  const headerBase = isHero
    ? `fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "border-b border-[#E4E0D6] bg-white/80 backdrop-blur-xl" : "bg-[#FCFBF8]/60"
      }`
    : "sticky top-0 z-40 w-full border-b border-border/50 bg-background/75 backdrop-blur-xl";

  const navLink = (active: boolean) =>
    `text-[13px] font-medium transition ${
      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <header className={headerBase}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-6">
        {/*
          The brand is Lumena, so the header carries the Lumena tiles — not the
          hero experience name, which stays on the hero headline. Two sizes
          rather than one scaled instance: the tiles are pixel-sized, and a
          compact mark keeps the row from crowding the menu button on a narrow
          phone. Both stay well inside the h-16 row, so the header does not grow.
        */}
        {/*
          h-11 gives a comfortable tap target on a phone without growing the
          h-16 row. The breakpoint switch lives on wrapper spans, not on the
          logo itself: LumenaLogo sets `inline-flex` on its own root, and a
          `hidden` passed alongside it would sit at equal specificity and lose.
        */}
        <Link to="/" className="flex h-11 shrink-0 items-center" aria-label="Lumena">
          <span className="sm:hidden">
            <LumenaLogo size="sm" />
          </span>
          <span className="hidden sm:block">
            <LumenaLogo size="md" />
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {nav.map((n) => {
            const active = n.type === "route" && pathname === n.href;
            return renderLink(n, navLink(active));
          })}
        </nav>

        {/*
          The marketing header stays deliberately bare: navigation, one quiet
          sign-in link and one primary action. Language, theme, notifications
          and fullscreen belong to the reading app (AppShell) and the footer —
          in the hero they only compete with the promise.
        */}
        <div className="hidden items-center gap-4 lg:flex">
          <Link
            to="/signin"
            className="px-3 text-[13px] font-medium text-muted-foreground transition hover:text-foreground"
          >
            {t("cta.signin")}
          </Link>
          <Button
            asChild
            size="sm"
            className="rounded-full bg-[#2B2B2B] px-4 text-white hover:bg-[#2B2B2B]/90"
          >
            <Link to="/signup">{t("cta.startFree")}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background/80 text-foreground shadow-sm backdrop-blur transition hover:bg-secondary"
            onClick={() => setOpen((v) => !v)}
            aria-label={t("header.menu")}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
              <Button
                asChild
                size="sm"
                className="flex-1 rounded-full bg-[#2B2B2B] text-white hover:bg-[#2B2B2B]/90"
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
