// TODO: Persist onboarding preferences to backend when auth is added.
// Frontend-only 8-step calm onboarding.

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandMark } from "@/components/site/BrandMark";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { ThemeSelector } from "@/components/site/ThemeSelector";

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
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark />
          <span className="font-serif text-[13px] font-semibold uppercase tracking-[0.15em]">Jornadas da Palavra</span>
        </Link>
        <Link to="/my-journey" className="text-[12px] text-muted-foreground hover:text-foreground">Skip for now</Link>
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
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            {step < STEPS - 1 ? (
              <Button onClick={() => setStep((s) => Math.min(STEPS - 1, s + 1))} className="rounded-full px-5">
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => nav({ to: "/my-journey" })} className="rounded-full px-5">
                Begin my journey <Check className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepView({ step, p, set }: { step: number; p: Prefs; set: (p: Prefs) => void }) {
  const preview = useMemo(() => ({
    duration: p.duration + " min",
    accent: p.accent,
  }), [p]);

  switch (step) {
    case 0:
      return (
        <Frame eyebrow="Welcome" title="A quieter way to walk with Scripture" subtitle="Two minutes to set the tone — you can change anything later.">
          <div className="mt-8 grid gap-3">
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Your name</label>
            <Input value={p.name} onChange={(e) => set({ ...p, name: e.target.value })} placeholder="How should we greet you?" />
          </div>
        </Frame>
      );
    case 1:
      return (
        <Frame eyebrow="Language" title="In which language do you read best?" subtitle="You can switch anytime.">
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
        <Frame eyebrow="Themes" title="What are you drawn to?" subtitle="Pick a few — we'll shape your journeys around them.">
          <div className="mt-8 flex flex-wrap gap-2">
            {["Peace","Gratitude","Wisdom","Grief","Hope","Family","Purpose","Rest","Prayer","Courage"].map((t) => {
              const on = p.themes.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => set({ ...p, themes: on ? p.themes.filter((x) => x !== t) : [...p.themes, t] })}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    on ? "border-primary bg-primary/10 text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </Frame>
      );
    case 3:
      return (
        <Frame eyebrow="Rhythm" title="How much time each day?" subtitle="Small and consistent works best.">
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { k: "5", label: "5 minutes", hint: "A quiet start" },
              { k: "10", label: "10 minutes", hint: "Most people" },
              { k: "20", label: "20 minutes", hint: "Deeper study" },
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
        <Frame eyebrow="Depth" title="Puzzle difficulty" subtitle="Word search sets the tempo. You can raise it as you go.">
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { k: "easy", label: "Easy", hint: "Gentle pace" },
              { k: "medium", label: "Medium", hint: "Balanced" },
              { k: "hard", label: "Hard", hint: "For focus" },
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
        <Frame eyebrow="Accent" title="Choose your color" subtitle="Used sparingly across your journey — no rainbows.">
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
                  aria-label={`Accent ${s}`}
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
        <Frame eyebrow="Appearance" title="Light or dark?" subtitle="System matches your device automatically.">
          <div className="mt-8">
            <ThemeSelector />
            <p className="mt-4 text-[12px] text-muted-foreground">We use warm ivory during the day and deep ink at night — never pure black.</p>
          </div>
        </Frame>
      );
    case 7:
      return (
        <Frame eyebrow="Ready" title={`Your first journey is set${p.name ? `, ${p.name}` : ""}.`} subtitle="Here's what your Today screen will feel like.">
          <div className="mt-8 rounded-2xl border border-border/60 bg-[color:var(--surface-1)] p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--walnut)" }}>Today</p>
            <p className="mt-1 font-serif text-2xl">Gratitude That Transforms</p>
            <p className="text-[13px] text-muted-foreground">Philippians 4:6–7 · about {preview.duration}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {p.themes.slice(0, 4).map((t) => (
                <span key={t} className="rounded-full border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground">{t}</span>
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