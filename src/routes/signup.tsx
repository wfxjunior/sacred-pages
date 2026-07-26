import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/site/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
      sub="It takes less than a minute."
      footer={
        <>
          {t("auth.haveAccount")}{" "}
          <Link to="/signin" className="underline underline-offset-4">{t("cta.signin")}</Link>
        </>
      }
    >
      <Field label={t("auth.name")} placeholder="Samuel Reid" />
      <Field label={t("auth.email")} type="email" placeholder="you@example.com" />
      <Field label={t("auth.password")} type="password" placeholder="••••••••" />
      <Button className="w-full" asChild>
        <Link to="/my-journey">{t("cta.startJourney")}</Link>
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