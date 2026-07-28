import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LOCALES, useI18n, type Locale } from "@/lib/i18n";
import { SELECTION_COLORS } from "@/lib/mock-data";
import { ThemeSelector } from "@/components/site/ThemeSelector";
import { useState } from "react";
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
  { id: "account", label: "Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "journey", label: "Journey", icon: BookOpen },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Lock },
  { id: "membership", label: "Membership", icon: CreditCard },
  { id: "accessibility", label: "Accessibility", icon: Accessibility },
  { id: "data", label: "Your data", icon: Download },
] as const;

function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const [color, setColor] = useState("gold");
  const [diff, setDiff] = useState("gentle");
  const [font, setFont] = useState("medium");

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--walnut)" }}>{t("settings.title")}</p>
          <h1 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">A quieter way to personalize.</h1>
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
                    {s.label}
                  </a>
                );
              })}
            </nav>
          </aside>

          <div className="space-y-10">
            <Section id="account" title="Account" description="Your identity across every device.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Full name" defaultValue="Samuel Reid" />
                <Field label="Email" type="email" defaultValue="samuel@jornadas.app" />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button className="rounded-full">Save changes</Button>
                <Button variant="ghost" className="rounded-full">Change password</Button>
              </div>
            </Section>

            <Section id="appearance" title="Appearance" description="Warm ivory during the day, deep ink at night — never pure black.">
              <Row label="Theme"><ThemeSelector /></Row>
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
                <Chips value={font} onChange={setFont} options={[["small","Small"],["medium","Medium"],["large","Large"]]} />
              </Row>
            </Section>

            <Section id="journey" title="Journey preferences" description="Set the rhythm and depth of your daily readings.">
              <Row label="Language">
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
                <Chips value={diff} onChange={setDiff} options={[["gentle","Gentle"],["balanced","Balanced"],["challenging","Challenging"],["expert","Expert"]]} />
              </Row>
              <Row label="Daily rhythm">
                <Chips value="10" onChange={() => {}} options={[["5","5 min"],["10","10 min"],["20","20 min"]]} />
              </Row>
              <ToggleRow label="Auto-advance to next journey" hint="When you complete one, the next opens automatically." defaultChecked />
              <ToggleRow label="Sound effects" hint="Small, calm cues on discovery." defaultChecked />
            </Section>

            <Section id="notifications" title="Notifications" description="Few and meaningful — you choose what and when.">
              <ToggleRow label="Daily journey reminder" hint="A gentle nudge each morning at 8:00 AM." defaultChecked />
              <ToggleRow label="Companion updates" hint="When a shared journey reaches a milestone." defaultChecked />
              <ToggleRow label="Weekly reflection email" hint="A calm summary of your week — never marketing." />
              <ToggleRow label="New collection releases" hint="A quiet note when new curated journeys arrive." defaultChecked />
              <ToggleRow label="Product news" hint="Twice a year at most." />
            </Section>

            <Section id="privacy" title="Privacy" description="Your reflections and prayers are yours. Always.">
              <ToggleRow label="Reflections are private by default" hint="Even inside shared journeys." defaultChecked />
              <ToggleRow label="Show completion status to companions" hint="Only whether you finished — never the content." defaultChecked />
              <ToggleRow label="Anonymous usage analytics" hint="Helps us improve. No content is ever sent." />
              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="ghost" className="rounded-full">Blocked people</Button>
                <Button variant="ghost" className="rounded-full">Session devices</Button>
              </div>
            </Section>

            <Section id="membership" title="Membership" description="Premium — annual · renews Mar 12, 2027.">
              <div className="rounded-2xl border border-border/60 bg-[color:var(--surface-2)] p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: "var(--gold)" }} />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--gold)" }}>Premium</p>
                </div>
                <p className="mt-2 font-serif text-xl">$59 / year</p>
                <p className="text-[12px] text-muted-foreground">All collections, Journey Together, Family Mode, Small Groups.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" className="rounded-full">Manage plan</Button>
                  <Button variant="ghost" className="rounded-full">Billing history</Button>
                  <Button variant="ghost" className="rounded-full text-destructive">Cancel subscription</Button>
                </div>
              </div>
            </Section>

            <Section id="accessibility" title="Accessibility" description="Small choices, real difference.">
              <ToggleRow label="Reduce motion" hint="Softens transitions and disables autoplay." />
              <ToggleRow label="Higher contrast" hint="For clearer reading in bright environments." />
              <ToggleRow label="Dyslexia-friendly type" hint="Adjusts letter spacing and rhythm." />
              <ToggleRow label="Screen reader hints" hint="Extra ARIA labels on interactive elements." defaultChecked />
            </Section>

            <Section id="data" title="Your data" description="You own everything you write here.">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="rounded-full">
                  <Download className="mr-1.5 h-4 w-4" /> Export my data
                </Button>
                <Button variant="ghost" className="rounded-full">
                  <LogOut className="mr-1.5 h-4 w-4" /> Sign out everywhere
                </Button>
                <Button variant="ghost" className="rounded-full text-destructive">
                  <Trash2 className="mr-1.5 h-4 w-4" /> Delete account
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