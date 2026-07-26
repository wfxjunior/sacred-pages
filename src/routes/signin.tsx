import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/site/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
      sub="Continue where you left off."
      footer={
        <>
          {t("auth.noAccount")}{" "}
          <Link to="/signup" className="underline underline-offset-4">{t("cta.startFree")}</Link>
        </>
      }
    >
      <Field label={t("auth.email")} type="email" placeholder="you@example.com" />
      <Field label={t("auth.password")} type="password" placeholder="••••••••" />
      <div className="text-right text-xs">
        <Link to="/forgot" className="text-muted-foreground hover:text-foreground">{t("auth.forgotLink")}</Link>
      </div>
      <Button className="w-full" asChild>
        <Link to="/my-journey">{t("auth.continue")}</Link>
      </Button>
    </AuthLayout>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <Input {...props} />
    </label>
  );
}