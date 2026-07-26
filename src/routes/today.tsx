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
import { TODAY } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";
import { CheckCircle2, HelpCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/today")({
  head: () => ({
    meta: [
      { title: "Today's Journey — Lumen Verse" },
      { name: "description", content: "A quiet daily journey through Scripture with a devotional, word search, reflection and prayer." },
      { property: "og:title", content: "Today's Journey — Lumen Verse" },
      { property: "og:description", content: "A daily Bible journey with devotional, word search, reflection and prayer." },
    ],
  }),
  component: Today,
});

function Today() {
  const { t } = useI18n();
  const [difficulty, setDifficulty] = useState<"gentle" | "balanced" | "challenging" | "expert">("gentle");
  const [complete, setComplete] = useState(false);
  const sizes = { gentle: 10, balanced: 12, challenging: 14, expert: 16 } as const;

  if (complete) return <Completion onReset={() => setComplete(false)} />;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-8">
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
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Mark complete
            </Button>
          </div>
        </div>

        <DifficultyPicker value={difficulty} onChange={setDifficulty} />

        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <WordSearch words={TODAY.words} size={sizes[difficulty]} />
          </div>
          <div className="rounded-xl border border-border bg-card">
            <Tabs defaultValue="scripture" className="w-full">
              <TabsList className="grid w-full grid-cols-4 rounded-none border-b border-border bg-transparent p-0">
                {[
                  ["scripture", t("journey.scripture")],
                  ["devotional", t("journey.devotional")],
                  ["reflection", t("journey.reflection")],
                  ["prayer", t("journey.prayer")],
                ].map(([k, l]) => (
                  <TabsTrigger
                    key={k}
                    value={k}
                    className="rounded-none border-b-2 border-transparent bg-transparent py-3 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    {l}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="p-6 md:p-8">
                <TabsContent value="scripture" className="mt-0 space-y-3">
                  <p className="text-xs uppercase tracking-widest" style={{ color: "var(--walnut)" }}>{TODAY.reference}</p>
                  <p className="font-serif text-xl leading-relaxed">"{TODAY.scripture}"</p>
                </TabsContent>
                <TabsContent value="devotional" className="mt-0 text-base leading-relaxed text-foreground/90">
                  {TODAY.devotional}
                </TabsContent>
                <TabsContent value="reflection" className="mt-0 space-y-4">
                  <p className="text-base leading-relaxed text-foreground/90">{TODAY.reflection}</p>
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
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function DifficultyPicker({
  value,
  onChange,
}: {
  value: "gentle" | "balanced" | "challenging" | "expert";
  onChange: (v: "gentle" | "balanced" | "challenging" | "expert") => void;
}) {
  const { t } = useI18n();
  const opts = ["gentle", "balanced", "challenging", "expert"] as const;
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
      <Button variant="ghost" size="sm" asChild>
        <AlertDialogTrigger>
          <HelpCircle className="mr-1.5 h-4 w-4" />
          {t("journey.help")}
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