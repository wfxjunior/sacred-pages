import * as React from "react";
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
    { label: t("settings.color"), value: t("personalize.value.gold") },
    { label: t("settings.difficulty"), value: t("diff.balanced") },
    { label: t("settings.fontSize"), value: t("settings.medium") },
    { label: t("settings.theme"), value: t("settings.light") },
    { label: t("settings.language"), value: t("personalize.value.english") },
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
  const baseMembers = [
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
  const initialPct = [92, 78, 64, 45];
  const [entries, setEntries] = React.useState(() =>
    baseMembers.map((m, i) => ({ ...m, pct: initialPct[i], bump: 0 })),
  );
  const [streak, setStreak] = React.useState(12);
  const prevRankRef = React.useRef<Record<string, number>>({});

  React.useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setInterval(() => {
      setEntries((prev) => {
        // Pick 1–2 random members to gain progress
        const gainers = new Set<number>();
        const count = Math.random() > 0.55 ? 2 : 1;
        while (gainers.size < count) {
          gainers.add(Math.floor(Math.random() * prev.length));
        }
        return prev.map((m, i) => {
          if (!gainers.has(i)) return { ...m, bump: 0 };
          const delta = Math.round(2 + Math.random() * 6);
          let next = m.pct + delta;
          if (next > 99) next = Math.max(40, 55 + Math.round(Math.random() * 10));
          return { ...m, pct: next, bump: delta };
        });
      });
      if (Math.random() > 0.7) setStreak((s) => s + 1);
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  // Sorted ranking (desc by pct)
  const ranked = [...entries]
    .map((m, idx) => ({ ...m, idx }))
    .sort((a, b) => b.pct - a.pct);
  const rankByName: Record<string, number> = {};
  ranked.forEach((m, r) => (rankByName[m.name] = r));
  const movement: Record<string, "up" | "down" | "same"> = {};
  entries.forEach((m) => {
    const prev = prevRankRef.current[m.name];
    const now = rankByName[m.name];
    movement[m.name] =
      prev === undefined || prev === now ? "same" : prev > now ? "up" : "down";
  });
  React.useEffect(() => {
    prevRankRef.current = { ...rankByName };
  });
  const ROW = 56;
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
              <span className="tabular-nums">{streak}</span> ·{" "}
              {t("together.sharedStreak")}
            </div>
          </div>
          <div
            className="relative mt-6"
            style={{ height: entries.length * ROW }}
            aria-live="polite"
          >
            {entries.map((m) => {
              const rank = rankByName[m.name];
              const move = movement[m.name];
              return (
                <div
                  key={m.name}
                  className="absolute inset-x-0 flex items-center gap-3"
                  style={{
                    top: rank * ROW,
                    transition:
                      "top 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  <span
                    className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full ring-2 ring-white"
                    style={{
                      background: m.color,
                      boxShadow:
                        move === "up"
                          ? `0 0 0 2px color-mix(in oklab, ${m.color} 65%, transparent), 0 8px 22px -8px color-mix(in oklab, ${m.color} 60%, transparent)`
                          : `0 0 0 1px color-mix(in oklab, ${m.color} 40%, transparent)`,
                      transition: "box-shadow 700ms ease",
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
                      <span className="flex min-w-0 items-center gap-2 truncate">
                        <span className="truncate">{m.name}</span>
                        {move === "up" && (
                          <span
                            key={`up-${m.pct}`}
                            className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                            style={{
                              color: "var(--sage)",
                              background:
                                "color-mix(in oklab, var(--sage) 14%, transparent)",
                              animation: "fade-in 500ms ease-out",
                            }}
                          >
                            ▲
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-1.5 tabular-nums text-muted-foreground">
                        {m.bump > 0 && (
                          <span
                            key={`bump-${m.name}-${m.pct}`}
                            className="text-[10px] font-semibold"
                            style={{
                              color: m.color,
                              animation:
                                "fade-in 400ms ease-out, fade-out 900ms ease-in 900ms forwards",
                            }}
                          >
                            +{m.bump}
                          </span>
                        )}
                        <span>{m.pct}%</span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[color:var(--surface-2)]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${m.pct}%`,
                          background: m.color,
                          transition:
                            "width 900ms cubic-bezier(0.22, 1, 0.36, 1)",
                        }}
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
    { label: t("stats.journeys"), value: "38" },
    { label: t("stats.passages"), value: "142" },
    { label: t("stats.collections"), value: "3" },
  ];
  const week = [40, 65, 30, 80, 55, 92, 70];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const weekMins = week.map((v) => Math.round((v / 100) * 92));
  return (
    <LandingSection
      eyebrow={t("landing.progressEyebrow")}
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
              <p className="mt-1 font-serif text-3xl">432 <span className="text-lg text-muted-foreground">{t("chart.minutesUnit")}</span></p>
              <p className="mt-1 text-xs text-muted-foreground">{t("chart.dailyMinutes")}</p>
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
        t("pricing.free.f1"),
        t("pricing.free.f2"),
        t("pricing.free.f3"),
        t("pricing.free.f4"),
        t("pricing.free.f5"),
        t("pricing.free.f6"),
        t("pricing.free.f7"),
        t("pricing.free.f8"),
      ],
      cta: t("cta.startFree"),
      featured: false,
    },
    {
      name: t("pricing.premium"),
      price: t("pricing.premiumPrice"),
      features: [
        t("pricing.premium.f1"),
        t("pricing.premium.f2"),
        t("pricing.premium.f3"),
        t("pricing.premium.f4"),
        t("pricing.premium.f5"),
        t("pricing.premium.f6"),
        t("pricing.premium.f7"),
        t("pricing.premium.f8"),
        t("pricing.premium.f9"),
        t("pricing.premium.f10"),
      ],
      cta: t("cta.startJourney"),
      featured: true,
    },
  ];
  const compare: { label: string; free: boolean | string; premium: boolean | string }[] = [
    { label: t("compare.row.dailyJourney"), free: true, premium: true },
    { label: t("compare.row.selectedCollections"), free: true, premium: true },
    { label: t("compare.row.fullLibrary"), free: false, premium: true },
    { label: t("compare.row.allCollections"), free: false, premium: true },
    { label: t("compare.row.personalization"), free: t("compare.val.limited"), premium: t("compare.val.complete") },
    { label: t("compare.row.progressHistory"), free: t("compare.val.basic"), premium: t("compare.val.advanced") },
    { label: t("compare.row.darkMode"), free: true, premium: true },
    { label: t("compare.row.languages"), free: true, premium: true },
    { label: t("compare.row.favorites"), free: true, premium: true },
    { label: t("compare.row.exclusive"), free: false, premium: true },
    { label: t("compare.row.milestones"), free: false, premium: true },
    { label: t("compare.row.together"), free: t("compare.val.viewOnly"), premium: t("compare.val.upTo5") },
    { label: t("compare.row.offline"), free: false, premium: true },
    { label: t("compare.row.family"), free: false, premium: t("compare.val.comingSoon") },
    { label: t("compare.row.support"), free: false, premium: true },
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
                {t("pricing.recommended")}
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
              className="mt-8 h-11 w-full px-6 text-[15px]"
              variant={p.featured ? "editorial" : "editorialOutline"}
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
            {t("pricing.compare.eyebrow")}
          </p>
          <h3 className="mt-2 font-serif text-2xl sm:text-3xl">
            {t("pricing.compare.title")}
          </h3>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          <div className="grid grid-cols-[1.4fr_1fr_1fr] items-center gap-4 border-b border-border/60 bg-[color-mix(in_oklab,var(--brand)_5%,transparent)] px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-8">
            <span>{t("pricing.compare.feature")}</span>
            <span className="text-center">{t("pricing.compare.free")}</span>
            <span className="text-center" style={{ color: "var(--brand)" }}>
              {t("pricing.compare.premium")}
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
              {t("pricing.compare.ctaTitle")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("pricing.compare.ctaSub")}
            </p>
          </div>
          <Button
            asChild
            size="lg"
            variant="editorial"
            className="group h-12 px-7 text-[15px]"
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
  const ref = React.useRef<HTMLElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="px-5 pb-24 pt-8 sm:px-6 md:pb-32">
      <div
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.5rem] p-12 text-center text-[#F5F0E4] md:rounded-[2rem] md:p-24"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, #3B342C 0%, #241F1B 60%, #1A1613 100%)",
          boxShadow:
            "0 40px 100px -40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Linen weave texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 3px), repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0 1px, transparent 1px 3px)",
          }}
        />
        {/* Warm daylight highlight */}
        <div
          aria-hidden
          className="final-glow pointer-events-none absolute -top-24 left-1/2 h-64 w-[70%] -translate-x-1/2 rounded-full bg-[#C89F4F]/[0.12] blur-[80px]"
        />
        {/* Pulsing outer ring */}
        <div
          aria-hidden
          className="final-pulse-ring pointer-events-none absolute inset-0 rounded-[1.5rem] border border-[#C89F4F]/20 md:rounded-[2rem]"
        />
        {/* Soft warm light — two wide gradient washes instead of speckles */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(90% 55% at 20% 105%, rgba(200,159,79,0.16) 0%, transparent 70%), radial-gradient(70% 50% at 85% 90%, rgba(120,134,107,0.14) 0%, transparent 72%)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-1/2"
            style={{
              background:
                "linear-gradient(to top, rgba(200,159,79,0.10), transparent 80%)",
            }}
          />
        </div>
        {/* Sewn stitch border */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)]"
          viewBox="0 0 100 100" preserveAspectRatio="none"
        >
          <rect x="0.3" y="0.3" width="99.4" height="99.4" rx="1.2"
            fill="none" stroke="#C89F4F" strokeOpacity="0.35"
            strokeWidth="0.15" strokeDasharray="0.9 0.9"
            vectorEffect="non-scaling-stroke" />
        </svg>
        <div className={`relative z-10 ${visible ? "final-fade-up" : "opacity-0"}`}>
          <p
            className="mb-4 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#C89F4F]/80"
            style={{ animationDelay: "100ms" }}
          >
            — Fin —
          </p>
          <h2
            className="font-serif text-3xl leading-tight md:text-5xl"
            style={{ animationDelay: "200ms" }}
          >
            {t("final.title")}
          </h2>
          <p
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#F5F0E4]/60 md:text-lg"
            style={{ animationDelay: "300ms" }}
          >
            {t("final.sub")}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="final-shimmer group relative h-12 overflow-hidden rounded-sm border border-[#FCFBF8] bg-[#FCFBF8] px-8 font-serif text-[15px] font-medium tracking-tight text-[#1F1D1B] shadow-[0_10px_28px_-10px_rgba(0,0,0,0.5)] transition-all hover:bg-white hover:shadow-[0_14px_36px_-12px_rgba(0,0,0,0.6)] active:scale-[0.98] sm:min-w-[180px]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #FCFBF8 0%, #FFFFFF 25%, #FCFBF8 50%, #FFFFFF 75%, #FCFBF8 100%)",
              }}
            >
              <Link to="/signup">{t("cta.startFree")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-12 rounded-sm border border-[#F5F0E4]/25 px-6 font-serif text-[15px] font-medium tracking-tight text-[#F5F0E4]/80 transition-all hover:border-[#F5F0E4]/50 hover:bg-white/5 hover:text-white hover:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.3)] active:scale-[0.98] sm:min-w-[180px]"
            >
              <Link to="/today">{t("cta.exploreToday")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}