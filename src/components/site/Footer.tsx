import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { BrandMark } from "./BrandMark";

export function Footer() {
  const { t } = useI18n();
  const heading =
    "text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/80";
  const item = "text-sm text-muted-foreground transition hover:text-foreground";
  return (
    <footer className="border-t border-border/60 bg-[color:var(--surface-2)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <span className="font-serif text-lg tracking-tight">
              {t("brand.name")}
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {t("brand.tagline")}
          </p>
        </div>
        <div>
          <p className={heading}>{t("footer.product")}</p>
          <ul className="mt-4 space-y-2.5">
            <li><Link to="/today" className={item}>{t("nav.today")}</Link></li>
            <li><Link to="/collections" className={item}>{t("nav.collections")}</Link></li>
            <li><Link to="/pricing" className={item}>{t("nav.pricing")}</Link></li>
            <li><a href="/#features" className={item}>{t("nav.features")}</a></li>
          </ul>
        </div>
        <div>
          <p className={heading}>{t("footer.company")}</p>
          <ul className="mt-4 space-y-2.5">
            <li><Link to="/about" className={item}>{t("nav.about")}</Link></li>
            <li><a href="/#faq" className={item}>{t("footer.help")}</a></li>
            <li><a href="mailto:hello@journeys.app" className={item}>{t("footer.contact")}</a></li>
          </ul>
        </div>
        <div>
          <p className={heading}>{t("footer.legal")}</p>
          <ul className="mt-4 space-y-2.5">
            <li><Link to="/privacy" className={item}>{t("footer.privacy")}</Link></li>
            <li><Link to="/terms" className={item}>{t("footer.terms")}</Link></li>
            <li><Link to="/cookies" className={item}>{t("footer.cookies")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-5 py-5 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} {t("brand.name")}. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}