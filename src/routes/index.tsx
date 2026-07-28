import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HeroMockup } from "@/components/site/HeroMockup";
import { HeroWordGrid } from "@/components/site/HeroWordGrid";
import { CollectionCard } from "@/components/site/CollectionCard";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { COLLECTIONS } from "@/lib/mock-data";
import { ArrowRight, ChevronDown, Play } from "lucide-react";
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
          loading="eager"
          className="animate-cloud-drift absolute inset-0 h-full w-full object-cover will-change-transform"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(17,17,19,0.35) 0%, rgba(17,17,19,0.45) 40%, rgba(17,17,19,0.72) 80%, rgba(17,17,19,0.90) 100%)",
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-20 pt-28 sm:px-8 sm:pb-24 sm:pt-32 md:px-10 md:pb-28 md:pt-36 lg:px-12 lg:pb-32 lg:pt-40">
          <div className="max-w-[42rem] md:max-w-3xl lg:max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur sm:text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
              {t("hero.eyebrow")}
            </span>

            <h1 className="mt-5 font-serif text-[clamp(2.5rem,10vw,3.75rem)] font-medium leading-[1.02] tracking-tight text-white sm:mt-6 sm:text-[clamp(3.25rem,7.5vw,4.75rem)] sm:leading-[0.98] md:text-[clamp(4rem,7vw,5.5rem)] md:leading-[0.96] lg:text-[clamp(4.75rem,6.5vw,6.5rem)] lg:leading-[0.94]">
              {t("brand.name")}
            </h1>

            <p className="mt-5 max-w-md text-[15px] leading-[1.55] text-white/75 sm:mt-6 sm:max-w-lg sm:text-[17px] md:max-w-xl md:text-[19px] lg:text-[21px] lg:leading-[1.5]">
              {t("hero.subAtmospheric")}
            </p>

            <figure className="mt-6 max-w-md sm:mt-7 sm:max-w-lg md:max-w-xl">
              <div className="flex items-center gap-3">
                <span aria-hidden className="h-px w-8 bg-[color:var(--gold)]/70" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--gold)]/90 sm:text-[11px]">
                  {t("hero.verseRef")}
                </span>
              </div>
              <blockquote className="mt-2 font-serif text-[17px] italic leading-[1.45] text-white/85 sm:text-[19px] md:text-[21px]">
                &ldquo;{t("hero.verse")}&rdquo;
              </blockquote>
            </figure>

            <div className="mt-7 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 w-full justify-center rounded-full bg-white px-6 text-[15px] font-semibold text-[#111113] hover:bg-white/90 sm:h-12 sm:w-auto sm:min-w-[168px]"
              >
                <Link to="/today">
                  {t("hero.ctaStart")} <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-12 w-full justify-center rounded-full border border-white/20 bg-white/5 px-6 text-[15px] font-medium text-white hover:bg-white/10 hover:text-white sm:h-12 sm:w-auto sm:min-w-[168px]"
              >
                <a href="#features">
                  <Play className="mr-1.5 h-4 w-4" /> {t("hero.ctaExplore")}
                </a>
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap gap-1.5 sm:mt-8 sm:gap-2">
              {[t("hero.chip.time"), t("hero.chip.devotional"), t("hero.chip.wordsearch"), t("hero.chip.reflection")].map(
                (c) => (
                  <span
                    key={c}
                    className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] text-white/70 backdrop-blur sm:px-3 sm:text-[11px]"
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
          className="absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] tracking-widest text-white/40 transition hover:text-white/70 sm:bottom-6 sm:flex sm:text-[11px]"
          aria-label="Scroll to explore"
        >
          {t("hero.scrollHint")}
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </a>
      </section>

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
