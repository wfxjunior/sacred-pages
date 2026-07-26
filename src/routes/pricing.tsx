import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Lumen Verse" },
      { name: "description", content: "Simple, honest membership. Start free, upgrade when you're ready." },
      { property: "og:title", content: "Pricing — Lumen Verse" },
      { property: "og:description", content: "Free and Premium plans for your daily Scripture journey." },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const { t } = useI18n();
  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>Membership</p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">Simple, honest membership</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">Start free. Upgrade only when your daily rhythm calls for more.</p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {[
            {
              name: t("pricing.free"),
              price: t("pricing.freePrice"),
              features: ["Daily journey", "Selected collections", "Basic progress", "Limited personalization"],
              featured: false,
            },
            {
              name: t("pricing.premium"),
              price: t("pricing.premiumPrice"),
              features: [
                "Full journey library",
                "All collections",
                "Complete personalization",
                "Advanced progress history",
                "Exclusive series",
                "Future family features",
              ],
              featured: true,
            },
          ].map((p) => (
            <div key={p.name} className={`flex flex-col rounded-2xl border p-8 ${p.featured ? "border-primary/50 bg-card" : "border-border bg-card/60"}`}>
              <p className="font-serif text-2xl">{p.name}</p>
              <p className="mt-2 font-serif text-4xl">{p.price}<span className="ml-1 text-sm text-muted-foreground">{t("pricing.month")}</span></p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--gold)" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8" variant={p.featured ? "default" : "outline"}>
                <Link to="/signup">{p.featured ? t("cta.startJourney") : t("cta.startFree")}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}