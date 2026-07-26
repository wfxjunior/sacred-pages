import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { HeroPreview } from "@/components/site/HeroPreview";
import { CollectionCard } from "@/components/site/CollectionCard";
import { Button } from "@/components/ui/button";
import { COLLECTIONS, MILESTONES, TODAY } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/my-journey")({
  head: () => ({
    meta: [
      { title: "My Journey — Lumen Verse" },
      { name: "description", content: "Your personal home inside Scripture — today's journey, streak, and collections." },
      { property: "og:title", content: "My Journey — Lumen Verse" },
      { property: "og:description", content: "Your personal Scripture home." },
    ],
  }),
  component: MyJourney,
});

function MyJourney() {
  const { t } = useI18n();
  return (
    <AppShell>
      <div className="space-y-12">
        <header>
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>
            {t("app.greeting.morning")}
          </p>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">Good morning, Samuel.</h1>
          <p className="mt-3 text-muted-foreground">{t("app.greeting.sub")}</p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <p className="text-xs uppercase tracking-widest" style={{ color: "var(--walnut)" }}>
              {t("today.title")}
            </p>
            <h2 className="mt-2 font-serif text-2xl md:text-3xl">{TODAY.title}</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--walnut)" }}>
              {TODAY.reference} · {t("today.duration")}
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground line-clamp-3">
              {TODAY.devotional}
            </p>
            <div className="mt-6">
              <Button asChild size="lg">
                <Link to="/today">{t("cta.begin")}</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4">
            <StatCard label={t("app.streak")} value={`12 ${t("app.days")}`} />
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("app.week")}</p>
              <div className="mt-4 grid grid-cols-7 gap-1.5">
                {[1, 1, 1, 0, 1, 1, 0].map((d, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-sm"
                    style={{ background: d ? "color-mix(in oklab, var(--gold) 45%, transparent)" : "var(--parchment)" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl">{t("app.continue")}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COLLECTIONS.slice(0, 3).map((c) => <CollectionCard key={c.slug} c={c} />)}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl">{t("app.recommended")}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COLLECTIONS.slice(3, 6).map((c) => <CollectionCard key={c.slug} c={c} />)}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl">{t("app.milestones")}</h2>
          <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
            {MILESTONES.map((m) => (
              <li key={m.label} className="flex items-center justify-between px-6 py-4 text-sm">
                <span>{m.label}</span>
                <span className="text-muted-foreground">{m.date}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-4xl">{value}</p>
    </div>
  );
}