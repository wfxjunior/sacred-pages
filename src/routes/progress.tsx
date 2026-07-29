import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { MILESTONES } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "My Progress — Lumen Verse" },
      { name: "description", content: "A calm view of your consistency in Scripture." },
      { property: "og:title", content: "My Progress — Lumen Verse" },
      { property: "og:description", content: "See your streak, journeys, and quiet milestones over time." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { t } = useI18n();
  const days = Array.from({ length: 35 }, (_, i) => i);
  const active = new Set([1, 2, 3, 5, 6, 7, 8, 10, 11, 13, 14, 15, 17, 20, 21, 22, 24, 25, 26, 27, 28]);
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
            [t("progress.currentStreak"), `12 ${t("progress.streakUnit")}`],
            [t("progress.longestStreak"), `31 ${t("progress.streakUnit")}`],
            [t("progress.journeys"), "38"],
            [t("progress.collections"), "3"],
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
            {days.map((d) => (
              <div
                key={d}
                className="aspect-square rounded-md"
                style={{
                  background: active.has(d)
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