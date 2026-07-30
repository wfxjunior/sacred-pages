import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AuthLayout } from "@/components/site/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/auth/service";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Lumena" },
      { name: "description", content: "Choose a new password for your Lumena account." },
      { property: "og:title", content: "Set a new password — Lumena" },
      { property: "og:description", content: "Choose a new password for your Lumena account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [valid, setValid] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    // The recovery link puts a session in place (hash or code exchange).
    const stop = authService.onAuthStateChange(() => {});
    authService.getSession().then((session) => {
      if (!active) return;
      const hasRecoveryHash =
        typeof window !== "undefined" && window.location.hash.includes("type=recovery");
      setValid(Boolean(session) || hasRecoveryHash);
      setReady(true);
    });
    return () => {
      active = false;
      stop();
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error(`${t("auth.password")} ≥ 6`);
      return;
    }
    if (password !== confirm) {
      toast.error(t("auth.reset.mismatch"));
      return;
    }
    setLoading(true);
    const result = await authService.updatePassword(password);
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    toast.success(t("auth.reset.success"));
    navigate({ to: "/my-journey" });
  }

  return (
    <AuthLayout
      title={t("auth.reset")}
      sub={t("auth.reset.sub")}
      footer={
        <Link to="/signin" className="underline underline-offset-4">
          {t("auth.backToSignin")}
        </Link>
      }
    >
      {ready && !valid ? (
        <div className="space-y-3 text-left">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("auth.reset.invalid")}
          </p>
          <Link to="/forgot" className="block">
            <Button className="h-11 w-full rounded-full">{t("auth.sendLink")}</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3 text-left">
          <label className="grid gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {t("auth.newPassword")}
            </span>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              minLength={6}
              className="h-11 rounded-xl bg-white"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {t("auth.confirmPassword")}
            </span>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              minLength={6}
              className="h-11 rounded-xl bg-white"
            />
          </label>
          <Button type="submit" disabled={loading || !ready} className="h-11 w-full rounded-full">
            {loading ? "…" : t("auth.continue")}
          </Button>
          <div className="min-h-[20px]" />
        </form>
      )}
    </AuthLayout>
  );
}
