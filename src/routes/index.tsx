import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HeroWordGrid } from "@/components/site/HeroWordGrid";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { getHeroVerse } from "@/lib/hero-verses";
import { CatalogGrid } from "@/components/site/CatalogGrid";
import { ChevronDown, ArrowRight } from "lucide-react";
import { LivingJournalSection } from "@/components/site/living-journal/LivingJournalSection";
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
      { property: "og:image", content: "https://www.lumenadaily.com/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://www.lumenadaily.com/og-image.png" },
    ],
  }),
  component: Landing,
});

function HeroDevotional() {
  const { t } = useI18n();
  const words = [
    { key: "peace", color: "#5E9E6E" },
    { key: "faith", color: "#3E7BC8" },
    { key: "light", color: "#E0A63A" },
    { key: "grace", color: "#D26A4E" },
    { key: "hope", color: "#8B5CA8" },
  ] as const;
  const bodyText = t("hero.dev.body");
  const firstLetter = bodyText.charAt(0);
  const restBody = bodyText.slice(1);
  return (
    <aside className="relative flex h-full w-full flex-col overflow-hidden bg-[#FBFAF6] text-left">
      <header className="flex items-center justify-between px-7 pt-6 sm:px-9 sm:pt-7">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C89F4F]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8A6A1F] sm:text-[11px]">
            {t("hero.dev.eyebrow")}
          </span>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#6B665C] sm:text-[11px]">
          {t("hero.dev.time")}
        </span>
      </header>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-6 lg:px-10 lg:pb-7 lg:pt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#7A4A5E] sm:text-[12px]">
          {t("hero.dev.ref")}
        </p>
        <h3 className="mt-2 font-serif text-[26px] font-semibold leading-[1.05] tracking-[-0.01em] text-[#1F1D1B] sm:text-[30px] lg:text-[38px]">
          {t("hero.dev.title")}
        </h3>
        <div aria-hidden className="mt-3 h-[2px] w-10 bg-[#C89F4F] sm:mt-4" />
        <p className="mt-4 font-serif text-[14px] leading-[1.6] text-[#2D2926]/85 sm:columns-2 sm:gap-6 sm:text-[14.5px]">
          <span className="float-left mr-2 mt-1 font-serif text-[42px] font-semibold leading-[0.82] text-[#2E5C9E] sm:text-[48px]">
            {firstLetter}
          </span>
          {restBody}
        </p>
        <div className="mt-5 border-t border-dashed border-[#D9D3C2] pt-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.28em] text-[#2E5C9E] sm:text-[11.5px]">
            {t("hero.dev.wordsTitle")}
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-2">
            {words.map((w) => (
              <li
                key={w.key}
                className="flex gap-2.5 text-[12.5px] leading-[1.45] text-[#2D2926]"
              >
                <span
                  aria-hidden
                  className="mt-[5px] h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: w.color,
                    boxShadow: `0 0 0 3px ${w.color}22`,
                  }}
                />
                <span>{t(`hero.dev.word.${w.key}`)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-auto flex items-center gap-3 pt-6">
          <span aria-hidden className="h-px flex-1 bg-[#E4E0D6]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8A6A1F]">
            {t("hero.dev.prompt")}
          </span>
          <span aria-hidden className="h-px flex-1 bg-[#E4E0D6]" />
        </div>
      </div>
    </aside>
  );
}

function MagazineSpread() {
  return (
    <div className="relative mx-auto w-full max-w-[720px]">
      {/* Soft, realistic shadow beneath the notebook */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-[#2B2B2B]/8 blur-xl"
      />

      {/* Notebook cover / open spread */}
      <div
        className="relative flex flex-col overflow-hidden rounded-md bg-[#3B2E26] p-1.5 shadow-xl sm:rounded-lg lg:flex-row"
        style={{
          boxShadow: "0 28px 60px -24px rgba(43,41,38,0.28), 0 12px 24px -12px rgba(43,41,38,0.16)",
        }}
      >
        {/* Left page */}
        <div className="relative flex-1 bg-[#FCFAF5] lg:rounded-l-sm">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-4 bg-gradient-to-l from-[#1F1D1B]/[0.07] to-transparent lg:block"
          />
          <HeroWordGrid />
        </div>

        {/* Center crease / gutter */}
        <div
          aria-hidden
          className="pointer-events-none relative z-20 flex-shrink-0 bg-[#E8E2D6] lg:h-auto lg:w-8"
          style={{
            background:
              "linear-gradient(180deg, rgba(31,29,27,0.04), rgba(31,29,27,0.10) 50%, rgba(31,29,27,0.04)), linear-gradient(90deg, #E8E2D6 0%, #D6CDB9 50%, #E8E2D6 100%)",
          }}
        >
          {/* Subtle central fold line */}
          <div className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-[#1F1D1B]/8 lg:block" />
        </div>

        {/* Right page */}
        <div className="relative flex-1 bg-[#FCFAF5] lg:rounded-r-sm">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-4 bg-gradient-to-r from-[#1F1D1B]/[0.07] to-transparent lg:block"
          />
          <HeroDevotional />
        </div>
      </div>
    </div>
  );
}

function Landing() {
  const { t, locale } = useI18n();
  // The landing verse rotates every two days (UTC-derived, SSR-stable).
  const verse = getHeroVerse(locale);
  return (
    <SiteLayout>
      {/* Hero — Reading room: cotton paper, soft daylight, quiet warmth */}
      <section className="paper-texture relative overflow-hidden pt-20 sm:pt-24 md:pt-24 lg:pt-28">
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
          <div className="grid grid-cols-1 items-center gap-12 pb-16 pt-6 sm:pb-20 sm:pt-8 md:pb-24 md:pt-10 lg:grid-cols-12 lg:gap-14 lg:pb-24 lg:pt-10 xl:gap-16">
            {/* Text column */}
            <div className="w-full text-center lg:col-span-5 lg:text-left">
              <div className="flex items-center justify-center gap-3 lg:justify-start">
                <span aria-hidden className="h-px w-8 bg-[#C89F4F]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#78866B]">
                  {t("hero.socialProof")}
                </span>
              </div>

              <h1 className="mt-5 font-serif text-[clamp(2.75rem,11vw,3.75rem)] font-medium leading-[1.03] tracking-tight text-[#1F1D1B] sm:mt-6 sm:text-[clamp(3.25rem,7.5vw,4.5rem)] lg:text-[clamp(3.5rem,4.6vw,4.75rem)] lg:leading-[1.02]">
                {/* The hero headline names the experience, not the brand —
                    the Lumena mark in the header supplies the brand. */}
                {t("brand.experience")}
              </h1>

              <p className="mx-auto mt-5 max-w-lg text-[16px] leading-[1.6] text-[#2D2926]/80 sm:mt-6 sm:text-[18px] lg:mx-0 lg:text-[19px]">
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
                {/*
                  Demoted to a quiet link on purpose: two equally heavy buttons
                  split the click, and the primary action is the one that starts
                  the journey.
                */}
                <a
                  href="#features"
                  className="group inline-flex items-center gap-2 border-b-2 border-transparent pb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#2B2B2B] transition-colors hover:border-[#C89F4F]"
                >
                  {t("hero.ctaExplore")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>

              <div className="mt-7 flex flex-col gap-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B88A3B]">
                  {t("hero.freeNote")}
                </p>
                {/* The verse supports the promise now instead of competing with it. */}
                <p className="font-serif text-[13px] italic leading-[1.5] text-[#2D2926]/50">
                  &ldquo;{verse.text}&rdquo; &mdash; {verse.ref}
                </p>
              </div>
            </div>

            {/* Open magazine spread — the product, visible above the fold */}
            <div className="relative w-full lg:col-span-7">
              <MagazineSpread />
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
          className="absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] tracking-widest text-[#6B665C]/60 transition hover:text-[#6B665C] sm:bottom-6 sm:flex sm:text-[11px]"
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
      <PricingPreview />
      <FAQ />
      <FinalCTA />
    </SiteLayout>
  );
}
