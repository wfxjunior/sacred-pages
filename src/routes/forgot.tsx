import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/site/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/forgot")({
  head: () => ({
    meta: [
      { title: "Reset password — Lumen Verse" },
      { name: "description", content: "Reset your Lumen Verse password." },
      { property: "og:title", content: "Reset password — Lumen Verse" },
      { property: "og:description", content: "Reset your Lumen Verse password." },
    ],
  }),
  component: Forgot,
});

function Forgot() {
  const { t } = useI18n();
  return (
    <AuthLayout
      title={t("auth.forgot")}
      sub={t("auth.forgot.sub")}
      footer={
        <Link to="/signin" className="underline underline-offset-4">
          {t("cta.signin")}
        </Link>
      }
    >
      <label className="grid gap-1.5 text-sm">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{t("auth.email")}</span>
        <Input type="email" placeholder="you@example.com" />
      </label>
      <Button className="w-full">{t("auth.continue")}</Button>
    </AuthLayout>
  );
}