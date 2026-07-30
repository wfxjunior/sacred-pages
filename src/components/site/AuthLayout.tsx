import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "./LanguageSelector";
import { LumenaLogo } from "./LumenaLogo";

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
          <span className="hidden md:block">
            <LumenaLogo size="md" />
          </span>
        </Link>
        <LanguageSelector />
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-6">
        <div className="w-full max-w-[380px] text-center">
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
          <div className="mt-6 space-y-3 text-left">{children}</div>
          {footer && (
            <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>
          )}
        </div>
      </main>

      <footer className="shrink-0 px-5 pb-6 pt-2 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        © {new Date().getFullYear()} · {t("brand.name")}
      </footer>
    </div>
  );
}