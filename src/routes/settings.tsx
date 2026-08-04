import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AppShell } from "@/components/site/AppShell";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LOCALES, useI18n, type Locale } from "@/lib/i18n";
import { SELECTION_COLORS } from "@/lib/mock-data";
import { ThemeSelector } from "@/components/site/ThemeSelector";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { authService } from "@/lib/auth/service";
import { usePreferences, type Difficulty, type FontSize } from "@/lib/preferences";
import { useNotifPrefs } from "@/lib/notification-preferences";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getSubscriptionStatus, createBillingPortalSession } from "@/lib/stripe/billing.functions";
import { deleteMyAccount } from "@/lib/account/account.functions";
import {
  User, Palette, BookOpen, Bell, Lock, CreditCard, Accessibility, Download, LogOut, Trash2, Sparkles, Loader2,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Lumena" },
      { name: "description", content: "Account, appearance, journey preferences, privacy and more." },
      { property: "og:title", content: "Settings — Lumena" },
      { property: "og:description", content: "Personalize your experience with calm defaults." },
    ],
  }),
  component: SettingsPage,
});

const SECTIONS = [
  { id: "account", labelKey: "settings.section.account", icon: User },
  { id: "appearance", labelKey: "settings.section.appearance", icon: Palette },
  { id: "journey", labelKey: "settings.section.journey", icon: BookOpen },
  { id: "notifications", labelKey: "settings.section.notifications", icon: Bell },
  { id: "privacy", labelKey: "settings.section.privacy", icon: Lock },
  { id: "membership", labelKey: "settings.section.membership", icon: CreditCard },
  { id: "accessibility", labelKey: "settings.section.accessibility", icon: Accessibility },
  { id: "data", labelKey: "settings.section.data", icon: Download },
] as const;

function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { prefs, setPref } = usePreferences();
  const { prefs: notif, setCategory, update: updateNotif } = useNotifPrefs();

  const readStatus = useServerFn(getSubscriptionStatus);
  const openPortal = useServerFn(createBillingPortalSession);
  const deleteAccount = useServerFn(deleteMyAccount);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);
  const [premium, setPremium] = useState<boolean | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // The profile arrives asynchronously; seed the inputs once it does, without
  // clobbering anything the reader has already typed.
  useEffect(() => {
    if (user.loading) return;
    setName(user.displayName ?? "");
    setEmail(user.email ?? "");
  }, [user.loading, user.userId, user.displayName, user.email]);

  useEffect(() => {
    if (!user.userId) {
      setPremium(false);
      return;
    }
    let cancelled = false;
    void readStatus()
      .then((r) => !cancelled && setPremium(Boolean(r?.isPremium)))
      .catch(() => !cancelled && setPremium(false));
    return () => {
      cancelled = true;
    };
  }, [user.userId, readStatus]);

  async function saveAccount() {
    if (!user.userId) return;
    setSavingAccount(true);
    try {
      const supabase = getSupabaseClient();
      const trimmed = name.trim();
      if (trimmed && trimmed !== (user.displayName ?? "")) {
        const { error } = await supabase
          .from("profiles")
          .update({ display_name: trimmed })
          .eq("id", user.userId);
        if (error) throw error;
      }
      // Changing the sign-in address is an identity change: Supabase sends a
      // confirmation to the new inbox and only switches once it is clicked.
      if (email.trim() && email.trim() !== (user.email ?? "")) {
        const { error } = await supabase.auth.updateUser({ email: email.trim() });
        if (error) throw error;
        toast.info(t("settings.account.emailPending"));
      }
      user.refresh();
      toast.success(t("settings.saved"));
    } catch {
      toast.error(t("settings.saveFailed"));
    } finally {
      setSavingAccount(false);
    }
  }

  async function changePassword() {
    if (!user.email) return;
    const result = await authService.requestPasswordReset(
      user.email,
      `${window.location.origin}/reset-password`,
    );
    if (result.ok) toast.success(t("settings.account.pwSent"));
    else toast.error(t("settings.saveFailed"));
  }

  async function goToPortal(returnPath = "/settings") {
    setPortalBusy(true);
    try {
      const result = await openPortal({ data: { returnPath } });
      if (result?.url) window.location.href = result.url;
      else toast.info(t("settings.membership.noBilling"));
    } catch {
      toast.error(t("settings.saveFailed"));
    } finally {
      setPortalBusy(false);
    }
  }

  async function exportData() {
    try {
      const payload: Record<string, unknown> = {
        exportedAt: new Date().toISOString(),
        account: { id: user.userId, email: user.email, displayName: user.displayName },
        preferences: prefs,
        notificationPreferences: notif,
        language: locale,
      };
      if (user.userId && isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        const [times, reflections] = await Promise.all([
          supabase.from("word_search_best_times").select("*").eq("user_id", user.userId),
          supabase.from("user_reflections").select("*").eq("user_id", user.userId),
        ]);
        payload["bestTimes"] = times.data ?? [];
        payload["reflections"] = reflections.data ?? [];
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lumena-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("settings.data.exported"));
    } catch {
      toast.error(t("settings.saveFailed"));
    }
  }

  async function signOut() {
    await authService.signOut();
    void navigate({ to: "/" });
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteAccount();
      await authService.signOut();
      toast.success(t("settings.data.deleted"));
      void navigate({ to: "/" });
    } catch {
      toast.error(t("settings.saveFailed"));
    } finally {
      setDeleting(false);
    }
  }

  const signedIn = Boolean(user.userId);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--walnut)" }}>{t("settings.title")}</p>
          <h1 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">{t("settings.subtitle")}</h1>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <nav className="sticky top-6 space-y-1">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.6} />
                    {t(s.labelKey)}
                  </a>
                );
              })}
            </nav>
          </aside>

          <div className="space-y-10">
            <Section id="account" title={t("settings.account.title")} description={t("settings.account.desc")}>
              {signedIn ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label={t("settings.account.name")} value={name} onChange={setName} />
                    <Field label={t("settings.account.email")} type="email" value={email} onChange={setEmail} />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button className="h-12 w-full rounded-full sm:h-10 sm:w-auto" onClick={() => void saveAccount()} disabled={savingAccount}>
                      {savingAccount && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                      {t("settings.account.save")}
                    </Button>
                    <Button variant="ghost" className="h-12 w-full rounded-full sm:h-10 sm:w-auto" onClick={() => void changePassword()}>
                      {t("settings.account.changePw")}
                    </Button>
                  </div>
                </>
              ) : (
                <SignedOutNotice />
              )}
            </Section>

            <Section id="appearance" title={t("settings.appearance.title")} description={t("settings.appearance.desc")}>
              <Row label={t("settings.appearance.themeLabel")}><ThemeSelector /></Row>
              <Row label={t("settings.color")}>
                <div className="flex flex-wrap gap-2">
                  {SELECTION_COLORS.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setPref("selectionColor", c.key)}
                      aria-pressed={prefs.selectionColor === c.key}
                      className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px]"
                      style={{ borderColor: prefs.selectionColor === c.key ? "var(--foreground)" : "var(--border)" }}
                    >
                      <span className="h-3.5 w-3.5 rounded-full" style={{ background: c.value }} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </Row>
              <Row label={t("settings.fontSize")}>
                <Chips
                  value={prefs.fontSize}
                  onChange={(v) => setPref("fontSize", v as FontSize)}
                  options={[["small", t("settings.small")], ["medium", t("settings.medium")], ["large", t("settings.large")]]}
                />
              </Row>
            </Section>

            <Section id="journey" title={t("settings.journey.title")} description={t("settings.journey.desc")}>
              <Row label={t("settings.journey.language")}>
                <div className="flex flex-wrap gap-2">
                  {LOCALES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLocale(l.code as Locale)}
                      className={`rounded-full border px-3 py-1.5 text-[12px] transition ${
                        locale === l.code ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </Row>
              <Row label={t("settings.difficulty")}>
                <Chips
                  value={prefs.difficulty}
                  onChange={(v) => setPref("difficulty", v as Difficulty)}
                  options={[["gentle", t("settings.gentle")], ["balanced", t("settings.balanced")], ["challenging", t("settings.challenging")], ["expert", t("settings.expert")]]}
                />
              </Row>
              <Row label={t("settings.journey.rhythm")}>
                <Chips
                  value={String(prefs.rhythmMinutes)}
                  onChange={(v) => setPref("rhythmMinutes", Number(v) as 5 | 10 | 20)}
                  options={[["5", t("settings.min5")], ["10", t("settings.min10")], ["20", t("settings.min20")]]}
                />
              </Row>
              <ToggleRow
                label={t("settings.journey.autoNext")}
                hint={t("settings.journey.autoNextHint")}
                checked={prefs.autoAdvance}
                onChange={(v) => setPref("autoAdvance", v)}
              />
              <ToggleRow
                label={t("settings.journey.sound")}
                hint={t("settings.journey.soundHint")}
                checked={prefs.sound}
                onChange={(v) => setPref("sound", v)}
              />
            </Section>

            <Section id="notifications" title={t("settings.notif.title")} description={t("settings.notif.desc")}>
              <ToggleRow
                label={t("settings.notif.daily")}
                hint={t("settings.notif.dailyHint")}
                checked={notif.categories.daily.enabled}
                onChange={(v) => setCategory("daily", { enabled: v })}
              />
              <ToggleRow
                label={t("settings.notif.companion")}
                hint={t("settings.notif.companionHint")}
                checked={notif.categories.companion.enabled}
                onChange={(v) => setCategory("companion", { enabled: v })}
              />
              <ToggleRow
                label={t("settings.notif.weekly")}
                hint={t("settings.notif.weeklyHint")}
                checked={notif.weeklyDigest}
                onChange={(v) => updateNotif({ weeklyDigest: v })}
              />
              <ToggleRow
                label={t("settings.notif.collections")}
                hint={t("settings.notif.collectionsHint")}
                checked={notif.categories.collection.enabled}
                onChange={(v) => setCategory("collection", { enabled: v })}
              />
              <ToggleRow
                label={t("settings.notif.product")}
                hint={t("settings.notif.productHint")}
                checked={notif.categories.premium.enabled}
                onChange={(v) => setCategory("premium", { enabled: v })}
              />
              <div className="pt-1">
                <Button asChild variant="ghost" className="rounded-full">
                  <Link to="/notifications/preferences">{t("settings.notif.advanced")}</Link>
                </Button>
              </div>
            </Section>

            <Section id="privacy" title={t("settings.privacy.title")} description={t("settings.privacy.desc")}>
              <ToggleRow
                label={t("settings.privacy.reflections")}
                hint={t("settings.privacy.reflectionsHint")}
                checked={prefs.privateReflections}
                onChange={(v) => setPref("privateReflections", v)}
              />
              <ToggleRow
                label={t("settings.privacy.completion")}
                hint={t("settings.privacy.completionHint")}
                checked={prefs.shareCompletion}
                onChange={(v) => setPref("shareCompletion", v)}
              />
              <ToggleRow
                label={t("settings.privacy.analytics")}
                hint={t("settings.privacy.analyticsHint")}
                checked={prefs.analytics}
                onChange={(v) => setPref("analytics", v)}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <Button asChild variant="ghost" className="rounded-full">
                  <Link to="/together">{t("settings.privacy.devices")}</Link>
                </Button>
                <Button asChild variant="ghost" className="rounded-full">
                  <Link to="/privacy">{t("settings.privacy.policy")}</Link>
                </Button>
              </div>
            </Section>

            <Section id="membership" title={t("settings.membership.title")} description={t("settings.membership.desc")}>
              <div className="rounded-2xl border border-border/60 bg-[color:var(--surface-2)] p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: "var(--gold)" }} />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--gold)" }}>
                    {premium === null ? t("ui.loading") : premium ? "Premium" : t("settings.membership.free")}
                  </p>
                </div>
                <p className="mt-2 font-serif text-xl">
                  {premium ? t("settings.membership.price") : t("settings.membership.freeTitle")}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  {premium ? t("settings.membership.blurb") : t("settings.membership.freeBlurb")}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {premium ? (
                    <>
                      <Button variant="outline" className="rounded-full" onClick={() => void goToPortal()} disabled={portalBusy}>
                        {portalBusy && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                        {t("settings.membership.manage")}
                      </Button>
                      <Button variant="ghost" className="rounded-full" onClick={() => void goToPortal()} disabled={portalBusy}>
                        {t("settings.membership.billing")}
                      </Button>
                      <Button variant="ghost" className="rounded-full text-destructive" onClick={() => void goToPortal()} disabled={portalBusy}>
                        {t("settings.membership.cancel")}
                      </Button>
                    </>
                  ) : (
                    <Button asChild className="h-12 w-full rounded-full sm:h-10 sm:w-auto">
                      <Link to="/pricing">{t("settings.membership.upgrade")}</Link>
                    </Button>
                  )}
                </div>
              </div>
            </Section>

            <Section id="accessibility" title={t("settings.accessibility.title")} description={t("settings.accessibility.desc")}>
              <ToggleRow
                label={t("settings.a11y.motion")}
                hint={t("settings.a11y.motionHint")}
                checked={prefs.reduceMotion}
                onChange={(v) => setPref("reduceMotion", v)}
              />
              <ToggleRow
                label={t("settings.a11y.contrast")}
                hint={t("settings.a11y.contrastHint")}
                checked={prefs.highContrast}
                onChange={(v) => setPref("highContrast", v)}
              />
              <ToggleRow
                label={t("settings.a11y.dyslexia")}
                hint={t("settings.a11y.dyslexiaHint")}
                checked={prefs.dyslexiaFont}
                onChange={(v) => setPref("dyslexiaFont", v)}
              />
              <ToggleRow
                label={t("settings.a11y.screenReader")}
                hint={t("settings.a11y.screenReaderHint")}
                checked={prefs.screenReaderHints}
                onChange={(v) => setPref("screenReaderHints", v)}
              />
            </Section>

            <Section id="data" title={t("settings.data.title")} description={t("settings.data.desc")}>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="h-12 w-full rounded-full sm:h-10 sm:w-auto" onClick={() => void exportData()}>
                  <Download className="mr-1.5 h-4 w-4" /> {t("settings.data.export")}
                </Button>
                {signedIn && (
                  <>
                    <Button variant="ghost" className="h-12 w-full rounded-full sm:h-10 sm:w-auto" onClick={() => void signOut()}>
                      <LogOut className="mr-1.5 h-4 w-4" /> {t("settings.data.signout")}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="h-12 w-full rounded-full text-destructive sm:h-10 sm:w-auto">
                          <Trash2 className="mr-1.5 h-4 w-4" /> {t("settings.data.delete")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-serif text-2xl">{t("settings.delete.title")}</AlertDialogTitle>
                          <AlertDialogDescription>{t("settings.delete.desc")}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-full">{t("settings.delete.cancel")}</AlertDialogCancel>
                          <AlertDialogAction
                            className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={(e) => {
                              e.preventDefault();
                              void confirmDelete();
                            }}
                            disabled={deleting}
                          >
                            {deleting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                            {t("settings.delete.confirm")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </Section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SignedOutNotice() {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border border-dashed border-border/70 p-6 text-center">
      <p className="text-[13px] text-muted-foreground">{t("settings.account.signedOut")}</p>
      <Button asChild className="mt-4 h-12 w-full rounded-full sm:h-10 sm:w-auto">
        <Link to="/signin">{t("cta.signin")}</Link>
      </Button>
    </div>
  );
}

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 rounded-2xl border border-border/60 bg-card p-6 md:p-8">
      <div>
        <h2 className="font-serif text-2xl">{title}</h2>
        {description && <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>}
      </div>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[13px] font-medium">{label}</span>
      <div>{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-border/60 pt-5 first:border-none first:pt-0">
      <div className="min-w-0">
        <p className="text-[13px] font-medium">{label}</p>
        {hint && <p className="mt-0.5 text-[12px] text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <Input value={value} type={type} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Chips({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([k, label]) => {
        const active = value === k;
        return (
          <button
            key={k}
            onClick={() => onChange(k)}
            aria-pressed={active}
            className={`rounded-full border px-3 py-1.5 text-[12px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              active ? "border-primary bg-primary/10" : "border-border text-muted-foreground"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
