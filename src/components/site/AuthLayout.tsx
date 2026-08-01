import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "./LanguageSelector";
import { LumenaLogo } from "./LumenaLogo";
import { LegalConsent } from "./LegalConsent";

export function AuthLayout({
  title,
  sub,
  children,
  footer,
}: {
  title: string;
  sub?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{
        background:
          "radial-gradient(1200px 600px at 15% -10%, color-mix(in oklab, var(--gold) 14%, transparent) 0%, transparent 60%), radial-gradient(900px 500px at 100% 100%, color-mix(in oklab, var(--dusty-blue) 10%, transparent) 0%, transparent 55%), var(--parchment)",
      }}
    >
      <header className="flex shrink-0 items-center justify-between px-5 py-4 md:px-8 md:py-5">
        <Link to="/" aria-label="Lumena" className="inline-flex items-center">
          <span className="md:hidden">
            <LumenaLogo size="sm" />
          </span>
          <span className="hidden md:inline-flex">
            <LumenaLogo size="md" />
          </span>
        </Link>
        <LanguageSelector />
      </header>

      <main className="flex flex-1 items-start justify-center px-5 pb-8 pt-[clamp(16px,6vh,64px)]">
        <div className="w-full max-w-[380px] text-center">
          <div className="flex min-h-[76px] flex-col justify-start md:min-h-[84px]">
            <h1
              className="font-serif text-[26px] leading-[1.15] tracking-tight md:text-[30px]"
              style={{ color: "var(--ink)" }}
            >
              {title}
            </h1>
            {sub && (
              <p className="mx-auto mt-2 max-w-[320px] text-[14px] leading-relaxed text-muted-foreground">
                {sub}
              </p>
            )}
          </div>
          <div className="mt-6 space-y-3 text-left">{children}</div>
          {footer && (
            <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
          )}
          {/* One legal notice per auth screen, always in the same slot. */}
          <LegalConsent className="mx-auto mt-4 max-w-[320px] text-center" />
        </div>
      </main>

      <footer className="shrink-0 px-5 pt-10 text-center text-muted-foreground [padding-bottom:calc(24px+env(safe-area-inset-bottom))]">
        <nav className="mb-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px]">
          <Link to="/terms" className="underline underline-offset-4 hover:opacity-80">
            {t("footer.terms")}
          </Link>
          <span aria-hidden>·</span>
          <Link to="/privacy" className="underline underline-offset-4 hover:opacity-80">
            {t("footer.privacy")}
          </Link>
          <span aria-hidden>·</span>
          <Link to="/cookies" className="underline underline-offset-4 hover:opacity-80">
            {t("footer.cookies")}
          </Link>
        </nav>
        <p className="text-[11px] uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} · {t("brand.name")}
        </p>
      </footer>
    </div>
  );
}