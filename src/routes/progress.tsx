import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { MILESTONES } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";
import { useConsistency, useConsistencyWindow, useProgressStats } from "@/lib/journey/hooks";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "My Progress — Lumena" },
      { name: "description", content: "A calm view of your consistency in Scripture." },
      { property: "og:title", content: "My Progress — Lumena" },
      { property: "og:description", content: "See your streak, journeys, and quiet milestones over time." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { t } = useI18n();
  // Real rhythm and completion data; zeros when signed out — never samples.
  const { summary, signedIn } = useConsistency();
  const month = useConsistencyWindow(35);
  const stats = useProgressStats();
  const dash = (value: number | string) => (signedIn ? String(value) : "—");
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-10">
        <div>
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>{t("progress.eyebrow")}</p>
          <h1 className="mt-2 font-serif text-4xl">{t("progress.title")}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t("progress.sub")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[
            [
              t("progress.currentStreak"),
              signedIn ? `${summary.currentRun} ${t("progress.streakUnit")}` : "—",
            ],
            [
              t("progress.longestStreak"),
              signedIn ? `${summary.longestRun} ${t("progress.streakUnit")}` : "—",
            ],
            [t("progress.journeys"), dash(stats.journeysCompleted)],
            [t("progress.collections"), dash(stats.collectionsStarted)],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{l}</p>
              <p className="mt-2 font-serif text-3xl">{v}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl">{t("progress.days")}</h2>
            <span className="text-xs uppercase tracking-wider" style={{ color: "var(--walnut)" }}>{t("progress.thisMonth")}</span>
          </div>
          <div className="mt-6 grid grid-cols-7 gap-2">
            {month.window.map((day, i) => (
              <div
                key={day.date || i}
                title={day.date || undefined}
                className="aspect-square rounded-md"
                style={{
                  background: day.active
                    ? "color-mix(in oklab, var(--gold) 45%, transparent)"
                    : "var(--parchment)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-serif text-2xl">{t("progress.milestones")}</h2>
          <ul className="mt-4 divide-y divide-border">
            {MILESTONES.map((m) => (
              <li key={m.label} className="flex items-center justify-between py-3 text-sm">
                <span>{m.label}</span>
                <span className="text-muted-foreground">{m.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}