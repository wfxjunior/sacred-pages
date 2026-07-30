import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

/** Inline "you agree to our Terms and Privacy Policy" notice. */
export function LegalConsent({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const parts = t("auth.agree").split(/(\{terms\}|\{privacy\})/g);

  return (
    <p className={`text-[12px] leading-relaxed text-muted-foreground ${className}`}>
      {parts.map((part, i) => {
        if (part === "{terms}") {
          return (
            <Link key={i} to="/terms" className="underline underline-offset-4" style={{ color: "var(--ink)" }}>
              {t("auth.terms")}
            </Link>
          );
        }
        if (part === "{privacy}") {
          return (
            <Link key={i} to="/privacy" className="underline underline-offset-4" style={{ color: "var(--ink)" }}>
              {t("auth.privacy")}
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}
