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
      {/* Hero — atmospheric monumental */}
      <section className="relative flex min-h-screen flex-col justify-end overflow-hidden bg-[#111113]">
        <img
          src={heroAtmosphere.url}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(17,17,19,0.35) 0%, rgba(17,17,19,0.45) 40%, rgba(17,17,19,0.72) 80%, rgba(17,17,19,0.90) 100%)",
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-32 sm:px-6 sm:pb-20 sm:pt-36 md:pb-24 lg:pb-28">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
              {t("hero.eyebrow")}
            </span>

            <h1 className="mt-6 font-serif text-[clamp(44px,9vw,96px)] font-medium leading-[0.95] tracking-tight text-white">
              {t("brand.name")}
            </h1>

            <p className="mt-6 max-w-xl text-[17px] leading-[1.5] text-white/70 sm:text-[19px] md:text-[21px]">
              {t("hero.subAtmospheric")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="w-full rounded-full bg-white text-[#111113] hover:bg-white/90 sm:w-auto"
              >
                <Link to="/today">
                  {t("hero.ctaStart")} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="w-full rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:w-auto"
              >
                <a href="#features">
                  <Play className="mr-1 h-4 w-4" /> {t("hero.ctaExplore")}
                </a>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {[t("hero.chip.time"), t("hero.chip.devotional"), t("hero.chip.wordsearch"), t("hero.chip.reflection")].map(
                (c) => (
                  <span
                    key={c}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-white/70 backdrop-blur"
                  >
                    {c}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        <a
          href="#features"
          className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-[11px] tracking-widest text-white/40 transition hover:text-white/70"
          aria-label="Scroll to explore"
        >
          {t("hero.scrollHint")}
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </a>
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
