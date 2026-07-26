import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "./LanguageSelector";

export function AuthLayout({ title, sub, children, footer }: { title: string; sub?: string; children: ReactNode; footer?: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-10 md:flex"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--gold) 12%, var(--parchment)) 0%, var(--parchment) 100%)",
        }}
      >
        <Link to="/" className="font-serif text-lg">{t("brand.name")}</Link>
        <blockquote className="max-w-md">
          <p className="font-serif text-3xl leading-tight">
            "Your word is a lamp for my feet, a light on my path."
          </p>
          <footer className="mt-4 text-xs uppercase tracking-widest" style={{ color: "var(--walnut)" }}>Psalm 119:105</footer>
        </blockquote>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {t("brand.name")}</p>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 md:px-10">
          <Link to="/" className="font-serif text-base md:hidden">{t("brand.name")}</Link>
          <span className="hidden md:block" />
          <LanguageSelector />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16 md:px-10">
          <div className="w-full max-w-sm">
            <h1 className="font-serif text-3xl">{title}</h1>
            {sub && <p className="mt-2 text-sm text-muted-foreground">{sub}</p>}
            <div className="mt-8 space-y-4">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}