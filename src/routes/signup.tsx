import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/site/AuthLayout";
import { GoogleAuthButton } from "@/components/site/GoogleAuthButton";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — Lumen Verse" },
      { name: "description", content: "Begin your daily journey through God's Word." },
      { property: "og:title", content: "Create your account — Lumen Verse" },
      { property: "og:description", content: "Start free — build a peaceful daily rhythm in Scripture." },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const { t } = useI18n();
  return (
    <AuthLayout
      title={t("auth.signup")}
      sub={t("auth.signup.sub")}
      footer={
        <>
          {t("auth.haveAccount")}{" "}
          <Link to="/signin" className="underline underline-offset-4" style={{ color: "var(--ink)" }}>
            {t("cta.signin")}
          </Link>
        </>
      }
    >
      <GoogleAuthButton label="Continue with Google" />
      <p className="pt-1 text-[11px] leading-relaxed text-muted-foreground">
        First journey free · No password required
      </p>
    </AuthLayout>
  );
}