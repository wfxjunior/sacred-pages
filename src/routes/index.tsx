import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HeroJournal } from "@/components/site/HeroJournal";
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
    <aside className="relative flex h-full w-full flex-col overflow-hidden bg-[#F9F7F2] text-left">
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-6 lg:px-8 lg:pb-6 lg:pt-6">
        <div className="flex items-center justify-between border-b border-[#2B2B2B]/10 pb-3 sm:pb-4">
          <span className="font-['Crimson_Pro',serif] text-[10px] uppercase tracking-[0.18em] text-[#2B2B2B]/40 sm:text-xs">
            {t("hero.dev.volume")}
          </span>
          <span className="font-['Crimson_Pro',serif] text-xs italic text-[#C89F4F] sm:text-sm">
            {t("hero.dev.page")}
          </span>
        </div>

        <article className="mt-4 min-h-0 flex-1">
          <h3 className="font-['Playfair_Display',serif] text-[24px] font-bold leading-[1.05] tracking-[-0.01em] text-[#2B2B2B] sm:text-[28px] lg:text-[30px]">
            {t("hero.dev.title")}
          </h3>
          <div
            aria-hidden
            className="mt-3 h-[2px] w-10 bg-[#C89F4F]"
          />
          <div className="mt-4 font-['Crimson_Pro',serif] text-[15px] leading-[1.5] text-[#2B2B2B]/85 sm:text-[15.5px]">
            <p>
              <span className="float-left mr-2 mt-1 font-['Playfair_Display',serif] text-[44px] font-semibold leading-[0.82] text-[#78866B] sm:text-[50px]">
                {firstLetter}
              </span>
              {restBody}
            </p>
          </div>

          <blockquote className="mt-5 border-y border-[#C89F4F]/20 py-3 font-['Crimson_Pro',serif] text-base italic leading-snug text-[#78866B] sm:text-[17px]">
            &ldquo;{t("hero.dev.verse")}&rdquo;
            <footer className="mt-2 block font-['Crimson_Pro',serif] text-[10px] not-italic uppercase tracking-[0.2em] text-[#C89F4F]">
              {t("hero.dev.ref")}
            </footer>
          </blockquote>
        </article>

        {/* On the square spread the left page already lists the words, so this
            legend only shows where there is vertical room (stacked layout). */}
        <div className="mt-4 shrink-0 border-t border-dashed border-[#D9D3C2] pt-3 lg:hidden">
          <p className="font-['Crimson_Pro',serif] text-[10.5px] font-semibold uppercase tracking-[0.28em] text-[#2B2B2B]/60 sm:text-[11.5px]">
            {t("hero.dev.wordsTitle")}
          </p>
          <ul className="mt-2.5 grid gap-2 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-1.5">
            {words.map((w) => (
              <li
                key={w.key}
                className="flex gap-2.5 font-['Crimson_Pro',serif] text-[12.5px] leading-[1.4] text-[#2D2926]"
              >
                <span
                  aria-hidden
                  className="mt-[5px] h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: w.color,
                    boxShadow: `0 0 0 3px ${w.color}22`,
                  }}
                />
                <span className="line-clamp-2">{t(`hero.dev.word.${w.key}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

function HeroDevotionalPage() {
  return <HeroDevotional />;
}

function MagazineSpread() {
  return (
    <div className="relative mx-auto w-full max-w-[760px] lg:max-w-[min(760px,calc(100dvh-8rem))]">
      {/* Realistic drop shadow beneath the closed cover */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-[#1F1D1B]/15 blur-2xl"
      />

      {/* Leather cover underlay */}
      <div
        className="relative overflow-hidden rounded-lg bg-[#78866B] p-3 shadow-2xl sm:rounded-xl sm:p-4 lg:aspect-square"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%, rgba(0,0,0,0.12) 100%)",
          boxShadow:
            "0 50px 100px -30px rgba(0,0,0,0.32), 0 24px 48px -24px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {/* Leather grain texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
            mixBlendMode: "multiply",
          }}
        />

        {/* Pages stack visible beneath the open spread */}
        <div aria-hidden className="pointer-events-none absolute -bottom-4 left-8 right-8 h-5 rounded-b-md bg-[#F5F3EE]/70 shadow-sm" />
        <div aria-hidden className="pointer-events-none absolute -bottom-7 left-12 right-12 h-5 rounded-b-md bg-[#F5F3EE]/50 shadow-sm" />

        {/* Silk bookmark — tucked into the spine so it never crosses the text */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-1 left-1/2 z-30 hidden h-24 w-2.5 -translate-x-1/2 rounded-b-sm shadow-md lg:block"
          style={{
            background:
              "linear-gradient(90deg, #b88a3b 0%, #C89F4F 40%, #d4b466 60%, #b88a3b 100%)",
          }}
        />

        {/* Open spread */}
        <div className="relative flex flex-col overflow-hidden rounded-sm bg-[#F9F7F2] lg:h-full lg:flex-row">
          {/* Paper grain texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 opacity-[0.18]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Left page */}
          <div className="relative flex min-w-0 flex-1 flex-col justify-center overflow-hidden border-b border-black/[0.08] lg:min-h-0 lg:border-b-0 lg:border-r">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-6 bg-gradient-to-l from-[#1F1D1B]/[0.09] to-transparent lg:block"
            />
            <HeroWordGrid />
          </div>

          {/* Central gutter / spine — horizontal on mobile, vertical on desktop */}
          <div
            aria-hidden
            className="pointer-events-none relative z-20 flex-shrink-0 h-3 bg-[#E8E2D6] lg:h-auto lg:w-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(31,29,27,0.05), rgba(31,29,27,0.14) 50%, rgba(31,29,27,0.05)), linear-gradient(90deg, #E8E2D6 0%, #CFC6B0 50%, #E8E2D6 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(255,255,255,0.25)",
            }}
          >
            <div className="absolute left-1/2 top-1/2 hidden h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-[#1F1D1B]/12 lg:block lg:h-auto lg:w-px lg:-translate-y-0" />
          </div>

          {/* Right page */}
          <div className="relative flex min-w-0 flex-1 flex-col justify-center overflow-hidden lg:min-h-0">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-6 bg-gradient-to-r from-[#1F1D1B]/[0.09] to-transparent lg:block"
            />
            <HeroDevotionalPage />
          </div>
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
          <div className="grid grid-cols-1 items-center gap-12 pb-16 pt-6 sm:pb-20 sm:pt-8 md:pb-24 md:pt-10 lg:grid-cols-12 lg:gap-14 lg:pb-12 lg:pt-6 xl:gap-16">
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
