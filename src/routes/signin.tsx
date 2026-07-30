import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/site/AuthLayout";
import { GoogleAuthButton } from "@/components/site/GoogleAuthButton";
import { AuthDivider, EmailAuthForm } from "@/components/site/EmailAuthForm";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — Lumen Verse" },
      { name: "description", content: "Sign in to your daily Scripture journey." },
      { property: "og:title", content: "Sign in — Lumen Verse" },
      { property: "og:description", content: "Return to your daily Scripture journey." },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const { t } = useI18n();
  return (
    <AuthLayout
      title={t("auth.signin")}
      sub={t("auth.signin.sub")}
      footer={
        <>
          {t("auth.noAccount")}{" "}
          <Link to="/signup" className="underline underline-offset-4" style={{ color: "var(--ink)" }}>
            {t("cta.startFree")}
          </Link>
        </>
      }
    >
      <GoogleAuthButton label="Continue with Google" />
      <AuthDivider label="or" />
      <EmailAuthForm mode="signin" />
    </AuthLayout>
  );
}