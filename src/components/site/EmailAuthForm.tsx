import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
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
      toast.error(result.error.message);
      return;
    }
    navigate({ to: "/my-journey" });
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
      {mode === "signin" && (
        <div className="text-center">
          <Link
            to="/forgot"
            className="text-xs text-muted-foreground underline underline-offset-4"
          >
            {t("auth.forgotLink")}
          </Link>
        </div>
      )}
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
