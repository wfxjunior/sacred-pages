// TODO: Persist preferences on the backend. Design-only prototype.

import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_META,
  useNotifPrefs,
  type Channel,
} from "@/lib/notification-preferences";
import { NOTIFICATIONS } from "@/lib/mock/notifications";
import { Bell, BellOff, Mail, Smartphone, Moon, Volume2, VolumeX, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/notifications/preferences")({
  head: () => ({
    meta: [
      { title: "Notification preferences — Jornadas da Palavra" },
      { name: "description", content: "Choose exactly which quiet nudges reach you, on which channel." },
      { property: "og:title", content: "Notification preferences — Jornadas da Palavra" },
      { property: "og:description", content: "Few and meaningful — you decide." },
    ],
  }),
  component: PrefsPage,
});

const CHANNELS: { key: Channel; label: string; icon: typeof Bell }[] = [
  { key: "inApp", label: "In-app", icon: Bell },
  { key: "email", label: "Email", icon: Mail },
  { key: "push",  label: "Push",  icon: Smartphone },
];

function PrefsPage() {
  const { prefs, setCategory, setChannel, update, reset } = useNotifPrefs();

  // Mirror the header dropdown badge so users see the sync visually.
  const visibleCount = NOTIFICATIONS.filter((n) => {
    if (prefs.pauseAll) return false;
    const c = prefs.categories[n.kind];
    return c?.enabled && c.channels.inApp;
  }).length;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <Link
          to="/notifications"
          className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Notification center
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--walnut)" }}>
              Preferences
            </p>
            <h1 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">Quiet by design</h1>
            <p className="mt-2 max-w-lg text-[14px] text-muted-foreground">
              Choose what reaches you and how. Header updates the moment you toggle — this is the same source of truth.
            </p>
          </div>
          <Button variant="ghost" className="rounded-full text-muted-foreground" onClick={reset}>
            Reset to defaults
          </Button>
        </div>

        {/* Sync preview */}
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4">
          <span
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: "color-mix(in oklab, var(--gold) 12%, transparent)", color: "var(--gold)" }}
          >
            {prefs.pauseAll ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {!prefs.pauseAll && visibleCount > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card"
                style={{ background: "var(--gold)" }}
                aria-hidden
              />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium">Header preview</p>
            <p className="text-[11.5px] text-muted-foreground">
              {prefs.pauseAll
                ? "The bell shows as paused for everyone signed in as you."
                : `${visibleCount} notification${visibleCount === 1 ? "" : "s"} will appear in the dropdown right now.`}
            </p>
          </div>
        </div>

        {/* Global controls */}
        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--walnut)" }}>
            Global
          </p>
          <div className="mt-3 space-y-2">
            <RowToggle
              label="Pause all notifications"
              hint="Nothing will appear in-app, email or push. Existing history stays intact."
              checked={prefs.pauseAll}
              onChange={(v) => update({ pauseAll: v })}
              tone="warn"
            />
            <RowToggle
              label="Weekly reflection digest"
              hint="A short Sunday email with your quiet wins — never marketing."
              checked={prefs.weeklyDigest}
              onChange={(v) => update({ weeklyDigest: v })}
            />
            <RowToggle
              label={prefs.sound ? "Sound cues on" : "Sound cues off"}
              hint="Soft, calm chimes when a journey is ready."
              icon={prefs.sound ? Volume2 : VolumeX}
              checked={prefs.sound}
              onChange={(v) => update({ sound: v })}
            />
          </div>

          <div className="mt-5 rounded-xl border border-border/60 bg-background/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Moon className="h-3.5 w-3.5" style={{ color: "var(--dusty-blue)" }} />
                  <p className="text-[13px] font-medium">Quiet hours</p>
                </div>
                <p className="text-[11.5px] text-muted-foreground">
                  We hold notifications and deliver them once quiet hours end.
                </p>
              </div>
              <Switch
                checked={prefs.quietHours.enabled}
                onChange={(v) => update({ quietHours: { ...prefs.quietHours, enabled: v } })}
              />
            </div>
            {prefs.quietHours.enabled && (
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
                <label className="inline-flex items-center gap-2">
                  From
                  <input
                    type="time"
                    value={prefs.quietHours.from}
                    onChange={(e) => update({ quietHours: { ...prefs.quietHours, from: e.target.value } })}
                    className="rounded-md border border-border/60 bg-background px-2 py-1 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </label>
                <label className="inline-flex items-center gap-2">
                  To
                  <input
                    type="time"
                    value={prefs.quietHours.to}
                    onChange={(e) => update({ quietHours: { ...prefs.quietHours, to: e.target.value } })}
                    className="rounded-md border border-border/60 bg-background px-2 py-1 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </label>
              </div>
            )}
          </div>
        </section>

        {/* Category matrix */}
        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--walnut)" }}>
                Categories
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Toggle a category off to hide it everywhere. Or pick specific channels.
              </p>
            </div>
            <div className="hidden gap-4 pr-1 md:flex">
              {CHANNELS.map(({ key, label, icon: Icon }) => (
                <span key={key} className="inline-flex w-14 items-center justify-center gap-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  <Icon className="h-3 w-3" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <ul className="mt-4 divide-y divide-border/60">
            {CATEGORY_META.map((cat) => {
              const state = prefs.categories[cat.key];
              const dim = !state.enabled || prefs.pauseAll;
              return (
                <li key={cat.key} className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:gap-6">
                  <div className={`flex min-w-0 flex-1 items-start gap-3 ${dim ? "opacity-60" : ""}`}>
                    <span
                      className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `color-mix(in oklab, ${cat.accent} 14%, transparent)`, color: cat.accent }}
                    >
                      <Bell className="h-4 w-4" strokeWidth={1.6} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium">{cat.label}</p>
                      <p className="text-[12px] text-muted-foreground">{cat.hint}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 md:gap-6">
                    <div className="flex items-center gap-4">
                      {CHANNELS.map(({ key, label, icon: Icon }) => (
                        <label
                          key={key}
                          className={`flex w-14 flex-col items-center gap-1 text-[10px] uppercase tracking-[0.14em] ${
                            !state.enabled || prefs.pauseAll ? "opacity-40" : "text-muted-foreground"
                          }`}
                        >
                          <span className="md:hidden inline-flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            {label}
                          </span>
                          <Switch
                            small
                            disabled={!state.enabled || prefs.pauseAll}
                            checked={state.channels[key]}
                            onChange={(v) => setChannel(cat.key, key, v)}
                          />
                        </label>
                      ))}
                    </div>
                    <Switch
                      checked={state.enabled}
                      onChange={(v) => setCategory(cat.key, { enabled: v })}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <p className="mt-6 text-center text-[11.5px] text-muted-foreground">
          Reflections and prayers are always private — no notification ever contains their content.
        </p>
      </div>
    </AppShell>
  );
}

function RowToggle({
  label,
  hint,
  checked,
  onChange,
  icon: Icon,
  tone,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: typeof Bell;
  tone?: "warn";
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-background/40 px-4 py-3">
      <div className="flex items-start gap-2">
        {Icon && <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />}
        <div>
          <p className={`text-[13px] font-medium ${tone === "warn" && checked ? "text-destructive" : ""}`}>
            {label}
          </p>
          <p className="text-[11.5px] text-muted-foreground">{hint}</p>
        </div>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

function Switch({
  checked,
  onChange,
  disabled,
  small,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  small?: boolean;
}) {
  const w = small ? "h-4 w-7" : "h-5 w-9";
  const dot = small ? "h-3 w-3" : "h-4 w-4";
  const move = small ? "translate-x-[14px]" : "translate-x-[18px]";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex ${w} shrink-0 items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40 ${
        checked ? "" : "bg-border"
      }`}
      style={checked ? { background: "var(--sage)" } : undefined}
    >
      <span
        className={`inline-block ${dot} transform rounded-full bg-white shadow-sm transition ${
          checked ? move : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
