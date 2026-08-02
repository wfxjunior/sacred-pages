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
import { dayVariant, useTodayContent, useTodayLoading } from "@/lib/content/today";
import { JourneyThemePicker } from "@/components/site/JourneyThemePicker";
import { useI18n } from "@/lib/i18n";
import { CheckCircle2, HelpCircle, X, Lightbulb, Compass, Type, Eye, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Library, RefreshCw } from "lucide-react";

const todaySearchSchema = z.object({
  journey: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/today")({
  validateSearch: (input: Record<string, unknown>) => todaySearchSchema.parse(input),
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
  const { t } = useI18n();
  const [difficulty, setDifficulty] = useState<"gentle" | "balanced" | "challenging" | "expert">("gentle");
  // The draw rotates daily on its own; every load advances a persisted counter
  // so the pool is recomputed instead of replaying the same list, and a shuffle
  // bumps it again for a fresh set right away.
  const [wordVariant, setWordVariant] = useState(() => dayVariant());
  const newWords = () => setWordVariant((v) => v + 1);
  // Full regeneration: brand-new draw + brand-new grid, with no carry-over of
  // found words, timer or saved progress from the previous puzzle.
  const [puzzleSession, setPuzzleSession] = useState("s0");
  const regenerate = () => {
    setWordVariant((v) => v + 1 + Math.floor(Math.random() * 997));
    setPuzzleSession(`s${Date.now().toString(36)}`);
  };
  useEffect(() => {
    // Runs after hydration (SSR renders the daily draw) to avoid a mismatch.
    let next = 1;
    try {
      const raw = Number(window.localStorage.getItem("lumena:wordVariant") ?? "0");
      next = (Number.isFinite(raw) ? raw : 0) + 1;
      window.localStorage.setItem("lumena:wordVariant", String(next));
    } catch {
      next = Math.floor(Math.random() * 1000) + 1;
    }
    setWordVariant(dayVariant() + next);
    // New layout on every load too, so a word never keeps the same cells.
    setPuzzleSession(`s${next}`);
  }, []);
  const TODAY = useTodayContent(difficulty, wordVariant);
  const loading = useTodayLoading();
  const [complete, setComplete] = useState(false);
  const sizes = { gentle: 10, balanced: 12, challenging: 14, expert: 16 } as const;

  if (complete) return <Completion onReset={() => setComplete(false)} />;
  if (loading) return <TodaySkeleton />;

  return (
    <AppShell mainClassName="p-0 md:px-8 md:py-6">
      {/* Desktop layout */}
      <div className="mx-auto hidden max-w-6xl md:flex md:h-[calc(100dvh-3rem)] md:flex-col md:gap-4 md:overflow-hidden">
        <div className="flex flex-none flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>
              {TODAY.reference}
            </p>
            <h1 className="mt-0.5 font-serif text-2xl md:text-3xl">{TODAY.title}</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("today.duration")} · {t(`diff.${difficulty}`)} · {TODAY.words.length}{" "}
              {t(TODAY.words.length === 1 ? "today.word" : "today.words")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyPicker value={difficulty} onChange={setDifficulty} variant="segmented" />
            <JourneyThemePicker />
            <HelpMenu />
            <Button asChild variant="ghost" size="sm">
              <Link to="/collections">
                <Library className="mr-1.5 h-4 w-4" /> {t("nav.collections")}
              </Link>
            </Button>
            <Button onClick={() => setComplete(true)} variant="outline" size="sm">
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> {t("complete.favorite")}
            </Button>
            <Button onClick={regenerate} variant="outline" size="sm">
              <RefreshCw className="mr-1.5 h-4 w-4" /> {t("wordsearch.regenerate")}
            </Button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-2 lg:items-stretch">
          <div className="min-h-0 min-w-0 overflow-y-auto">
            <div className="mx-auto w-full max-w-[min(460px,58vh)]">
              <WordSearch
                key={`${puzzleSession}:${difficulty}`}
                words={TODAY.words}
                size={sizes[difficulty]}
                journeyLabel={TODAY.title}
                onShuffleWords={newWords}
                sessionKey={puzzleSession}
              />
            </div>
          </div>
          <DevotionalPanel />
        </div>
      </div>

      {/* Mobile full-bleed layout */}
      <div className="flex min-h-[100dvh] flex-col md:hidden">
        <MobileHeader
          wordCount={TODAY.words.length}
          difficultyLabel={t(`diff.${difficulty}`)}
          onComplete={() => setComplete(true)}
        />

        <div className="flex flex-none items-center justify-between gap-2 px-4 py-2">
          <DifficultyPicker value={difficulty} onChange={setDifficulty} compact />
          <Button onClick={regenerate} variant="outline" size="sm" className="shrink-0">
            <RefreshCw className="mr-1.5 h-4 w-4" /> {t("wordsearch.regenerate")}
          </Button>
        </div>

        <div className="min-h-0 flex-1 px-3 pb-2">
          <WordSearch
            key={`${puzzleSession}:${difficulty}`}
            words={TODAY.words}
            size={sizes[difficulty]}
            fullBleed
            journeyLabel={TODAY.title}
            onShuffleWords={newWords}
            sessionKey={puzzleSession}
          />
        </div>

        <MobileContentSheet />
      </div>
    </AppShell>
  );
}

function MobileHeader({
  wordCount,
  difficultyLabel,
  onComplete,
}: {
  wordCount: number;
  difficultyLabel: string;
  onComplete: () => void;
}) {
  const TODAY = useTodayContent();
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>
          {TODAY.reference}
        </p>
        <h1 className="mt-0.5 truncate font-serif text-lg leading-tight">{TODAY.title}</h1>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {wordCount} {t(wordCount === 1 ? "today.word" : "today.words")} · {difficultyLabel}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <JourneyThemePicker compact />
        <HelpMenu />
        <Button onClick={onComplete} variant="outline" size="icon" className="h-9 w-9">
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function TodaySkeleton() {
  return (
    <AppShell mainClassName="p-0 md:px-10 md:py-12">
      <div className="mx-auto max-w-6xl animate-pulse space-y-8 px-4 py-6 md:px-0 md:py-0">
        <div className="space-y-3">
          <div className="h-3 w-28 rounded bg-foreground/10" />
          <div className="h-8 w-72 max-w-full rounded bg-foreground/10" />
          <div className="h-3 w-44 rounded bg-foreground/10" />
        </div>
        <div className="grid gap-2 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-foreground/5" />
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div className="aspect-square w-full rounded-xl bg-foreground/5" />
          <div className="h-80 rounded-xl bg-foreground/5" />
        </div>
      </div>
    </AppShell>
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
      <div className="flex-none px-3 pb-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          className="flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium outline-none transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            background: "var(--gold)",
            color: "var(--ivory)",
            ["--tw-ring-color" as string]: "var(--walnut)",
            boxShadow: "0 10px 28px -12px rgba(43,43,43,0.35)",
          }}
        >
          {t("journey.devotional")}
        </button>
      </div>

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
  return <JourneyTabsContent />;
}

function DevotionalPanel() {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

  const toggleClass =
    "inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]";

  return (
    <>
      <div className="relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <JourneyTabsContent />
        </div>
        <div className="pointer-events-none absolute right-3 top-3 z-10">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className={`pointer-events-auto bg-card/90 backdrop-blur ${toggleClass}`}
            aria-label={t("wordsearch.expand")}
          >
            <Maximize2 className="h-3.5 w-3.5" />
            {t("wordsearch.expand")}
          </button>
        </div>
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-[var(--ivory)] animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex flex-none items-center justify-end border-b border-border/60 px-6 py-3">
            <button type="button" onClick={() => setExpanded(false)} className={toggleClass}>
              <Minimize2 className="h-3.5 w-3.5" />
              {t("wordsearch.collapse")}
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-3xl px-2 pb-16 md:px-6">
              <JourneyTabsContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function JourneyTabsContent() {
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
  variant = "cards",
}: {
  value: "gentle" | "balanced" | "challenging" | "expert";
  onChange: (v: "gentle" | "balanced" | "challenging" | "expert") => void;
  compact?: boolean;
  variant?: "cards" | "segmented";
}) {
  const { t } = useI18n();
  const opts = ["gentle", "balanced", "challenging", "expert"] as const;
  if (variant === "segmented") {
    return (
      <div className="grid w-full grid-cols-4 items-stretch gap-0.5 rounded-full border border-border bg-card p-0.5 sm:inline-grid sm:w-auto">
        {opts.map((o) => {
          const active = value === o;
          return (
            <button
              key={o}
              onClick={() => onChange(o)}
              aria-pressed={active}
              className={`min-w-0 truncate rounded-full px-2 py-1.5 text-center text-[11px] font-medium transition sm:min-w-[104px] sm:px-3 sm:text-xs ${
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(`diff.${o}`)}
            </button>
          );
        })}
      </div>
    );
  }
  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {opts.map((o) => {
          const active = value === o;
          return (
            <button
              key={o}
              onClick={() => onChange(o)}
              aria-pressed={active}
              className={`flex min-h-9 w-full min-w-0 items-center justify-center truncate rounded-full border px-2 text-center text-[10px] font-semibold uppercase leading-none tracking-[0.08em] transition ${
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
    <div className="grid grid-cols-2 items-stretch gap-2 sm:grid-cols-4">
      {opts.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`flex h-full min-w-0 flex-col rounded-lg border px-4 py-3 text-left transition ${
              active ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <p className="truncate text-sm font-medium">{t(`diff.${o}`)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t(`diff.${o}Desc`)}</p>
          </button>
        );
      })}
    </div>
  );
}

function HelpMenu() {
  const { t } = useI18n();
  const hints = [
    { icon: Type, label: t("help.revealLetter"), desc: t("help.revealLetterDesc") },
    { icon: Compass, label: t("help.showDirection"), desc: t("help.showDirectionDesc") },
    { icon: Eye, label: t("help.revealWord"), desc: t("help.revealWordDesc") },
  ];
  return (
    <AlertDialog>
      <Button variant="ghost" size="sm" asChild className="h-9 px-2">
        <AlertDialogTrigger>
          <HelpCircle className="mr-1.5 h-4 w-4" />
          <span className="hidden sm:inline">{t("journey.help")}</span>
        </AlertDialogTrigger>
      </Button>
      <AlertDialogContent className="max-w-md gap-0 overflow-hidden rounded-2xl p-0">
        <AlertDialogHeader className="space-y-3 border-b border-border/60 px-6 pb-5 pt-6 text-center sm:text-center">
          <div
            className="mx-auto flex h-11 w-11 items-center justify-center rounded-full"
            style={{ background: "color-mix(in oklab, var(--gold) 16%, transparent)" }}
          >
            <Lightbulb className="h-5 w-5" style={{ color: "var(--gold)" }} />
          </div>
          <AlertDialogTitle className="text-xl leading-tight">{t("help.confirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {t("help.confirmBody")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="px-6 py-5">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {t("help.gentle")}
          </p>
          <div className="grid gap-2">
            {hints.map(({ icon: Icon, label, desc }) => (
              <button
                key={label}
                className="group flex items-center gap-3 rounded-xl border border-border/70 bg-card px-3.5 py-3 text-left transition hover:border-primary/40 hover:bg-secondary/60"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition group-hover:text-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-tight">{label}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{desc}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-border/60 bg-secondary/30 px-6 py-5">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {t("help.finalStep")}
          </p>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
            <AlertDialogAction className="w-full">{t("help.confirm")}</AlertDialogAction>
            <AlertDialogCancel className="mt-0 w-full border-0 bg-transparent shadow-none hover:bg-secondary">
              {t("help.cancel")}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </div>
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
