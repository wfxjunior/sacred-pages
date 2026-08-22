import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "./LanguageSelector";
import { LumenaLogo } from "./LumenaLogo";
import { LegalConsent } from "./LegalConsent";
import authSide from "@/assets/auth-side.jpg.asset.json";

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

      <main className="flex flex-1 items-start justify-center gap-14 px-5 pb-8 pt-[clamp(16px,6vh,64px)] lg:items-center lg:gap-20 lg:px-10 xl:gap-28">
        {/* Desktop only: a framed plate of the journal, so the sign-in page
            feels like the cover of the product rather than a bare form. */}
        <aside className="hidden lg:block lg:w-[min(46vw,520px)]">
          <figure className="relative">
            {/* Outer gold hairline frame with a paper mat inside. */}
            <div
              className="relative rounded-[4px] p-[10px]"
              style={{
                background: "color-mix(in oklab, var(--parchment) 92%, white)",
                boxShadow:
                  "0 1px 0 rgba(255,255,255,0.7) inset, 0 30px 60px -30px rgba(31,29,27,0.35), 0 2px 10px -4px rgba(31,29,27,0.18)",
                border: "1px solid color-mix(in oklab, var(--gold) 38%, transparent)",
              }}
            >
              <div
                className="overflow-hidden rounded-[2px]"
                style={{ border: "1px solid color-mix(in oklab, var(--ink) 12%, transparent)" }}
              >
                <img
                  src={authSide.url}
                  alt="An open journal on linen with an olive branch in warm morning light"
                  width={1024}
                  height={1536}
                  loading="lazy"
                  className="block aspect-[4/5] w-full object-cover"
                />
              </div>
              {/* Corner ticks — a printer's registration detail. */}
              {[
                "left-[6px] top-[6px] border-l border-t",
                "right-[6px] top-[6px] border-r border-t",
                "left-[6px] bottom-[6px] border-b border-l",
                "right-[6px] bottom-[6px] border-b border-r",
              ].map((pos) => (
                <span
                  key={pos}
                  aria-hidden
                  className={`pointer-events-none absolute h-3.5 w-3.5 ${pos}`}
                  style={{ borderColor: "color-mix(in oklab, var(--gold) 70%, transparent)" }}
                />
              ))}
            </div>
            <figcaption className="mt-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              <span aria-hidden className="h-px w-8" style={{ background: "var(--gold)" }} />
              {t("brand.name")}
            </figcaption>
          </figure>
        </aside>

        <div className="w-full max-w-[380px] text-center lg:shrink-0">

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
            <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>
          )}
          {/* One legal notice per auth screen, always in the same slot. */}
          <LegalConsent className="mx-auto mt-5 max-w-[300px] text-center" />
        </div>
      </main>

      {/* Terms & Privacy already appear in the consent notice above, so the
          footer only carries the remaining link plus the copyright line. */}
      <footer className="shrink-0 px-5 pt-8 [padding-bottom:calc(20px+env(safe-area-inset-bottom))]">
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>© {new Date().getFullYear()} {t("brand.name")}</span>
          <span aria-hidden>·</span>
          <Link to="/cookies" className="underline underline-offset-4 hover:opacity-80">
            {t("footer.cookies")}
          </Link>
        </p>
      </footer>
    </div>
  );
}