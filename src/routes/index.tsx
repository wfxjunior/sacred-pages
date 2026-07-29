import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HeroMockup } from "@/components/site/HeroMockup";
import { HeroWordGrid } from "@/components/site/HeroWordGrid";
import { CollectionCard } from "@/components/site/CollectionCard";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { COLLECTIONS } from "@/lib/mock-data";
import { ChevronDown } from "lucide-react";
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
      {/* Hero — Aurora Editorial: mesh gradient + floating word search */}
      <section className="relative overflow-hidden bg-[#FCFBF8] pt-28 sm:pt-32 md:pt-36 lg:pt-40">
        {/* Stained-glass aurora — cobalt, gold, burgundy, emerald */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="aurora-blob-1 absolute -right-[12%] -top-[12%] h-[62%] w-[62%] rounded-full bg-[#2E5C9E]/25 blur-[130px]" />
          <div className="aurora-blob-2 absolute -left-[8%] top-[18%] h-[52%] w-[46%] rounded-full bg-[#C89F4F]/30 blur-[110px]" />
          <div className="aurora-blob-3 absolute bottom-[6%] right-[8%] h-[54%] w-[54%] rounded-full bg-[#7A4A5E]/22 blur-[130px]" />
          <div className="aurora-blob-1 absolute bottom-[14%] left-[10%] h-[42%] w-[42%] rounded-full bg-[#3F6B4E]/22 blur-[120px]" />
        </div>
        <div className="relative mx-auto w-full max-w-4xl px-5 sm:px-8 md:px-10 lg:px-12">
          <div className="flex flex-col items-center gap-12 pb-16 pt-6 text-center sm:gap-14 sm:pb-20 sm:pt-8 md:gap-16 md:pb-24 md:pt-10 lg:pb-28 lg:pt-12">
            {/* Text column */}
            <div className="w-full">
              <h1 className="mt-5 font-serif text-[clamp(2.5rem,10vw,3.75rem)] font-medium leading-[1.02] tracking-tight text-[#2D2926] sm:mt-6 sm:text-[clamp(3.25rem,7.5vw,4.75rem)] sm:leading-[0.98] md:text-[clamp(3.5rem,5.5vw,4.5rem)] md:leading-[0.96] lg:text-[clamp(4.25rem,5.5vw,5.5rem)] lg:leading-[0.94]">
                <span className="bg-gradient-to-tr from-[#2E5C9E] via-[#2D2926] to-[#7A4A5E] bg-clip-text text-transparent">
                  {t("brand.name")}
                </span>
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
                {[
                  { label: t("hero.chip.time"), fg: "#2E5C9E", bg: "#E4ECF8", bd: "#2E5C9E33" },
                  { label: t("hero.chip.devotional"), fg: "#7A4A5E", bg: "#F3E6EB", bd: "#7A4A5E33" },
                  { label: t("hero.chip.wordsearch"), fg: "#8A6A1F", bg: "#F6ECD5", bd: "#C89F4F55" },
                  { label: t("hero.chip.reflection"), fg: "#3F6B4E", bg: "#E4EEE6", bd: "#3F6B4E33" },
                ].map((c) => (
                  <span
                    key={c.label}
                    className="rounded-full border px-2.5 py-1 text-[10px] font-medium shadow-sm sm:px-3 sm:text-[11px]"
                    style={{ color: c.fg, backgroundColor: c.bg, borderColor: c.bd }}
                  >
                    {c.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Word search + devotional companion */}
            <div className="mx-auto grid w-full max-w-sm gap-6 sm:max-w-md md:max-w-lg lg:max-w-6xl lg:grid-cols-2 lg:items-stretch lg:gap-10 lg:text-left">
              <div className="relative flex">
                <div aria-hidden className="absolute -inset-4 rounded-[3rem] bg-gradient-to-tr from-[#2E5C9E]/25 via-[#C89F4F]/25 to-[#7A4A5E]/25 blur-2xl" />
                <div className="relative flex w-full">
                  <HeroWordGrid />
                </div>
              </div>
              <HeroDevotional />
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
    <aside className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#E4E0D6] bg-[#FBFAF6] text-left shadow-[0_20px_50px_-20px_rgba(43,41,38,0.18)]">
      {/* Magazine masthead */}
      <header className="flex items-center justify-between border-b border-[#E4E0D6] bg-white/70 px-6 py-3 sm:px-8">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C89F4F]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8A6A1F]">
            {t("hero.dev.eyebrow")}
          </span>
        </div>
        <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#6B665C]">
          {t("hero.dev.time")}
        </span>
      </header>

      {/* Body */}
      <div className="flex flex-1 flex-col px-6 py-6 sm:px-8 sm:py-7 lg:px-9 lg:py-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7A4A5E]">
          {t("hero.dev.ref")}
        </p>
        <h3 className="mt-2 font-serif text-[26px] leading-[1.05] text-[#2D2926] sm:text-[30px] lg:text-[34px]">
          {t("hero.dev.title")}
        </h3>
        <div aria-hidden className="mt-4 h-px w-10 bg-[#C89F4F]" />

        <p className="mt-4 text-[14.5px] leading-[1.7] text-[#4A463F] sm:text-[15px] sm:columns-2 sm:gap-6 [&>span]:break-inside-avoid">
          <span className="float-left mr-2 mt-1 font-serif text-[46px] leading-[0.85] text-[#2E5C9E] sm:text-[52px]">
            {firstLetter}
          </span>
          {restBody}
        </p>

        <div className="mt-6 border-t border-dashed border-[#E4E0D6] pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#2E5C9E]">
            {t("hero.dev.wordsTitle")}
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-2.5">
            {words.map((w) => (
              <li key={w.key} className="flex gap-2.5 text-[13px] leading-[1.5] text-[#2D2926]">
                <span
                  aria-hidden
                  className="mt-[6px] h-2 w-2 shrink-0 rounded-full ring-2 ring-white"
                  style={{ backgroundColor: w.color, boxShadow: `0 0 0 1px ${w.color}55` }}
                />
                <span>{t(`hero.dev.word.${w.key}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto flex items-center gap-3 pt-6">
          <span aria-hidden className="h-px flex-1 bg-[#E4E0D6]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8A6A1F]">
            {t("hero.dev.prompt")}
          </span>
          <span aria-hidden className="h-px flex-1 bg-[#E4E0D6]" />
        </div>
      </div>
    </aside>
  );
}
