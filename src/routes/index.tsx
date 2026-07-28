import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HeroMockup } from "@/components/site/HeroMockup";
import { CollectionCard } from "@/components/site/CollectionCard";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { COLLECTIONS } from "@/lib/mock-data";
import { ArrowRight, ChevronDown, Play } from "lucide-react";
import heroAtmosphere from "@/assets/hero-atmosphere.jpg.asset.json";
import {
  ProductOverview,
  HowItWorks,
  Personalization,
  JourneyTogether,
  ProgressShowcase,
  Testimonials,
  PricingPreview,
  FAQ,
  FinalCTA,
  LandingSection,
} from "@/components/site/landing/LandingSections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jornadas — Your daily journey through God's Word" },
      {
        name: "description",
        content:
          "A premium daily Bible journey platform. Devotionals, interactive word searches, reflections and prayer, designed for a few meaningful minutes each day.",
      },
      {
        property: "og:title",
        content: "Jornadas — Your daily journey through God's Word",
      },
      {
        property: "og:description",
        content:
          "Build a daily habit with God's Word — devotional, interactive word search, reflection and prayer, all in one calm space.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useI18n();
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 15% 10%, color-mix(in oklab, var(--brand) 8%, transparent), transparent 60%), radial-gradient(50% 40% at 90% 30%, color-mix(in oklab, var(--brand) 5%, transparent), transparent 60%), radial-gradient(50% 40% at 80% 90%, color-mix(in oklab, var(--sage) 4%, transparent), transparent 60%)",
          }}
        />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-6 sm:py-20 md:py-24 lg:grid-cols-[minmax(0,40fr)_minmax(0,60fr)] lg:gap-16 lg:py-28">
          <div className="flex flex-col">
            <span
              className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-card/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] backdrop-blur"
              style={{ color: "var(--brand)" }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--brand)" }}
              />
              {t("hero.label")}
            </span>
            <h1 className="mt-6 font-serif text-[38px] leading-[1.04] tracking-tight sm:text-[46px] md:text-[52px] lg:text-[60px]">
              Make God's Word part of your everyday life.
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground sm:text-base md:max-w-lg md:text-[17px]">
              Daily devotionals, interactive Bible word searches, reflections and
              prayer — designed to help you grow through a few meaningful minutes
              every day.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="w-full rounded-full sm:w-auto">
                <Link to="/today">
                  Start Today's Journey <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="w-full rounded-full sm:w-auto"
              >
                <a href="#features">
                  <Play className="mr-1 h-4 w-4" /> Explore the Experience
                </a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {[
                "5–10 Minutes",
                "Daily Devotional",
                "Interactive Word Search",
                "Reflection & Prayer",
              ].map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-border/60 bg-card/60 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="w-full max-w-2xl mx-auto lg:mx-0 lg:max-w-none">
            <HeroMockup />
          </div>
        </div>
      </section>

      <ProductOverview />
      <HowItWorks />

      {/* Journey Preview */}
      <LandingSection
        tone="surface"
        eyebrow={t("journeyPreview.eyebrow")}
        title={t("journeyPreview.title")}
        sub={t("journeyPreview.sub")}
      >
        <div className="mx-auto max-w-4xl">
          <HeroMockup />
        </div>
      </LandingSection>

      {/* Collections */}
      <LandingSection
        eyebrow="Collections"
        title={t("collections.title")}
        sub={t("collections.sub")}
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.slice(0, 6).map((c) => (
            <CollectionCard key={c.slug} c={c} />
          ))}
        </div>
      </LandingSection>

      <Personalization />
      <JourneyTogether />
      <ProgressShowcase />
      <Testimonials />
      <PricingPreview />
      <FAQ />
      <FinalCTA />
    </SiteLayout>
  );
}
