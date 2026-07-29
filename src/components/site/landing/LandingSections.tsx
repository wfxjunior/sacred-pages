import { Link } from "@tanstack/react-router";
import { BookOpen, Compass, Heart, Sparkles, Check, Users, Flame, X, ArrowRight } from "lucide-react";
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
    {
      name: t("together.member1"),
      color: "var(--gold)",
      photo:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2.6&w=256&h=256&q=80",
    },
    {
      name: t("together.member2"),
      color: "var(--sage)",
      photo:
        "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=facearea&facepad=2.6&w=256&h=256&q=80",
    },
    {
      name: t("together.member3"),
      color: "var(--dusty-blue)",
      photo:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2.6&w=256&h=256&q=80",
    },
    {
      name: t("together.member4"),
      color: "#B76E79",
      photo:
        "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=facearea&facepad=2.6&w=256&h=256&q=80",
    },
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
                    className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full ring-2 ring-white"
                    style={{
                      background: m.color,
                      boxShadow: `0 0 0 1px color-mix(in oklab, ${m.color} 40%, transparent)`,
                    }}
                  >
                    <img
                      src={m.photo}
                      alt={m.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
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
  const weekMins = week.map((v) => Math.round((v / 100) * 92));
  return (
    <LandingSection
      eyebrow="Progress"
      title={t("progress.title")}
      sub={t("progress.sub")}
    >
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="group rounded-2xl border border-border/60 bg-card p-6 sm:p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--brand)]/40 hover:shadow-[0_18px_60px_-30px_color-mix(in_oklab,var(--brand)_60%,transparent)]">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t("app.week")}
              </p>
              <p className="mt-1 font-serif text-3xl">432 <span className="text-lg text-muted-foreground">min</span></p>
              <p className="mt-1 text-xs text-muted-foreground">Daily minutes in the Word · last 7 days</p>
            </div>
            <div
              className="flex items-center gap-1.5 text-sm font-medium"
              style={{ color: "var(--brand)" }}
            >
              <Flame className="h-4 w-4" /> 12 {t("app.days")}
            </div>
          </div>
          <div className="relative mt-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 flex h-40 flex-col justify-between">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="border-t border-dashed border-border/50" />
              ))}
            </div>
            <div className="relative flex h-40 items-end gap-3">
              {week.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {weekMins[i]}
                  </span>
                  <div className="flex h-full w-full items-end">
                    <div
                      className="w-full rounded-t-md transition-all duration-300 group-hover:brightness-110"
                      style={{
                        height: `${v}%`,
                        background:
                          "linear-gradient(180deg, var(--brand), color-mix(in oklab, var(--brand) 55%, var(--sage)))",
                        boxShadow: "0 8px 20px -12px color-mix(in oklab, var(--brand) 60%, transparent)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-3">
              {days.map((d, i) => (
                <span key={i} className="flex-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--brand)]/40 hover:shadow-[0_18px_60px_-30px_color-mix(in_oklab,var(--brand)_60%,transparent)]"
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
  const photos = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=3&w=256&h=256&q=80",
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=facearea&facepad=3&w=256&h=256&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=3&w=256&h=256&q=80",
  ];
  const items = [1, 2, 3].map((i) => ({
    quote: t(`testimonials.t${i}`),
    name: t(`testimonials.n${i}`),
    role: t(`testimonials.r${i}`),
    photo: photos[i - 1],
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
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand)]/50 hover:shadow-[0_24px_60px_-24px_color-mix(in_oklab,var(--brand)_45%,transparent)]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
              style={{ background: "linear-gradient(90deg, var(--brand), color-mix(in oklab, var(--brand) 40%, transparent))" }}
            />
            <span
              aria-hidden
              className="font-serif text-5xl leading-none transition-colors duration-300"
              style={{ color: "var(--brand)" }}
            >
              “
            </span>
            <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-foreground/90">
              {it.quote}
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
              <img
                src={it.photo}
                alt={it.name}
                loading="lazy"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-border/60 transition-all duration-300 group-hover:ring-[var(--brand)]/60"
              />
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
        "Dark mode",
        "EN · PT · ES languages",
        "Save favorites",
        "Journey together (view only)",
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
        "Milestones & streak insights",
        "Journey together (invite up to 5)",
        "Offline reading",
        "Priority support",
      ],
      cta: t("cta.startJourney"),
      featured: true,
    },
  ];
  const compare = [
    { label: "Daily journey", free: true, premium: true },
    { label: "Selected collections", free: true, premium: true },
    { label: "Full journey library", free: false, premium: true },
    { label: "All collections", free: false, premium: true },
    { label: "Personalization", free: "Limited", premium: "Complete" },
    { label: "Progress history", free: "Basic", premium: "Advanced" },
    { label: "Dark mode", free: true, premium: true },
    { label: "Languages (EN · PT · ES)", free: true, premium: true },
    { label: "Save favorites", free: true, premium: true },
    { label: "Exclusive series", free: false, premium: true },
    { label: "Milestones & streak insights", free: false, premium: true },
    { label: "Journey together", free: "View only", premium: "Up to 5 invites" },
    { label: "Offline reading", free: false, premium: true },
    { label: "Family journeys", free: false, premium: "Coming soon" },
    { label: "Priority support", free: false, premium: true },
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

      {/* Comparison table */}
      <div className="mx-auto mt-16 max-w-4xl">
        <div className="mb-6 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Compare plans
          </p>
          <h3 className="mt-2 font-serif text-2xl sm:text-3xl">
            Every feature, side by side
          </h3>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          <div className="grid grid-cols-[1.4fr_1fr_1fr] items-center gap-4 border-b border-border/60 bg-[color-mix(in_oklab,var(--brand)_5%,transparent)] px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-8">
            <span>Feature</span>
            <span className="text-center">Free</span>
            <span className="text-center" style={{ color: "var(--brand)" }}>
              Premium
            </span>
          </div>
          <ul className="divide-y divide-border/60">
            {compare.map((row) => (
              <li
                key={row.label}
                className="grid grid-cols-[1.4fr_1fr_1fr] items-center gap-4 px-5 py-3.5 text-sm transition-colors hover:bg-[color-mix(in_oklab,var(--brand)_4%,transparent)] sm:px-8"
              >
                <span className="font-medium text-foreground/90">{row.label}</span>
                <span className="flex justify-center text-center text-muted-foreground">
                  {row.free === true ? (
                    <Check className="h-4 w-4" style={{ color: "var(--brand)" }} strokeWidth={2.5} />
                  ) : row.free === false ? (
                    <X className="h-4 w-4 text-muted-foreground/40" strokeWidth={2} />
                  ) : (
                    <span className="text-xs">{row.free}</span>
                  )}
                </span>
                <span className="flex justify-center text-center">
                  {row.premium === true ? (
                    <Check className="h-4 w-4" style={{ color: "var(--brand)" }} strokeWidth={2.5} />
                  ) : row.premium === false ? (
                    <X className="h-4 w-4 text-muted-foreground/40" strokeWidth={2} />
                  ) : (
                    <span className="text-xs font-medium" style={{ color: "var(--brand)" }}>
                      {row.premium}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA below comparison */}
        <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-[color-mix(in_oklab,var(--brand)_6%,transparent)] px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-serif text-xl sm:text-2xl">
              Ready to begin your journey?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start free today. Upgrade to Premium anytime — cancel whenever you like.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="group rounded-full px-7 shadow-[0_18px_40px_-18px_rgba(37,99,235,0.6)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-16px_rgba(37,99,235,0.8)]"
          >
            <Link to="/signup">
              {t("cta.startJourney")}
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
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
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#2E5C9E]/35 blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#C89F4F]/30 blur-[80px]" />
          <div className="absolute right-1/3 top-1/2 h-56 w-56 rounded-full bg-[#7A4A5E]/25 blur-[80px]" />
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