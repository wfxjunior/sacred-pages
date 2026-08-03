import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, Minus, Heart, Users, ArrowRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Choose the journey that fits your season" },
      {
        name: "description",
        content:
          "Start free and upgrade whenever you're ready for deeper study, personalization and shared journeys.",
      },
      { property: "og:title", content: "Pricing — Jornadas da Palavra" },
      {
        property: "og:description",
        content:
          "A simple, honest membership. Free and Premium plans, monthly or yearly, cancel anytime.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pricing,
});

type Cycle = "monthly" | "yearly";

const FREE_FEATURES = [
  "Daily Journey",
  "Selected Collections",
  "Basic Progress",
  "Limited Personalization",
  "Language Selection",
  "Dark Mode",
  "Basic Milestones",
];

const PREMIUM_FEATURES = [
  "Everything in Free",
  "Unlimited Collections",
  "Journey Together",
  "Future Family Features",
  "Future Small Groups",
  "Advanced Progress",
  "Exclusive Journey Series",
  "Priority Support",
  "Unlimited Personalization",
  "Early Access Features",
  "Future AI Features",
];

type Cell = boolean | "soon";
type Row = { label: string; free: Cell; premium: Cell };

const COMPARISON: { section: string; rows: Row[] }[] = [
  {
    section: "Daily Experience",
    rows: [
      { label: "Daily Journey", free: true, premium: true },
      { label: "Bible Word Search", free: true, premium: true },
      { label: "Devotionals", free: true, premium: true },
      { label: "Prayer", free: true, premium: true },
      { label: "Reflection", free: true, premium: true },
    ],
  },
  {
    section: "Library",
    rows: [
      { label: "Collections", free: true, premium: true },
      { label: "Unlimited Collections", free: false, premium: true },
      { label: "Favorites", free: true, premium: true },
      { label: "Milestones", free: true, premium: true },
    ],
  },
  {
    section: "Journey Together",
    rows: [
      { label: "Journey Together", free: false, premium: true },
      { label: "Family Mode", free: false, premium: "soon" },
      { label: "Group Mode", free: false, premium: "soon" },
    ],
  },
  {
    section: "Personalization",
    rows: [
      { label: "Personalization", free: true, premium: true },
      { label: "Difficulty", free: true, premium: true },
      { label: "Languages", free: true, premium: true },
      { label: "Dark Mode", free: true, premium: true },
    ],
  },
  {
    section: "Coming Soon",
    rows: [
      { label: "Offline Mode", free: "soon", premium: "soon" },
      { label: "Audio Bible", free: "soon", premium: "soon" },
      { label: "AI Assistant", free: false, premium: "soon" },
      { label: "Priority Support", free: false, premium: true },
    ],
  },
];

const FAQS = [
  {
    q: "Can I use the platform for free?",
    a: "Yes. The Free plan includes the full daily journey experience — devotional, word search, reflection and prayer — with selected collections and dark mode. No credit card required.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. You can cancel your Premium membership at any time from Settings. You keep access until the end of your current billing period.",
  },
  {
    q: "What is included in Premium?",
    a: "Everything in Free, plus unlimited collections, Journey Together, unlimited personalization, exclusive series, priority support, and early access to future features including Family Mode and AI-assisted reflection.",
  },
  {
    q: "Can I study with my spouse?",
    a: "Yes. Premium includes Journey Together — invite your spouse to walk through the same journey with private reflections and a shared streak.",
  },
  {
    q: "Can I invite friends?",
    a: "Yes. Premium members can invite friends, a mentor, or a small group to complete journeys together and encourage one another.",
  },
  {
    q: "Can I create family journeys?",
    a: "Family Mode is coming soon as part of Premium. It will include age-appropriate versions for kids and shared household journeys.",
  },
  {
    q: "Can churches use the platform?",
    a: "Yes. Small Groups and church tooling — with weekly studies, leader notes, and private prayer requests — are coming soon as part of Premium.",
  },
  {
    q: "Will more languages be added?",
    a: "Yes. We're actively working on French, German, Italian and more. English, Portuguese and Spanish are fully supported today.",
  },
  {
    q: "Can I switch between monthly and yearly?",
    a: "Yes. You can switch billing cycles at any time from Settings. Yearly saves roughly two months compared to paying monthly.",
  },
  {
    q: "Will there be lifetime plans?",
    a: "We're considering a limited lifetime option for founding members. Join the waitlist from Settings to be notified.",
  },
  {
    q: "Will there be mobile apps?",
    a: "The platform is already an installable PWA — add it to your home screen from any modern browser. Native iOS and Android apps are on the roadmap.",
  },
];

function Pricing() {
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const premiumMonthly = 6;
  const premiumYearly = 60; // ~ $5/mo billed yearly
  const yearlyIfMonthly = premiumMonthly * 12; // 72
  const yearlySavings = yearlyIfMonthly - premiumYearly; // 12
  const yearlyPercent = Math.round((yearlySavings / yearlyIfMonthly) * 100); // 17
  const premiumPrice = cycle === "monthly" ? `$${premiumMonthly}` : `$${premiumYearly}`;
  const premiumSuffix = cycle === "monthly" ? "/month" : "/year";
  const premiumHint =
    cycle === "monthly"
      ? "Billed monthly, cancel anytime."
      : "That's $5/month — save 2 months.";

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 20% 10%, color-mix(in oklab, var(--brand) 8%, transparent), transparent 60%), radial-gradient(50% 40% at 85% 30%, color-mix(in oklab, var(--sage) 6%, transparent), transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-6 md:py-32">
          <span
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] backdrop-blur"
            style={{ color: "var(--brand)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--brand)" }}
            />
            Membership
          </span>
          <h1 className="mt-6 font-serif text-[40px] leading-[1.05] tracking-tight sm:text-[52px] md:text-[64px]">
            Choose the journey that fits your{" "}
            season.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-muted-foreground md:text-lg">
            Start free and upgrade whenever you're ready for deeper study,
            personalization and shared journeys.
          </p>

          {/* Cycle toggle */}
          <div className="mt-10 inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/80 p-1 backdrop-blur">
            {(["monthly", "yearly"] as Cycle[]).map((c) => {
              const active = cycle === c;
              return (
                <button
                  key={c}
                  onClick={() => setCycle(c)}
                  className={`relative rounded-full px-4 py-2 text-[13px] font-medium transition ${
                    active
                      ? "text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={active ? { background: "var(--brand)" } : undefined}
                >
                  {c === "monthly" ? "Monthly" : "Yearly"}
                  {c === "yearly" && (
                    <span
                      className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
                      style={
                        active
                          ? { background: "rgba(255,255,255,0.2)", color: "#fff" }
                          : {
                              background:
                                "color-mix(in oklab, var(--sage) 16%, transparent)",
                              color: "var(--sage)",
                            }
                      }
                    >
                      Save {yearlyPercent}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 md:py-20">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Free */}
            <div className="flex flex-col rounded-3xl border border-border/60 bg-card p-8 md:p-10">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--sage)" }}>
                  Free
                </p>
              </div>
              <p className="mt-5 font-serif text-2xl">Begin your rhythm.</p>
              <p className="mt-3 font-serif text-5xl leading-none">
                $0
                <span className="ml-2 text-sm text-muted-foreground">forever</span>
              </p>
              <p className="mt-3 text-[13px] text-muted-foreground">
                Everything you need to start a daily habit.
              </p>
              <Button asChild className="mt-8 h-11 w-full px-6 text-[15px]" variant="editorialOutline">
                <Link to="/signup">Start Free</Link>
              </Button>
              <ul className="mt-8 space-y-3 text-[14px]">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: "var(--sage)" }}
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium */}
            <div
              className="relative flex flex-col rounded-3xl border bg-card p-8 md:p-10"
              style={{
                boxShadow:
                  "0 0 0 1px color-mix(in oklab, var(--brand) 50%, transparent), 0 40px 100px -60px rgba(37,99,235,0.55)",
                borderColor: "transparent",
              }}
            >
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white"
                style={{ background: "var(--brand)" }}
              >
                Recommended
              </span>
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--brand)" }}>
                  Premium
                </p>
              </div>
              <p className="mt-5 font-serif text-2xl">Go deeper, together.</p>
              <p className="mt-3 font-serif text-5xl leading-none">
                {cycle === "yearly" && (
                  <span className="mr-3 align-middle font-serif text-2xl text-muted-foreground line-through">
                    ${yearlyIfMonthly}
                  </span>
                )}
                {premiumPrice}
                <span className="ml-2 text-sm text-muted-foreground">
                  {premiumSuffix}
                </span>
              </p>
              <p className="mt-3 text-[13px] text-muted-foreground">
                {premiumHint}
              </p>
              {cycle === "yearly" && (
                <div
                  className="mt-4 flex items-center gap-3 rounded-2xl border px-4 py-3"
                  style={{
                    borderColor: "color-mix(in oklab, var(--sage) 40%, transparent)",
                    background: "color-mix(in oklab, var(--sage) 10%, transparent)",
                  }}
                >
                  <span
                    className="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
                    style={{ background: "var(--sage)" }}
                  >
                    −{yearlyPercent}%
                  </span>
                  <p className="text-[13px] leading-snug">
                    <span className="font-medium">You save ${yearlySavings} a year</span>
                    <span className="text-muted-foreground"> — two months free, billed once.</span>
                  </p>
                </div>
              )}
              <Button asChild variant="editorial" className="mt-8 h-11 w-full px-6 text-[15px]">
                <Link to="/signup">
                  Start Premium <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <ul className="mt-8 space-y-3 text-[14px]">
                {PREMIUM_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: "var(--brand)" }}
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="border-t border-border/60 bg-[color:var(--surface-2)]">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-6 md:py-28">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--brand)" }}>
              Compare plans
            </p>
            <h2 className="font-serif text-3xl leading-tight md:text-[44px]">
              A clear look at what's included.
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
            <div className="grid grid-cols-[1.5fr_1fr_1fr] items-center gap-4 border-b border-border/60 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:px-8">
              <span>Feature</span>
              <span className="text-center" style={{ color: "var(--sage)" }}>Free</span>
              <span className="text-center" style={{ color: "var(--brand)" }}>Premium</span>
            </div>
            {COMPARISON.map((sec) => (
              <div key={sec.section}>
                <div
                  className="border-b border-border/60 bg-[color:var(--surface-2)] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] sm:px-8"
                  style={{ color: "var(--walnut)" }}
                >
                  {sec.section}
                </div>
                {sec.rows.map((r) => (
                  <div
                    key={r.label}
                    className="grid grid-cols-[1.5fr_1fr_1fr] items-center gap-4 border-b border-border/50 px-5 py-3.5 text-[14px] last:border-b-0 sm:px-8"
                  >
                    <span>{r.label}</span>
                    <span className="flex justify-center">
                      <CellMark v={r.free} />
                    </span>
                    <span className="flex justify-center">
                      <CellMark v={r.premium} highlight />
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Premium */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-4xl px-5 py-24 sm:px-6 md:py-32">
          <div className="max-w-2xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--brand)" }}>
              Why Premium
            </p>
            <h2 className="font-serif text-3xl leading-tight md:text-[44px]">
              God's Word should never be locked. Premium exists so this can last.
            </h2>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <p className="text-[16px] leading-relaxed text-muted-foreground">
              The Free plan is intentionally generous — every day, anyone can
              read Scripture, discover words, reflect and pray without paying a
              cent. That is a promise we take seriously.
            </p>
            <p className="text-[16px] leading-relaxed text-muted-foreground">
              Premium supports the small team building this platform and
              unlocks deeper experiences: unlimited collections, personalization,
              and shared journeys with the people you love. Your subscription
              is what allows the Free plan to stay free.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { t: "Sustainable", d: "A calm business model, not attention-driven." },
              { t: "Family-first", d: "Journey Together — designed for the people you love." },
              { t: "Always private", d: "No ads, no selling data. Ever." },
            ].map((x) => (
              <div
                key={x.t}
                className="rounded-2xl border border-border/60 bg-card p-6"
              >
                <p className="font-serif text-lg">{x.t}</p>
                <p className="mt-2 text-[14px] text-muted-foreground">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Together marketing */}
      <section className="border-t border-border/60 bg-[color:var(--surface-2)]">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-6 md:py-32">
          <div className="grid gap-14 md:grid-cols-[1fr_1.1fr] md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" style={{ color: "var(--brand)" }} />
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: "var(--brand)" }}
                >
                  Journey Together
                </p>
              </div>
              <h2 className="mt-4 font-serif text-3xl leading-tight md:text-[44px]">
                Some seasons ask to be walked with someone.
              </h2>
              <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-muted-foreground">
                Premium members can invite a spouse, a friend, a family member,
                a mentor or a small group to walk through the same journey —
                together, at your own pace.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Invite a spouse",
                  "Invite a friend",
                  "Invite a family member",
                  "Invite a mentor",
                  "Invite a small group",
                  "Complete the same journey together",
                  "Celebrate milestones together",
                  "Encourage one another",
                  "Pray together",
                  "Leave private reflections",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[14px] text-foreground/85">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: "var(--brand)" }}
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="relative rounded-3xl border border-border/60 bg-card p-6 sm:p-8"
              style={{
                boxShadow:
                  "0 40px 100px -60px color-mix(in oklab, var(--ink) 25%, transparent)",
              }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Gratitude That Transforms · Day 3
                </p>
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{
                    background: "color-mix(in oklab, var(--brand) 14%, transparent)",
                    color: "var(--brand)",
                  }}
                >
                  Shared
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {[
                  { n: "Ana (you)", pct: 100, c: "var(--brand)", note: "Completed today's journey" },
                  { n: "Lucas", pct: 100, c: "var(--sage)", note: "Left a reflection" },
                  { n: "Sofia", pct: 60, c: "var(--dusty-blue)", note: "Reading now" },
                  { n: "Miguel", pct: 20, c: "var(--walnut)", note: "Starts later today" },
                ].map((m) => (
                  <div
                    key={m.n}
                    className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 p-4"
                  >
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[13px] font-medium text-white"
                      style={{ background: m.c }}
                    >
                      {m.n[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-[14px]">
                        <span className="truncate">{m.n}</span>
                        <span className="tabular-nums text-muted-foreground">{m.pct}%</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {m.note}
                      </p>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-[color:var(--surface-2)]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${m.pct}%`, background: m.c }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-3xl px-5 py-24 sm:px-6 md:py-28">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--brand)" }}>
              Frequently asked
            </p>
            <h2 className="font-serif text-3xl leading-tight md:text-[44px]">
              Anything you're wondering about.
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`q${i}`} className="border-b border-border/60">
                <AccordionTrigger className="text-left text-[15px] font-medium">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-6 md:py-32">
          <h2 className="font-serif text-3xl leading-tight md:text-5xl">
            Begin your journey today.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
            Spend a few meaningful minutes each day growing in God's Word.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="editorial" className="h-12 px-6 text-[15px] sm:min-w-[180px]">
              <Link to="/signup">Start Free</Link>
            </Button>
            <Button asChild size="lg" variant="editorialOutline" className="h-12 px-6 text-[15px] sm:min-w-[180px]">
              <Link to="/today">View Today's Journey</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function CellMark({ v, highlight }: { v: Cell; highlight?: boolean }) {
  if (v === true) {
    return (
      <Check
        className="h-4.5 w-4.5"
        style={{ color: highlight ? "var(--brand)" : "var(--sage)" }}
        strokeWidth={2.2}
      />
    );
  }
  if (v === "soon") {
    return (
      <span
        className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]"
        style={{
          borderColor: "color-mix(in oklab, var(--dusty-blue) 35%, transparent)",
          color: "var(--dusty-blue)",
          background: "color-mix(in oklab, var(--dusty-blue) 10%, transparent)",
        }}
      >
        Soon
      </span>
    );
  }
  return <Minus className="h-4 w-4 text-muted-foreground/50" />;
}
