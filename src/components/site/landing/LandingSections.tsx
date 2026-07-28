import { Link } from "@tanstack/react-router";
import { BookOpen, Compass, Heart, Sparkles, Check, Users, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n";

/* ---------- Section shell ---------- */

export function LandingSection({
  id,
  eyebrow,
  title,
  sub,
  children,
  className = "",
  tone = "default",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  sub?: string;
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "surface";
}) {
  return (
    <section
      id={id}
      className={`${tone === "surface" ? "bg-[color:var(--surface-2)]" : ""} ${className}`}
    >
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-28">
        {(eyebrow || title || sub) && (
          <div className="mx-auto mb-14 max-w-2xl text-center">
            {eyebrow && (
              <p
                className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: "var(--brand)" }}
              >
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="font-serif text-3xl leading-[1.1] tracking-tight text-foreground md:text-[44px]">
                {title}
              </h2>
            )}
            {sub && (
              <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                {sub}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

/* ---------- Product Overview ---------- */

export function ProductOverview() {
  const { t } = useI18n();
  const items = [
    { icon: BookOpen, k: "f1" },
    { icon: Compass, k: "f2" },
    { icon: Heart, k: "f3" },
    { icon: Sparkles, k: "f4" },
  ];
  return (
    <LandingSection
      id="features"
      eyebrow={t("overview.eyebrow")}
      title={t("overview.title")}
      sub={t("overview.sub")}
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, k }) => (
          <div
            key={k}
            className="group rounded-2xl border border-border/60 bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-30px_rgba(43,43,43,0.25)]"
          >
            <div
              className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                background: "color-mix(in oklab, var(--brand) 12%, transparent)",
                color: "var(--brand)",
              }}
            >
              <Icon className="h-5 w-5" strokeWidth={1.6} />
            </div>
            <h3 className="font-serif text-lg leading-snug">{t(`overview.${k}.t`)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t(`overview.${k}.d`)}
            </p>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}

/* ---------- How it works ---------- */

export function HowItWorks() {
  const { t } = useI18n();
  const steps = [
    { n: "01", k: "read" },
    { n: "02", k: "discover" },
    { n: "03", k: "reflect" },
  ];
  return (
    <LandingSection tone="surface" title={t("how.title")}>
      <div className="relative grid gap-12 md:grid-cols-3">
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-8 hidden h-px md:block"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in oklab, var(--brand) 30%, transparent), transparent)",
          }}
        />
        {steps.map((s) => (
          <div key={s.k} className="relative text-center md:text-left">
            <div
              className="mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border md:mx-0"
              style={{
                borderColor: "color-mix(in oklab, var(--brand) 40%, transparent)",
                background: "var(--background)",
                color: "var(--brand)",
                fontFamily: "var(--font-serif)",
                fontSize: 14,
              }}
            >
              {s.n}
            </div>
            <h3 className="font-serif text-2xl">{t(`how.${s.k}`)}</h3>
            <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-muted-foreground md:mx-0">
              {t(`how.${s.k}Desc`)}
            </p>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}

/* ---------- Personalization ---------- */

export function Personalization() {
  const { t } = useI18n();
  const controls = [
    { label: t("settings.color"), value: "Gold" },
    { label: t("settings.difficulty"), value: t("diff.balanced") },
    { label: t("settings.fontSize"), value: t("settings.medium") },
    { label: t("settings.theme"), value: t("settings.light") },
    { label: t("settings.language"), value: "English" },
  ];
  const swatches = ["var(--gold)", "var(--sage)", "var(--dusty-blue)", "#B76E79", "#7E5BEF"];
  return (
    <LandingSection>
      <div className="grid items-center gap-14 md:grid-cols-2">
        <div>
          <p
            className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--brand)" }}
          >
            {t("personalize.eyebrow")}
          </p>
          <h2 className="font-serif text-3xl leading-tight md:text-[40px]">
            {t("personalize.title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("personalize.sub")}
          </p>
          <div className="mt-8 flex items-center gap-3">
            {swatches.map((c) => (
              <span
                key={c}
                className="h-7 w-7 rounded-full border border-border/60"
                style={{ background: c }}
                aria-hidden
              />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-[0_30px_80px_-50px_rgba(43,43,43,0.35)]">
          <div className="rounded-xl bg-[color:var(--surface-2)] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t("settings.title")}
            </p>
            <div className="mt-4 divide-y divide-border/60">
              {controls.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center justify-between py-3.5"
                >
                  <span className="text-sm">{c.label}</span>
                  <span
                    className="rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium"
                    style={{ color: "var(--walnut)" }}
                  >
                    {c.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LandingSection>
  );
}

/* ---------- Journey Together preview ---------- */

export function JourneyTogether() {
  const { t } = useI18n();
  const members = [
    { name: t("together.member1"), color: "var(--gold)" },
    { name: t("together.member2"), color: "var(--sage)" },
    { name: t("together.member3"), color: "var(--dusty-blue)" },
    { name: t("together.member4"), color: "#B76E79" },
  ];
  return (
    <LandingSection tone="surface">
      <div className="grid items-center gap-14 md:grid-cols-[1fr_1.05fr]">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{
                borderColor: "color-mix(in oklab, var(--gold) 45%, transparent)",
                color: "var(--gold)",
                background: "color-mix(in oklab, var(--gold) 10%, transparent)",
              }}
            >
              {t("together.badge")}
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t("together.eyebrow")}
            </p>
          </div>
          <h2 className="mt-4 font-serif text-3xl leading-tight md:text-[40px]">
            {t("together.title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("together.sub")}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[0_30px_80px_-50px_rgba(43,43,43,0.35)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                {t("together.thisWeek")}
              </span>
            </div>
            <div
              className="flex items-center gap-1.5 text-sm font-medium"
              style={{ color: "var(--brand)" }}
            >
              <Flame className="h-4 w-4" />
              12 · {t("together.sharedStreak")}
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {members.map((m, i) => {
              const pct = [92, 78, 64, 45][i];
              return (
                <div key={m.name} className="flex items-center gap-3">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[13px] font-medium text-white"
                    style={{ background: m.color }}
                  >
                    {m.name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{m.name}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {pct}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[color:var(--surface-2)]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: m.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </LandingSection>
  );
}

/* ---------- Progress ---------- */

export function ProgressShowcase() {
  const { t } = useI18n();
  const stats = [
    { label: t("app.streak"), value: "12", suffix: t("app.days") },
    { label: "Journeys", value: "38" },
    { label: "Passages", value: "142" },
    { label: "Collections", value: "3" },
  ];
  const week = [40, 65, 30, 80, 55, 92, 70];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <LandingSection
      eyebrow="Progress"
      title={t("progress.title")}
      sub={t("progress.sub")}
    >
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("app.week")}
              </p>
              <p className="mt-1 font-serif text-3xl">432 min</p>
            </div>
            <div
              className="flex items-center gap-1.5 text-sm font-medium"
              style={{ color: "var(--brand)" }}
            >
              <Flame className="h-4 w-4" /> 12 {t("app.days")}
            </div>
          </div>
          <div className="mt-8 flex h-40 items-end gap-3">
            {week.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-full w-full items-end">
                  <div
                    className="w-full rounded-t-md"
                    style={{
                      height: `${v}%`,
                      background:
                        "linear-gradient(180deg, var(--brand), color-mix(in oklab, var(--brand) 55%, var(--sage)))",
                    }}
                  />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {days[i]}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border/60 bg-card p-6"
            >
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-3 font-serif text-4xl leading-none">
                {s.value}
                {s.suffix && (
                  <span className="ml-1 text-sm text-muted-foreground">
                    {s.suffix}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </LandingSection>
  );
}

/* ---------- Testimonials ---------- */

export function Testimonials() {
  const { t } = useI18n();
  const items = [1, 2, 3].map((i) => ({
    quote: t(`testimonials.t${i}`),
    name: t(`testimonials.n${i}`),
    role: t(`testimonials.r${i}`),
  }));
  return (
    <LandingSection
      tone="surface"
      eyebrow={t("testimonials.eyebrow")}
      title={t("testimonials.title")}
    >
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((it) => (
          <figure
            key={it.name}
            className="flex flex-col rounded-2xl border border-border/60 bg-card p-7"
          >
            <span
              aria-hidden
              className="font-serif text-5xl leading-none"
              style={{ color: "var(--brand)" }}
            >
              “
            </span>
            <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-foreground/90">
              {it.quote}
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
              <span
                className="grid h-9 w-9 place-items-center rounded-full font-serif text-sm text-white"
                style={{ background: "var(--gold)" }}
              >
                {it.name[0]}
              </span>
              <div>
                <p className="text-sm font-medium">{it.name}</p>
                <p className="text-xs text-muted-foreground">{it.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </LandingSection>
  );
}

/* ---------- Pricing preview ---------- */

export function PricingPreview() {
  const { t } = useI18n();
  const plans = [
    {
      name: t("pricing.free"),
      price: t("pricing.freePrice"),
      features: [
        "Daily journey",
        "Selected collections",
        "Basic progress",
        "Limited personalization",
      ],
      cta: t("cta.startFree"),
      featured: false,
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
        "Family journeys (soon)",
      ],
      cta: t("cta.startJourney"),
      featured: true,
    },
  ];
  return (
    <LandingSection id="pricing" title={t("pricing.title")}>
      <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative flex flex-col rounded-2xl border p-8 ${
              p.featured
                ? "border-transparent bg-card shadow-[0_40px_100px_-50px_rgba(37,99,235,0.35)]"
                : "border-border/60 bg-card"
            }`}
            style={
              p.featured
                ? {
                    boxShadow:
                      "0 0 0 1px color-mix(in oklab, var(--brand) 45%, transparent), 0 40px 100px -60px rgba(37,99,235,0.35)",
                  }
                : undefined
            }
          >
            {p.featured && (
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white"
                style={{ background: "var(--gold)" }}
              >
                Recommended
              </span>
            )}
            <p className="font-serif text-2xl">{p.name}</p>
            <p className="mt-3 font-serif text-5xl leading-none">
              {p.price}
              <span className="ml-1 text-sm text-muted-foreground">
                {t("pricing.month")}
              </span>
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: "var(--brand)" }}
                    strokeWidth={2}
                  />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="mt-8 rounded-full"
              variant={p.featured ? "default" : "outline"}
            >
              <Link to="/signup">{p.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}

/* ---------- FAQ ---------- */

export function FAQ() {
  const { t } = useI18n();
  const items = [1, 2, 3, 4, 5, 6];
  return (
    <LandingSection
      id="faq"
      tone="surface"
      eyebrow={t("faq.eyebrow")}
      title={t("faq.title")}
    >
      <div className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {items.map((i) => (
            <AccordionItem
              key={i}
              value={`q${i}`}
              className="border-b border-border/60"
            >
              <AccordionTrigger className="text-left text-[15px] font-medium">
                {t(`faq.q${i}`)}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground">
                {t(`faq.a${i}`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </LandingSection>
  );
}

/* ---------- Final CTA ---------- */

export function FinalCTA() {
  const { t } = useI18n();
  return (
    <section className="px-5 pb-24 pt-8 sm:px-6 md:pb-32">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-[#2D2926] p-12 text-center text-white md:rounded-[4rem] md:p-24">
        {/* Colored aurora accents inside dark card */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-purple-500/20 blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-orange-400/20 blur-[80px]" />
          <div className="absolute right-1/3 top-1/2 h-56 w-56 rounded-full bg-teal-400/10 blur-[80px]" />
        </div>
        <div className="relative z-10">
          <h2 className="font-serif text-3xl leading-tight md:text-5xl">
            {t("final.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/60 md:text-lg">
            {t("final.sub")}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-[#FCFBF8] px-8 text-[#2D2926] hover:bg-white"
            >
              <Link to="/signup">{t("cta.startFree")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="rounded-full px-6 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Link to="/today">{t("cta.exploreToday")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}