import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section } from "@/components/site/Section";
import { HeroMockup } from "@/components/site/HeroMockup";
import { CollectionCard } from "@/components/site/CollectionCard";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { COLLECTIONS, TODAY } from "@/lib/mock-data";
import { ArrowRight, BookOpen, Compass, Heart, Play, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { t } = useI18n();
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "color-mix(in oklab, var(--ivory) 60%, white)" }}>
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(70% 55% at 15% 10%, color-mix(in oklab, var(--gold) 6%, transparent), transparent 60%), radial-gradient(55% 45% at 95% 40%, color-mix(in oklab, var(--sage) 5%, transparent), transparent 60%)",
          }}
        />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 md:grid-cols-[minmax(0,40fr)_minmax(0,60fr)] md:gap-16 md:py-28">
          <div className="flex flex-col">
            <span
              className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur"
              style={{ color: "var(--walnut)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--gold)" }} />
              {t("hero.label")}
            </span>
            <h1 className="mt-6 font-serif text-4xl leading-[1.05] tracking-tight md:text-[56px]">
              {t("hero.h1a")}
              <br />
              <span style={{ color: "var(--gold)" }}>{t("hero.h1b")}</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              {t("hero.sub2")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to="/today">
                  {t("hero.ctaPrimary")} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link to="/today">
                  <Play className="mr-1 h-4 w-4" /> {t("hero.ctaSecondary")}
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {[
                t("hero.chip.time"),
                t("hero.chip.devotional"),
                t("hero.chip.wordsearch"),
                t("hero.chip.reflection"),
              ].map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-border/70 bg-card/60 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="md:pl-6">
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* Intro */}
      <Section eyebrow="What's inside a journey" title={t("intro.title")} sub={t("intro.sub")}>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { k: "intro.scripture", icon: BookOpen },
            { k: "intro.devotional", icon: Sparkles },
            { k: "intro.wordsearch", icon: Compass },
            { k: "intro.reflection", icon: BookOpen },
            { k: "intro.prayer", icon: Heart },
            { k: "intro.progress", icon: Sparkles },
          ].map(({ k, icon: Icon }) => (
            <div key={k} className="flex gap-4 border-t border-border/70 pt-6">
              <Icon className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "var(--gold)" }} />
              <p className="text-base leading-relaxed">{t(k)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Today's Journey preview */}
      <section className="border-y border-border/60 bg-secondary/30">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-[1fr_1.1fr]">
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>
              {t("today.title")}
            </p>
            <h2 className="font-serif text-3xl leading-tight md:text-4xl">{TODAY.title}</h2>
            <p className="mt-3 text-sm" style={{ color: "var(--walnut)" }}>
              {TODAY.reference} · {t("today.duration")} · {t("today.difficulty")}
            </p>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              {TODAY.devotional}
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link to="/today">{t("cta.begin")}</Link>
              </Button>
            </div>
          </div>
          <HeroPreview />
        </div>
      </section>

      {/* How it works */}
      <Section eyebrow="How it works" title={t("how.title")}>
        <div className="grid gap-10 md:grid-cols-3">
          {[
            { n: "01", k: "read" },
            { n: "02", k: "discover" },
            { n: "03", k: "reflect" },
          ].map((s) => (
            <div key={s.k}>
              <p className="font-serif text-4xl" style={{ color: "var(--gold)" }}>{s.n}</p>
              <h3 className="mt-4 font-serif text-2xl">{t(`how.${s.k}`)}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {t(`how.${s.k}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Collections */}
      <Section eyebrow="Collections" title={t("collections.title")} sub={t("collections.sub")}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.slice(0, 6).map((c) => (
            <CollectionCard key={c.slug} c={c} />
          ))}
        </div>
      </Section>

      {/* Personalization */}
      <section className="border-y border-border/60 bg-secondary/30">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 md:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>
              Personalization
            </p>
            <h2 className="font-serif text-3xl leading-tight md:text-4xl">{t("personalize.title")}</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{t("personalize.sub")}</p>
          </div>
          <div className="grid gap-3">
            {[
              "Word-selection color",
              "Difficulty",
              "Font size",
              "Light or dark reading mode",
              "Language",
            ].map((label) => (
              <div key={label} className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-4">
                <span className="text-sm">{label}</span>
                <span className="text-xs uppercase tracking-wider" style={{ color: "var(--gold)" }}>Customize</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Progress */}
      <Section eyebrow="Progress" title={t("progress.title")} sub={t("progress.sub")}>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[
            { label: "Current streak", value: "12", suffix: "days" },
            { label: "Journeys completed", value: "38" },
            { label: "Passages explored", value: "142" },
            { label: "Collections completed", value: "3" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="mt-3 font-serif text-4xl">
                {s.value}
                {s.suffix && <span className="ml-1 text-base text-muted-foreground">{s.suffix}</span>}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Pricing */}
      <Section eyebrow="Membership" title={t("pricing.title")}>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              name: t("pricing.free"),
              price: t("pricing.freePrice"),
              features: ["Daily journey", "Selected collections", "Basic progress", "Limited personalization"],
              cta: t("cta.startFree"),
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
              cta: t("cta.startJourney"),
              featured: true,
            },
          ].map((p) => (
            <div
              key={p.name}
              className={`flex flex-col rounded-2xl border p-8 ${p.featured ? "border-primary/50 bg-card" : "border-border bg-card/60"}`}
            >
              <p className="font-serif text-2xl">{p.name}</p>
              <p className="mt-2 font-serif text-4xl">
                {p.price}
                <span className="ml-1 text-sm text-muted-foreground">{t("pricing.month")}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--gold)" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8" variant={p.featured ? "default" : "outline"}>
                <Link to="/signup">{p.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="font-serif text-3xl leading-tight md:text-5xl">{t("final.title")}</h2>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link to="/signup">{t("cta.startFree")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
