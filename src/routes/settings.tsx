import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { Switch } from "@/components/ui/switch";
import { LOCALES, useI18n, type Locale } from "@/lib/i18n";
import { SELECTION_COLORS } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Lumen Verse" },
      { name: "description", content: "Language, reading mode, difficulty and personalization." },
      { property: "og:title", content: "Settings — Lumen Verse" },
      { property: "og:description", content: "Personalize your Lumen Verse experience." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const [color, setColor] = useState("gold");
  const [diff, setDiff] = useState("gentle");
  const [font, setFont] = useState("medium");
  const [theme, setTheme] = useState("light");

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>{t("settings.title")}</p>
          <h1 className="mt-2 font-serif text-4xl">Personalize your experience</h1>
        </div>

        <Section title={t("settings.language")}>
          <div className="flex flex-wrap gap-2">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLocale(l.code as Locale)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  locale === l.code ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </Section>

        <Section title={t("settings.color")}>
          <div className="flex flex-wrap gap-3">
            {SELECTION_COLORS.map((c) => (
              <button
                key={c.key}
                onClick={() => setColor(c.key)}
                className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
                style={{ borderColor: color === c.key ? "var(--foreground)" : "var(--border)" }}
              >
                <span className="h-4 w-4 rounded-full" style={{ background: c.value }} />
                {c.label}
              </button>
            ))}
          </div>
        </Section>

        <Section title={t("settings.difficulty")}>
          <div className="flex flex-wrap gap-2">
            {["gentle", "balanced", "challenging", "expert"].map((d) => (
              <button
                key={d}
                onClick={() => setDiff(d)}
                className={`rounded-full border px-4 py-1.5 text-sm ${
                  diff === d ? "border-primary bg-primary/10" : "border-border text-muted-foreground"
                }`}
              >
                {t(`diff.${d}`)}
              </button>
            ))}
          </div>
        </Section>

        <Section title={t("settings.fontSize")}>
          <div className="flex flex-wrap gap-2">
            {(["small", "medium", "large"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFont(f)}
                className={`rounded-full border px-4 py-1.5 text-sm ${
                  font === f ? "border-primary bg-primary/10" : "border-border text-muted-foreground"
                }`}
              >
                {t(`settings.${f}`)}
              </button>
            ))}
          </div>
        </Section>

        <Section title={t("settings.theme")}>
          <div className="flex flex-wrap gap-2">
            {(["light", "dark"] as const).map((th) => (
              <button
                key={th}
                onClick={() => {
                  setTheme(th);
                  document.documentElement.classList.toggle("dark", th === "dark");
                }}
                className={`rounded-full border px-4 py-1.5 text-sm ${
                  theme === th ? "border-primary bg-primary/10" : "border-border text-muted-foreground"
                }`}
              >
                {t(`settings.${th}`)}
              </button>
            ))}
          </div>
        </Section>

        <Section title={t("settings.sound")}>
          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-4">
            <span className="text-sm">Sound effects</span>
            <Switch defaultChecked />
          </div>
        </Section>

        <Section title={t("settings.reminders")}>
          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-4">
            <span className="text-sm">Send me a gentle daily email</span>
            <Switch />
          </div>
        </Section>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-xl">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}