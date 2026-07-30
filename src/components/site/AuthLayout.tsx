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
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <Link to="/" aria-label="Lumena" className="inline-flex items-center">
          <LumenaLogo size="md" />
        </Link>
        <LanguageSelector />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-[380px] text-center">
          <h1
            className="font-serif text-[34px] leading-[1.08] tracking-tight md:text-[40px]"
            style={{ color: "var(--ink)" }}
          >
            {title}
          </h1>
          {sub && (
            <p className="mx-auto mt-3 max-w-[320px] text-[15px] leading-relaxed text-muted-foreground">
              {sub}
            </p>
          )}
          <div className="mt-9 space-y-4">{children}</div>
          {footer && (
            <div className="mt-8 text-sm text-muted-foreground">{footer}</div>
          )}
        </div>
      </main>

      <footer className="px-6 pb-8 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        © {new Date().getFullYear()} · {t("brand.name")}
      </footer>
    </div>
  );
}