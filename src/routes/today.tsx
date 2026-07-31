import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { WordSearch } from "@/components/site/WordSearch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTodayContent } from "@/lib/content/today";
import { useI18n } from "@/lib/i18n";
import { CheckCircle2, HelpCircle, X, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/today")({
  head: () => ({
    meta: [
      { title: "Today's Journey — Jornadas da Palavra" },
      { name: "description", content: "A quiet daily journey through Scripture with a devotional, word search, reflection and prayer." },
      { property: "og:title", content: "Today's Journey — Jornadas da Palavra" },
      { property: "og:description", content: "A daily Bible journey with devotional, word search, reflection and prayer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Today,
});

function Today() {
  const TODAY = useTodayContent();
  const { t } = useI18n();
  const [difficulty, setDifficulty] = useState<"gentle" | "balanced" | "challenging" | "expert">("gentle");
  const [complete, setComplete] = useState(false);
  const sizes = { gentle: 10, balanced: 12, challenging: 14, expert: 16 } as const;

  if (complete) return <Completion onReset={() => setComplete(false)} />;

  return (
    <AppShell mainClassName="p-0 md:px-10 md:py-12">
      {/* Desktop layout */}
      <div className="mx-auto hidden max-w-6xl space-y-8 md:block">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>
              {TODAY.reference}
            </p>
            <h1 className="mt-1 font-serif text-3xl md:text-4xl">{TODAY.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("today.duration")} · {t(`diff.${difficulty}`)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <HelpMenu />
            <Button onClick={() => setComplete(true)} variant="outline" size="sm">
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> {t("complete.favorite")}
            </Button>
          </div>
        </div>

        <DifficultyPicker value={difficulty} onChange={setDifficulty} />

        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <WordSearch words={TODAY.words} size={sizes[difficulty]} />
          </div>
          <div className="rounded-xl border border-border bg-card">
            <JourneyTabs />
          </div>
        </div>
      </div>

      {/* Mobile full-bleed layout */}
      <div className="flex h-full flex-col md:hidden">
        <MobileHeader
          difficultyLabel={t(`diff.${difficulty}`)}
          onComplete={() => setComplete(true)}
        />

        <div className="flex-none px-4 py-2">
          <DifficultyPicker value={difficulty} onChange={setDifficulty} compact />
        </div>

        <div className="min-h-0 flex-1 px-3 pb-2">
          <WordSearch words={TODAY.words} size={sizes[difficulty]} fullBleed />
        </div>

        <MobileContentSheet />
      </div>
    </AppShell>
  );
}

function MobileHeader({
  difficultyLabel,
  onComplete,
}: {
  difficultyLabel: string;
  onComplete: () => void;
}) {
  const TODAY = useTodayContent();
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>
          {TODAY.reference}
        </p>
        <h1 className="mt-0.5 truncate font-serif text-lg leading-tight">{TODAY.title}</h1>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {TODAY.words.length} {TODAY.words.length === 1 ? "word" : "words"} · {difficultyLabel}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <HelpMenu />
        <Button onClick={onComplete} variant="outline" size="icon" className="h-9 w-9">
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function MobileContentSheet() {
  const TODAY = useTodayContent();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="fixed bottom-[88px] right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full shadow-lg outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 md:hidden"
        style={{
          background: "var(--gold)",
          color: "var(--ivory)",
          ["--tw-ring-color" as string]: "var(--walnut)",
          boxShadow: "0 10px 28px -10px rgba(43,43,43,0.35)",
        }}
      >
        <BookOpen className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="today-sheet-title"
        >
          <div
            className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className="relative w-full overflow-hidden rounded-t-[2.5rem] bg-[var(--ivory)] shadow-2xl animate-[slide-up_0.35s_cubic-bezier(0.22,1,0.36,1)_forwards]"
            style={{ maxHeight: "90vh", boxShadow: "0 -20px 60px -20px rgba(43,43,43,0.25)" }}
          >
            <div className="flex justify-center px-5 pt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-1.5 w-14 rounded-full bg-ink/15 transition-colors hover:bg-ink/25"
                aria-label="Close"
              />
            </div>
            <div className="max-h-[90vh] overflow-y-auto px-6 pb-8 pt-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--gold)" }}>
                    {TODAY.reference}
                  </p>
                  <h2 id="today-sheet-title" className="mt-1 font-serif text-2xl leading-tight">
                    {t("today.title")}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/10 text-ink/60 hover:bg-ink/5 hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <JourneyTabs />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function JourneyTabs() {
  const TODAY = useTodayContent();
  const { t } = useI18n();
  return (
    <Tabs defaultValue="scripture" className="w-full">
      <TabsList className="mt-4 grid w-full grid-cols-4 rounded-none border-b border-border bg-transparent p-0">
        {[
          ["scripture", t("journey.scripture")],
          ["devotional", t("journey.devotional")],
          ["reflection", t("journey.reflection")],
          ["prayer", t("journey.prayer")],
        ].map(([k, l]) => (
          <TabsTrigger
            key={k}
            value={k}
            className="rounded-none border-b-2 border-transparent bg-transparent py-3 text-[11px] data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none md:text-sm"
          >
            {l}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="p-5 md:p-8">
        <TabsContent value="scripture" className="mt-0 space-y-3">
          <p className="text-xs uppercase tracking-widest" style={{ color: "var(--walnut)" }}>
            {TODAY.reference}
          </p>
          <p className="font-serif text-lg leading-relaxed md:text-xl">"{TODAY.scripture}"</p>
        </TabsContent>
        <TabsContent value="devotional" className="mt-0 text-sm leading-relaxed text-foreground/90 md:text-base">
          {TODAY.devotional}
        </TabsContent>
        <TabsContent value="reflection" className="mt-0 space-y-4">
          <p className="text-sm leading-relaxed text-foreground/90 md:text-base">{TODAY.reflection}</p>
          <textarea
            placeholder="Write your reflection…"
            className="min-h-32 w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary"
          />
        </TabsContent>
        <TabsContent value="prayer" className="mt-0 font-serif text-lg leading-relaxed">
          {TODAY.prayer}
        </TabsContent>
      </div>
    </Tabs>
  );
}

function DifficultyPicker({
  value,
  onChange,
  compact = false,
}: {
  value: "gentle" | "balanced" | "challenging" | "expert";
  onChange: (v: "gentle" | "balanced" | "challenging" | "expert") => void;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const opts = ["gentle", "balanced", "challenging", "expert"] as const;
  if (compact) {
    return (
      <div className="grid grid-cols-4 gap-1.5">
        {opts.map((o) => {
          const active = value === o;
          return (
            <button
              key={o}
              onClick={() => onChange(o)}
              className={`rounded-md border px-2 py-2 text-center text-[10px] font-medium uppercase tracking-wider transition ${
                active ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"
              }`}
            >
              {t(`diff.${o}`)}
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div className="grid gap-2 sm:grid-cols-4">
      {opts.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`rounded-lg border px-4 py-3 text-left transition ${
              active ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <p className="text-sm font-medium">{t(`diff.${o}`)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t(`diff.${o}Desc`)}</p>
          </button>
        );
      })}
    </div>
  );
}

function HelpMenu() {
  const { t } = useI18n();
  return (
    <AlertDialog>
      <Button variant="ghost" size="sm" asChild className="h-9 px-2">
        <AlertDialogTrigger>
          <HelpCircle className="mr-1.5 h-4 w-4" />
          <span className="hidden sm:inline">{t("journey.help")}</span>
        </AlertDialogTrigger>
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("help.confirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t("help.confirmBody")}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-2 text-sm">
          {[t("help.revealLetter"), t("help.showDirection"), t("help.revealWord")].map((label) => (
            <button
              key={label}
              className="rounded-md border border-border px-3 py-2 text-left hover:bg-secondary"
            >
              {label}
            </button>
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("help.cancel")}</AlertDialogCancel>
          <AlertDialogAction>{t("help.confirm")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function Completion({ onReset }: { onReset: () => void }) {
  const TODAY = useTodayContent();
  const { t } = useI18n();
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div
          className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "color-mix(in oklab, var(--sage) 22%, transparent)" }}
        >
          <CheckCircle2 className="h-8 w-8" style={{ color: "var(--sage)" }} />
        </div>
        <h1 className="font-serif text-4xl leading-tight">{t("complete.title")}</h1>
        <p className="mt-4 text-base text-muted-foreground">{t("complete.sub")}</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Words found", value: `${TODAY.words.length}/${TODAY.words.length}` },
            { label: "Current streak", value: "13 days" },
            { label: "Passage", value: TODAY.reference },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="mt-2 font-serif text-xl">{s.value}</p>
            </div>
          ))}
        </div>

        <blockquote className="mt-10 border-l-2 pl-6 text-left font-serif text-lg italic leading-relaxed" style={{ borderColor: "var(--gold)" }}>
          "{TODAY.scripture}"
          <footer className="mt-2 text-xs not-italic uppercase tracking-widest" style={{ color: "var(--walnut)" }}>
            {TODAY.reference}
          </footer>
        </blockquote>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button variant="outline" onClick={onReset}>{t("complete.favorite")}</Button>
          <Button variant="outline">{t("complete.share")}</Button>
          <Button asChild variant="outline"><Link to="/collections">{t("complete.another")}</Link></Button>
          <Button asChild><Link to="/my-journey">{t("complete.home")}</Link></Button>
        </div>
      </div>
    </AppShell>
  );
}
