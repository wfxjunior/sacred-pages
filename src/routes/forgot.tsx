import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AuthLayout } from "@/components/site/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/auth/service";
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
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await authService.requestPasswordReset(
      email.trim(),
      typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined,
    );
    setLoading(false);
    setSent(true);
    toast.success(t("auth.forgot.sent"));
  }

  return (
    <AuthLayout
      title={t("auth.forgot")}
      sub={t("auth.forgot.sub")}
      footer={
        <Link to="/signin" className="underline underline-offset-4">
          {t("auth.backToSignin")}
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-3 text-left">
        <label className="grid gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {t("auth.email")}
          </span>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="h-11 rounded-xl bg-white"
          />
        </label>
        <Button type="submit" disabled={loading} className="h-11 w-full rounded-full">
          {loading ? "…" : t("auth.sendLink")}
        </Button>
        <div className="flex min-h-[20px] items-center justify-center text-center text-xs text-muted-foreground">
          {sent ? <span>{t("auth.forgot.sent")}</span> : null}
        </div>
      </form>
    </AuthLayout>
  );
}