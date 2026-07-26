import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <p className="font-serif text-lg">{t("brand.name")}</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{t("brand.tagline")}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-walnut">Product</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/today" className="hover:text-foreground">{t("nav.today")}</Link></li>
            <li><Link to="/collections" className="hover:text-foreground">{t("nav.collections")}</Link></li>
            <li><Link to="/pricing" className="hover:text-foreground">{t("nav.pricing")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-walnut">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">{t("nav.about")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-walnut">Account</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/signin" className="hover:text-foreground">{t("cta.signin")}</Link></li>
            <li><Link to="/signup" className="hover:text-foreground">{t("cta.startFree")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-5 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t("brand.name")}. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}