import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/auth/service";
import { useI18n } from "@/lib/i18n";

export function EmailAuthForm({ mode }: { mode: "signin" | "signup" }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Signup with email confirmation returns no session; the reader must see a
  // persistent "check your email" state, not a toast that slips by while the
  // form silently stays put.
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim() || password.length < 6) {
      toast.error(t("auth.password") + " ≥ 6");
      return;
    }
    setLoading(true);
    const result =
      mode === "signup"
        ? await authService.signUp({
            email: email.trim(),
            password,
            displayName: name.trim() || undefined,
          })
        : await authService.signIn({ email: email.trim(), password });
    setLoading(false);
    if (!result.ok) {
      const friendly =
        result.error.code === "config/not-configured"
          ? "Email sign-in is currently disabled for this project. Enable the Email provider in Cloud → Users → Auth settings, or continue with Google."
          : result.error.message;
      setErrorMsg(friendly);
      toast.error(friendly);
      return;
    }
    if (mode === "signup" && !result.session) {
      setErrorMsg(null);
      setAwaitingConfirmation(true);
      return;
    }
    navigate({ to: "/my-journey" });
  }

  if (awaitingConfirmation) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-6 text-center">
        <span
          className="mx-auto grid h-10 w-10 place-items-center rounded-full"
          style={{ background: "color-mix(in oklab, var(--gold) 14%, transparent)" }}
        >
          <MailCheck className="h-5 w-5" style={{ color: "var(--gold)" }} aria-hidden="true" />
        </span>
        <p className="mt-3 font-serif text-xl">{t("auth.checkEmail")}</p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          {t("auth.checkEmailBody")} <strong className="text-foreground">{email.trim()}</strong>
        </p>
        <p className="mt-2 text-[12px] text-muted-foreground">{t("auth.checkEmailAfter")}</p>
        <Button asChild variant="outline" className="mt-5 rounded-full">
          <Link to="/signin">{t("cta.signin")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 text-left">
      {mode === "signup" && (
        <label className="grid gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {t("auth.name")}
          </span>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("auth.namePlaceholder")}
            autoComplete="name"
            className="h-11 rounded-xl bg-white"
          />
        </label>
      )}
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
      <label className="grid gap-1.5">
        <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {t("auth.password")}
        </span>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          minLength={6}
          className="h-11 rounded-xl bg-white"
        />
      </label>
      <Button type="submit" disabled={loading} className="h-11 w-full rounded-full">
        {loading ? "…" : t("auth.continue")}
      </Button>
      {errorMsg && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {errorMsg}
        </p>
      )}
      <div className="flex min-h-[20px] items-center justify-center text-center text-xs text-muted-foreground">
        {mode === "signin" ? (
          <Link to="/forgot" className="underline underline-offset-4">
            {t("auth.forgotLink")}
          </Link>
        ) : (
          <span>First journey free</span>
        )}
      </div>
    </form>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-border" />
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
