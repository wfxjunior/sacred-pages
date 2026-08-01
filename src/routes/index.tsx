import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HeroMockup } from "@/components/site/HeroMockup";
import { HeroWordGrid } from "@/components/site/HeroWordGrid";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { CatalogGrid } from "@/components/site/CatalogGrid";
import { ChevronDown } from "lucide-react";
import { LivingJournalSection } from "@/components/site/living-journal/LivingJournalSection";
import { JournalBinding } from "@/components/journal/JournalBinding";
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
      <div className="flex flex-1 flex-col px-7 pb-6 pt-6 sm:px-9 sm:pb-7 sm:pt-8 lg:px-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#7A4A5E] sm:text-[12px]">
          {t("hero.dev.ref")}
        </p>
        <h3 className="mt-2 font-serif text-[28px] font-semibold leading-[1.05] tracking-[-0.01em] text-[#1F1D1B] sm:text-[32px] lg:text-[38px]">
          {t("hero.dev.title")}
        </h3>
        <div aria-hidden className="mt-4 h-[2px] w-10 bg-[#C89F4F]" />
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
    <div className="relative mx-auto w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-6xl">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 rounded-[3rem] bg-gradient-to-b from-[#2B2B2B]/8 via-transparent to-[#2B2B2B]/12 blur-3xl"
      />
      <div
        className="paper-page relative overflow-hidden rounded-[10px] border border-[#E1DBCB] text-left sm:rounded-[14px]"
        style={{ perspective: "1600px" }}
      >
        <div className="relative grid grid-cols-1 lg:grid-cols-2 lg:items-stretch">
          <div className="relative">
            <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/[0.06] to-transparent" />
            <HeroWordGrid />
          </div>
          {/* Sewn linen spine — desktop */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-8 -translate-x-1/2 lg:block"
          >
            {/* Gutter shadow (page fold) */}
            <div className="absolute inset-y-0 left-1/2 h-full w-[28px] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#1F1D1B]/[0.10] to-transparent" />
            {/* Linen spine strip */}
            <div className="linen-spine absolute inset-y-2 left-1/2 h-[calc(100%-1rem)] w-[10px] -translate-x-1/2 rounded-[2px]" />
            {/* Spiral binding — sits above the linen gutter, which is kept
                underneath as the page fold. */}
            <JournalBinding orientation="vertical" />
          </div>
          {/* Sewn linen spine — mobile horizontal */}
          <div
            aria-hidden
            className="pointer-events-none relative h-5 lg:hidden"
          >
            <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-transparent via-[#1F1D1B]/[0.10] to-transparent" />
            <div
              className="linen-spine absolute inset-x-3 top-1/2 h-[8px] -translate-y-1/2 rounded-[2px]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(31,29,27,0.05), rgba(31,29,27,0.12) 50%, rgba(31,29,27,0.05)), repeating-linear-gradient(90deg, rgba(31,29,27,0.06) 0 1px, transparent 1px 3px), linear-gradient(0deg, #E9E4D8, #D9D2C1)",
              }}
            />
            {/*
              Below lg the spread stacks, so the two halves genuinely read as
              pages turning vertically — the one case where a horizontal binding
              is honest rather than decoration forced through unrelated content.
            */}
            <JournalBinding orientation="horizontal" />
          </div>
          <div className="relative">
            <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-black/[0.06] to-transparent" />
            <HeroDevotional />
          </div>
        </div>
      </div>
    </div>
  );
}

function Landing() {
  const { t } = useI18n();
  return (
    <SiteLayout>
      {/* Hero — Reading room: cotton paper, soft daylight, quiet warmth */}
      <section className="paper-texture relative overflow-hidden pt-28 sm:pt-32 md:pt-36 lg:pt-40">
        {/* Soft daylight — two very gentle warm halos, almost imperceptible */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="aurora-blob-1 absolute -right-[18%] -top-[18%] h-[55%] w-[55%] rounded-full bg-[#C89F4F]/[0.08] blur-[140px]" />
          <div className="aurora-blob-2 absolute -left-[14%] top-[22%] h-[48%] w-[42%] rounded-full bg-[#2E5C9E]/[0.06] blur-[140px]" />
        </div>
        <div className="relative mx-auto w-full max-w-4xl px-5 sm:px-8 md:px-10 lg:px-12">
          <div className="flex flex-col items-center gap-12 pb-16 pt-6 text-center sm:gap-14 sm:pb-20 sm:pt-8 md:gap-16 md:pb-24 md:pt-10 lg:pb-28 lg:pt-12">
            {/* Text column */}
            <div className="w-full">
              <h1 className="mt-5 font-serif text-[clamp(2.5rem,10vw,3.75rem)] font-medium leading-[1.02] tracking-tight text-[#2D2926] sm:mt-6 sm:text-[clamp(3.25rem,7.5vw,4.75rem)] sm:leading-[0.98] md:text-[clamp(3.5rem,5.5vw,4.5rem)] md:leading-[0.96] lg:text-[clamp(4.25rem,5.5vw,5.5rem)] lg:leading-[0.94]">
                {/* The hero headline names the experience, not the brand —
                    the Lumena mark in the header supplies the brand. */}
                <span className="text-[#1F1D1B]">{t("brand.experience")}</span>
              </h1>

              <p className="mx-auto mt-5 max-w-md text-[15px] leading-[1.55] text-[#6B665C] sm:mt-6 sm:max-w-lg sm:text-[17px] md:max-w-xl md:text-[18px] lg:text-[19px] lg:leading-[1.5]">
                {t("hero.subAtmospheric")}
              </p>

              <figure className="mx-auto mt-6 max-w-md sm:mt-7 sm:max-w-lg md:max-w-xl">
                <div className="flex items-center justify-center gap-3">
                  <span aria-hidden className="h-px w-8 bg-[#C89F4F]/70" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#C89F4F]/90 sm:text-[11px]">
                    {t("hero.verseRef")}
                  </span>
                </div>
                <blockquote className="mt-2 font-serif text-[17px] italic leading-[1.45] text-[#2B2B2B]/85 sm:text-[19px] md:text-[20px]">
                  &ldquo;{t("hero.verse")}&rdquo;
                </blockquote>
              </figure>

              <div className="mt-7 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-12 w-full justify-center rounded-full bg-[#2E5C9E] px-6 text-[15px] font-semibold text-white shadow-[0_10px_28px_-10px_rgba(46,92,158,0.55)] hover:bg-[#1F3F70] sm:h-12 sm:w-auto sm:min-w-[168px]"
                >
                  <Link to="/today">{t("hero.ctaStart")}</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 w-full justify-center rounded-full border-[#2E5C9E]/25 bg-white px-6 text-[15px] font-medium text-[#2E5C9E] hover:bg-[#E4ECF8] hover:text-[#1F3F70] sm:h-12 sm:w-auto sm:min-w-[168px]"
                >
                  <a href="#features">{t("hero.ctaExplore")}</a>
                </Button>
              </div>

              <div className="mt-7 flex flex-wrap justify-center gap-1.5 sm:mt-8 sm:gap-2">
                {/* Quiet, editorial chips: ink on paper with one gold hairline.
                    Four saturated pills read as edtech; this reads as a masthead. */}
                {[
                  { label: t("hero.chip.time") },
                  { label: t("hero.chip.devotional") },
                  { label: t("hero.chip.wordsearch") },
                  { label: t("hero.chip.reflection") },
                ].map((c) => (
                  <span
                    key={c.label}
                    className="rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] sm:px-3 sm:text-[10.5px]"
                    style={{
                      color: "#6B665C",
                      backgroundColor: "transparent",
                      borderColor: "#D9D3C2",
                    }}
                  >
                    {c.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Open magazine spread */}
            <MagazineSpread />
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
