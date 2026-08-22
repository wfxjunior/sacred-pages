import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { BookOpen, Lock, ShieldCheck, Languages } from "lucide-react";

/**
 * Two conversion blocks the US/LatAm market expects and the page was missing:
 * a low-commitment first step (7-day plan) and an explicit trust strip
 * (tradition-neutral, private, cancel anytime, known translations).
 *
 * Both stay inside the existing editorial palette — ivory paper, ink text,
 * gold hairlines — so nothing new is introduced visually.
 */

export function StartPlanBand() {
  const { t } = useI18n();
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-4 sm:px-8 md:px-10 lg:px-12">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-[color:color-mix(in_oklab,var(--parchment)_55%,var(--card))] px-6 py-10 text-center sm:px-10 md:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in oklab, var(--gold) 60%, transparent), transparent)",
          }}
        />
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.24em]"
          style={{ color: "var(--walnut)" }}
        >
          {t("start7.eyebrow")}
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl font-serif text-3xl leading-tight md:text-4xl">
          {t("start7.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          {t("start7.sub")}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Button
            asChild
            size="lg"
            variant="editorial"
            className="h-13 w-full justify-center px-9 py-4 text-[15px] sm:w-auto sm:min-w-[240px]"
          >
            <Link to="/today">{t("start7.cta")}</Link>
          </Button>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--walnut)" }}
          >
            {t("start7.note")}
          </p>
        </div>
      </div>
    </section>
  );
}

const TRUST = [
  { icon: BookOpen, title: "trust.traditions", sub: "trust.traditions.sub" },
  { icon: Lock, title: "trust.private", sub: "trust.private.sub" },
  { icon: ShieldCheck, title: "trust.cancel", sub: "trust.cancel.sub" },
  { icon: Languages, title: "trust.translations", sub: "trust.translations.sub" },
] as const;

export function TrustStrip() {
  const { t } = useI18n();
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 md:px-10 md:py-20 lg:px-12">
      <h2 className="mb-10 text-center font-serif text-2xl leading-tight md:text-3xl">
        {t("trust.title")}
      </h2>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST.map(({ icon: Icon, title, sub }) => (
          <li
            key={title}
            className="rounded-xl border border-border bg-card p-6 text-left"
          >
            <span
              className="mb-4 grid h-10 w-10 place-items-center rounded-full"
              style={{ background: "color-mix(in oklab, var(--gold) 14%, transparent)" }}
            >
              <Icon className="h-5 w-5" strokeWidth={1.6} style={{ color: "var(--gold)" }} aria-hidden />
            </span>
            <p className="font-serif text-lg leading-snug">{t(title)}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(sub)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
