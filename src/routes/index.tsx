import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HeroJournal } from "@/components/site/HeroJournal";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { CatalogGrid } from "@/components/site/CatalogGrid";
import { ChevronDown, ArrowRight, Globe, Smartphone } from "lucide-react";
import { LivingJournalSection } from "@/components/site/living-journal/LivingJournalSection";
import { StartPlanBand, TrustStrip } from "@/components/site/landing/TrustAndStart";
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
      { title: "Lumena — Daily Bible Devotional & Word Search" },
      {
        name: "description",
        content:
          "Lumena turns your daily Bible time into a calm ritual: a short devotional, an interactive Scripture word search, reflection and prayer — in about five minutes.",
      },
      {
        property: "og:title",
        content: "Lumena — Daily Bible Devotional & Word Search",
      },
      {
        property: "og:description",
        content:
          "Five calm minutes with Scripture each day — devotional, interactive word search, reflection and prayer in one place.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.lumenadaily.com/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://www.lumenadaily.com/og-image.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify([
          { "@context": "https://schema.org", "@type": "WebSite", name: "Lumena", url: "https://lumenadaily.com/" },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Lumena",
            url: "https://lumenadaily.com/",
            logo: "https://lumenadaily.com/icon-512.png",
          },
        ]),
      },
    ],
  }),
  component: Landing,
});


function Landing() {
  const { t } = useI18n();
  return (
    <SiteLayout>
      {/* Hero — Reading room: cotton paper, soft daylight, quiet warmth */}
      <section className="paper-texture relative overflow-hidden pt-20 sm:pt-24 md:pt-24 lg:pt-20">
        {/* Soft daylight — two very gentle warm halos, almost imperceptible */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="aurora-blob-1 absolute -right-[18%] -top-[18%] h-[55%] w-[55%] rounded-full bg-[#C89F4F]/[0.08] blur-[140px]" />
          <div className="aurora-blob-2 absolute -left-[14%] top-[22%] h-[48%] w-[42%] rounded-full bg-[#2E5C9E]/[0.06] blur-[140px]" />
        </div>
        <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 md:px-10 lg:px-12">
          {/*
            Conversion layout: the promise and the single primary action sit on
            the left, and the product itself — the journal spread — sits beside
            them so it is visible without scrolling. Below lg it stacks, copy
            first.
          */}
          <div className="grid grid-cols-1 items-center gap-12 pb-16 pt-6 sm:pb-20 sm:pt-8 md:pb-24 md:pt-10 lg:grid-cols-12 lg:gap-10 lg:pb-20 lg:pt-6 xl:gap-14">
            {/* Text column */}
            <div className="w-full text-center lg:col-span-5 xl:col-span-4 lg:text-left">
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 lg:justify-start">
                <span aria-hidden className="h-px w-8 bg-[#C89F4F]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#78866B]">
                  {t("hero.socialProof")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden className="text-[12px] leading-none text-[#C89F4F]">
                    ★★★★★
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2D2926]/55">
                    {t("hero.rating")}
                  </span>
                </span>
              </div>

              <h1 className="mt-5 font-serif text-[clamp(2.35rem,9.4vw,3.2rem)] font-medium leading-[1.04] tracking-tight text-[#1F1D1B] sm:mt-6 sm:text-[clamp(2.75rem,6.4vw,3.85rem)] lg:text-[clamp(3rem,3.9vw,4rem)] lg:leading-[1.03]">
                {/* The hero headline names the experience, not the brand —
                    the Lumena mark in the header supplies the brand. */}
                {t("brand.experience")}
              </h1>

              {/* Functional sub-label: the headline is evocative, this line
                  says plainly what the product is for search-minded readers. */}
              <p className="mt-3.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#5C6B50] sm:text-[12.5px]">
                {t("hero.kicker")}
              </p>

              <p className="mx-auto mt-4 max-w-lg text-[16px] leading-[1.6] text-[#2D2926]/80 sm:mt-5 sm:text-[17px] lg:mx-0 lg:text-[18px]">
                {t("hero.promise")}
              </p>


              <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-8 lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  variant="editorial"
                  className="h-13 w-full justify-center px-9 py-4 text-[15px] sm:w-auto sm:min-w-[210px]"
                >
                  <Link to="/today">{t("hero.ctaStart")}</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="editorialOutline"
                  className="h-13 w-full justify-center px-9 py-4 text-[15px] sm:w-auto sm:min-w-[210px]"
                >
                  <a href="#features" className="group">
                    {t("hero.ctaExplore")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              </div>

              <div className="mt-7 flex flex-col gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B88A3B]">
                  {t("hero.freeNote")}
                </p>
                {/* Language and install signals on a single line: a Spanish or
                    Portuguese reader must see support before scrolling. */}
                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-[#2D2926]/55 lg:justify-start">
                  <span className="inline-flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden />
                    {t("hero.langNote")}
                  </span>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden />
                    {t("hero.installNote")}
                  </span>
                </div>
              </div>


            </div>

            {/* Open magazine spread — the product, visible above the fold */}
            <div className="relative w-full lg:col-span-7 xl:col-span-8">
              <HeroJournal />
            </div>
          </div>
        </div>

        {/* Soft transition divider */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#E4E0D6] to-transparent"
        />

        <a
          href="#features"
          className="absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-0.5 text-[10px] uppercase tracking-[0.22em] text-[#6B665C]/85 transition hover:text-[#2B2B2B] sm:bottom-5 sm:flex sm:text-[10.5px]"
          aria-label={t("hero.scrollAria")}
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
        <CatalogGrid limit={6} />
      </LandingSection>

      <StartPlanBand />
      <Personalization />
      <JourneyTogether />
      <ProgressShowcase />
      <Testimonials />
      {/*
        Placed after the sections that explain the experience and immediately
        before pricing: the Living Journal is the last emotional beat before the
        ask, widening from "your journey" to "others are quietly walking it too".
      */}
      <LivingJournalSection />
      <TrustStrip />
      <PricingPreview />
      <FAQ />
      <FinalCTA />
    </SiteLayout>
  );
}
