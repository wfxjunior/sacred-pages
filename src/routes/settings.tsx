import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LOCALES, useI18n, type Locale } from "@/lib/i18n";
import { SELECTION_COLORS } from "@/lib/mock-data";
import { ThemeSelector } from "@/components/site/ThemeSelector";
import { useState } from "react";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import {
  User, Palette, BookOpen, Bell, Lock, CreditCard, Accessibility, Download, LogOut, Trash2, Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Jornadas da Palavra" },
      { name: "description", content: "Account, appearance, journey preferences, privacy and more." },
      { property: "og:title", content: "Settings — Jornadas da Palavra" },
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
  const user = useCurrentUser();
  const [color, setColor] = useState("gold");
  const [diff, setDiff] = useState("gentle");
  const [font, setFont] = useState("medium");

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
              <div className="grid gap-4 md:grid-cols-2">
                {!user.loading && (
                  <>
                    <Field
                      key={`name-${user.userId ?? "anon"}`}
                      label={t("settings.account.name")}
                      defaultValue={user.displayName ?? ""}
                    />
                    <Field
                      key={`email-${user.userId ?? "anon"}`}
                      label={t("settings.account.email")}
                      type="email"
                      defaultValue={user.email ?? ""}
                    />
                  </>
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button className="rounded-full">{t("settings.account.save")}</Button>
                <Button variant="ghost" className="rounded-full">{t("settings.account.changePw")}</Button>
              </div>
            </Section>

            <Section id="appearance" title={t("settings.appearance.title")} description={t("settings.appearance.desc")}>
              <Row label={t("settings.appearance.themeLabel")}><ThemeSelector /></Row>
              <Row label={t("settings.color")}>
                <div className="flex flex-wrap gap-2">
                  {SELECTION_COLORS.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setColor(c.key)}
                      className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px]"
                      style={{ borderColor: color === c.key ? "var(--foreground)" : "var(--border)" }}
                    >
                      <span className="h-3.5 w-3.5 rounded-full" style={{ background: c.value }} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </Row>
              <Row label={t("settings.fontSize")}>
                <Chips value={font} onChange={setFont} options={[["small",t("settings.small")],["medium",t("settings.medium")],["large",t("settings.large")]]} />
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
                <Chips value={diff} onChange={setDiff} options={[["gentle",t("settings.gentle")],["balanced",t("settings.balanced")],["challenging",t("settings.challenging")],["expert",t("settings.expert")]]} />
              </Row>
              <Row label={t("settings.journey.rhythm")}>
                <Chips value="10" onChange={() => {}} options={[["5",t("settings.min5")],["10",t("settings.min10")],["20",t("settings.min20")]]} />
              </Row>
              <ToggleRow label={t("settings.journey.autoNext")} hint={t("settings.journey.autoNextHint")} defaultChecked />
              <ToggleRow label={t("settings.journey.sound")} hint={t("settings.journey.soundHint")} defaultChecked />
            </Section>

            <Section id="notifications" title={t("settings.notif.title")} description={t("settings.notif.desc")}>
              <ToggleRow label="Daily journey reminder" hint="A gentle nudge each morning at 8:00 AM." defaultChecked />
              <ToggleRow label="Companion updates" hint="When a shared journey reaches a milestone." defaultChecked />
              <ToggleRow label="Weekly reflection email" hint="A calm summary of your week — never marketing." />
              <ToggleRow label="New collection releases" hint="A quiet note when new curated journeys arrive." defaultChecked />
              <ToggleRow label="Product news" hint="Twice a year at most." />
            </Section>

            <Section id="privacy" title={t("settings.privacy.title")} description={t("settings.privacy.desc")}>
              <ToggleRow label="Reflections are private by default" hint="Even inside shared journeys." defaultChecked />
              <ToggleRow label="Show completion status to companions" hint="Only whether you finished — never the content." defaultChecked />
              <ToggleRow label="Anonymous usage analytics" hint="Helps us improve. No content is ever sent." />
              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="ghost" className="rounded-full">{t("settings.privacy.blocked")}</Button>
                <Button variant="ghost" className="rounded-full">{t("settings.privacy.devices")}</Button>
              </div>
            </Section>

            <Section id="membership" title={t("settings.membership.title")} description={t("settings.membership.desc")}>
              <div className="rounded-2xl border border-border/60 bg-[color:var(--surface-2)] p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: "var(--gold)" }} />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--gold)" }}>Premium</p>
                </div>
                <p className="mt-2 font-serif text-xl">{t("settings.membership.price")}</p>
                <p className="text-[12px] text-muted-foreground">{t("settings.membership.blurb")}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" className="rounded-full">{t("settings.membership.manage")}</Button>
                  <Button variant="ghost" className="rounded-full">{t("settings.membership.billing")}</Button>
                  <Button variant="ghost" className="rounded-full text-destructive">{t("settings.membership.cancel")}</Button>
                </div>
              </div>
            </Section>

            <Section id="accessibility" title={t("settings.accessibility.title")} description={t("settings.accessibility.desc")}>
              <ToggleRow label="Reduce motion" hint="Softens transitions and disables autoplay." />
              <ToggleRow label="Higher contrast" hint="For clearer reading in bright environments." />
              <ToggleRow label="Dyslexia-friendly type" hint="Adjusts letter spacing and rhythm." />
              <ToggleRow label="Screen reader hints" hint="Extra ARIA labels on interactive elements." defaultChecked />
            </Section>

            <Section id="data" title={t("settings.data.title")} description={t("settings.data.desc")}>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="rounded-full">
                  <Download className="mr-1.5 h-4 w-4" /> {t("settings.data.export")}
                </Button>
                <Button variant="ghost" className="rounded-full">
                  <LogOut className="mr-1.5 h-4 w-4" /> {t("settings.data.signout")}
                </Button>
                <Button variant="ghost" className="rounded-full text-destructive">
                  <Trash2 className="mr-1.5 h-4 w-4" /> {t("settings.data.delete")}
                </Button>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </AppShell>
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

function ToggleRow({ label, hint, defaultChecked }: { label: string; hint?: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-border/60 pt-5 first:border-none first:pt-0">
      <div className="min-w-0">
        <p className="text-[13px] font-medium">{label}</p>
        {hint && <p className="mt-0.5 text-[12px] text-muted-foreground">{hint}</p>}
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function Field({ label, defaultValue, type = "text" }: { label: string; defaultValue: string; type?: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <Input defaultValue={defaultValue} type={type} />
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