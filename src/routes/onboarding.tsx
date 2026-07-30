// TODO: Persist onboarding preferences to backend when auth is added.
// Frontend-only 8-step calm onboarding.

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LumenaLogo } from "@/components/site/LumenaLogo";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { ThemeSelector } from "@/components/site/ThemeSelector";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome — Jornadas da Palavra" },
      { name: "description", content: "A calm 2-minute setup for your Scripture journey." },
      { property: "og:title", content: "Welcome — Jornadas da Palavra" },
      { property: "og:description", content: "A calm 2-minute setup." },
    ],
  }),
  component: OnboardingPage,
});

type Prefs = {
  name: string;
  language: "en" | "pt" | "es";
  themes: string[];
  duration: "5" | "10" | "20";
  difficulty: "easy" | "medium" | "hard";
  accent: string;
  visual: "ivory" | "ink" | "system";
};

const STEPS = 8;

function OnboardingPage() {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [p, setP] = useState<Prefs>({
    name: "",
    language: "en",
    themes: ["Peace"],
    duration: "10",
    difficulty: "medium",
    accent: "#B88A3B",
    visual: "ivory",
  });
  const nav = useNavigate();
  const progress = ((step + 1) / STEPS) * 100;

  return (
    <div className="min-h-screen bg-[color:var(--surface-1)]">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center">
          <LumenaLogo size="sm" />
        </Link>
        <Link to="/my-journey" className="text-[12px] text-muted-foreground hover:text-foreground">{t("onb.skip")}</Link>
      </header>
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-3xl flex-col items-center px-6 pb-16 pt-4">
        <div className="w-full">
          <div className="mb-8 flex items-center gap-3">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-[color:var(--surface-2)]">
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "var(--gold)" }} />
            </div>
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              {step + 1} / {STEPS}
            </span>
          </div>
          <div className="rounded-3xl border border-border/60 bg-card p-8 md:p-12">
            <StepView step={step} p={p} set={setP} />
          </div>
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-full"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> {t("onb.back")}
            </Button>
            {step < STEPS - 1 ? (
              <Button onClick={() => setStep((s) => Math.min(STEPS - 1, s + 1))} className="rounded-full px-5">
                {t("onb.continue")} <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => nav({ to: "/my-journey" })} className="rounded-full px-5">
                {t("onb.begin")} <Check className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepView({ step, p, set }: { step: number; p: Prefs; set: (p: Prefs) => void }) {
  const { t } = useI18n();
  const preview = useMemo(() => ({
    duration: p.duration + " min",
    accent: p.accent,
  }), [p]);

  switch (step) {
    case 0:
      return (
        <Frame eyebrow={t("onb.step.welcome.eyebrow")} title={t("onb.step.welcome.title")} subtitle={t("onb.step.welcome.sub")}>
          <div className="mt-8 grid gap-3">
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground">{t("onb.step.welcome.nameLabel")}</label>
            <Input value={p.name} onChange={(e) => set({ ...p, name: e.target.value })} placeholder={t("onb.step.welcome.namePh")} />
          </div>
        </Frame>
      );
    case 1:
      return (
        <Frame eyebrow={t("onb.step.language.eyebrow")} title={t("onb.step.language.title")} subtitle={t("onb.step.language.sub")}>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { k: "en", label: "English" },
              { k: "pt", label: "Português" },
              { k: "es", label: "Español" },
            ].map((l) => (
              <Choice key={l.k} active={p.language === l.k} onClick={() => set({ ...p, language: l.k as Prefs["language"] })}>
                {l.label}
              </Choice>
            ))}
          </div>
        </Frame>
      );
    case 2:
      return (
        <Frame eyebrow={t("onb.step.themes.eyebrow")} title={t("onb.step.themes.title")} subtitle={t("onb.step.themes.sub")}>
          <div className="mt-8 flex flex-wrap gap-2">
            {[
              ["Peace","onb.theme.peace"],
              ["Gratitude","onb.theme.gratitude"],
              ["Wisdom","onb.theme.wisdom"],
              ["Grief","onb.theme.grief"],
              ["Hope","onb.theme.hope"],
              ["Family","onb.theme.family"],
              ["Purpose","onb.theme.purpose"],
              ["Rest","onb.theme.rest"],
              ["Prayer","onb.theme.prayer"],
              ["Courage","onb.theme.courage"],
            ].map(([key, tkey]) => {
              const on = p.themes.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => set({ ...p, themes: on ? p.themes.filter((x) => x !== key) : [...p.themes, key] })}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    on ? "border-primary bg-primary/10 text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(tkey)}
                </button>
              );
            })}
          </div>
        </Frame>
      );
    case 3:
      return (
        <Frame eyebrow={t("onb.step.rhythm.eyebrow")} title={t("onb.step.rhythm.title")} subtitle={t("onb.step.rhythm.sub")}>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { k: "5", label: t("onb.rhythm.5"), hint: t("onb.rhythm.5.hint") },
              { k: "10", label: t("onb.rhythm.10"), hint: t("onb.rhythm.10.hint") },
              { k: "20", label: t("onb.rhythm.20"), hint: t("onb.rhythm.20.hint") },
            ].map((o) => (
              <Choice key={o.k} active={p.duration === o.k} onClick={() => set({ ...p, duration: o.k as Prefs["duration"] })}>
                <span className="block font-medium">{o.label}</span>
                <span className="mt-1 block text-[11px] text-muted-foreground">{o.hint}</span>
              </Choice>
            ))}
          </div>
        </Frame>
      );
    case 4:
      return (
        <Frame eyebrow={t("onb.step.depth.eyebrow")} title={t("onb.step.depth.title")} subtitle={t("onb.step.depth.sub")}>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { k: "easy", label: t("onb.depth.easy"), hint: t("onb.depth.easy.hint") },
              { k: "medium", label: t("onb.depth.medium"), hint: t("onb.depth.medium.hint") },
              { k: "hard", label: t("onb.depth.hard"), hint: t("onb.depth.hard.hint") },
            ].map((o) => (
              <Choice key={o.k} active={p.difficulty === o.k} onClick={() => set({ ...p, difficulty: o.k as Prefs["difficulty"] })}>
                <span className="block font-medium">{o.label}</span>
                <span className="mt-1 block text-[11px] text-muted-foreground">{o.hint}</span>
              </Choice>
            ))}
          </div>
        </Frame>
      );
    case 5: {
      const swatches = ["#B88A3B", "#78866B", "#5E7FA3", "#6E5847", "#B76E79"];
      return (
        <Frame eyebrow={t("onb.step.accent.eyebrow")} title={t("onb.step.accent.title")} subtitle={t("onb.step.accent.sub")}>
          <div className="mt-8 flex flex-wrap gap-3">
            {swatches.map((s) => {
              const on = p.accent === s;
              return (
                <button
                  key={s}
                  onClick={() => set({ ...p, accent: s })}
                  className={`grid h-12 w-12 place-items-center rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    on ? "border-foreground" : "border-transparent hover:border-border"
                  }`}
                  style={{ background: s }}
                  aria-label={t("onb.step.accent.aria").replace("{color}", s)}
                >
                  {on && <Check className="h-4 w-4 text-white" />}
                </button>
              );
            })}
          </div>
        </Frame>
      );
    }
    case 6:
      return (
        <Frame eyebrow={t("onb.step.appearance.eyebrow")} title={t("onb.step.appearance.title")} subtitle={t("onb.step.appearance.sub")}>
          <div className="mt-8">
            <ThemeSelector />
            <p className="mt-4 text-[12px] text-muted-foreground">{t("onb.step.appearance.note")}</p>
          </div>
        </Frame>
      );
    case 7:
      return (
        <Frame eyebrow={t("onb.step.ready.eyebrow")} title={t("onb.step.ready.title").replace("{name}", p.name ? `, ${p.name}` : "")} subtitle={t("onb.step.ready.sub")}>
          <div className="mt-8 rounded-2xl border border-border/60 bg-[color:var(--surface-1)] p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--walnut)" }}>{t("onb.preview.today")}</p>
            <p className="mt-1 font-serif text-2xl">{t("today.name")}</p>
            <p className="text-[13px] text-muted-foreground">{t("today.reference")} · {t("onb.preview.about")} {preview.duration}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {p.themes.slice(0, 4).map((th) => (
                <span key={th} className="rounded-full border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground">{t(`onb.theme.${th.toLowerCase()}`)}</span>
              ))}
            </div>
            <div className="mt-5 h-1 overflow-hidden rounded-full bg-[color:var(--surface-2)]">
              <div className="h-full rounded-full" style={{ width: "12%", background: preview.accent }} />
            </div>
          </div>
        </Frame>
      );
    default:
      return null;
  }
}

function Frame({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--walnut)" }}>{eyebrow}</p>
      <h2 className="mt-2 font-serif text-3xl leading-tight md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-2 max-w-xl text-[14px] text-muted-foreground">{subtitle}</p>}
      {children}
    </div>
  );
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        active ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"
      }`}
    >
      {children}
    </button>
  );
}