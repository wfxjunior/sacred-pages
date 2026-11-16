import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Feather, Loader2, Trash2 } from "lucide-react";
import { AppShell } from "@/components/site/AppShell";
import { RequireAuth, PRIVATE_ROUTE_META } from "@/components/site/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import {
  JOURNAL_STATES,
  createJournalEntry,
  deleteJournalEntry,
  listJournalEntries,
} from "@/lib/journal/journal.functions";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journey Journal — Lumena" },
      { name: "description", content: "Record how your journey is going and receive a personal reflection." },
      { property: "og:title", content: "Journey Journal — Lumena" },
      { property: "og:description", content: "Your private journey notes with personal reflections." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      PRIVATE_ROUTE_META,
    ],
  }),
  component: () => (
    <RequireAuth>
      <Journal />
    </RequireAuth>
  ),
});

type State = (typeof JOURNAL_STATES)[number];
type Loc = "en" | "pt" | "es";

const COPY: Record<Loc, Record<string, string>> = {
  en: {
    eyebrow: "Journey journal", title: "How is your journey going?",
    sub: "Write freely. Your notes are private — Lumena turns them into a personal reflection.",
    journey: "Journey (optional)", journeyPh: "e.g. The Psalms of David", state: "How do you feel?",
    progress: "Progress", notes: "Your notes", notesPh: "What stood out today? What are you carrying?",
    save: "Save & reflect", saving: "Reflecting…", history: "Your entries", empty: "No entries yet. Your first note will appear here.",
    reflection: "Reflection", noReflection: "The reflection couldn't be created this time, but your note was saved.",
    saved: "Entry saved", failed: "Could not save your entry", deleted: "Entry deleted",
    joyful: "Joyful", steady: "Steady", seeking: "Seeking", weary: "Weary", struggling: "Struggling",
  },
  pt: {
    eyebrow: "Diário da jornada", title: "Como está sua jornada?",
    sub: "Escreva livremente. Suas anotações são privadas — a Lumena as transforma em uma reflexão pessoal.",
    journey: "Jornada (opcional)", journeyPh: "ex.: Os Salmos de Davi", state: "Como você se sente?",
    progress: "Progresso", notes: "Suas anotações", notesPh: "O que chamou sua atenção hoje? O que você está carregando?",
    save: "Salvar e refletir", saving: "Refletindo…", history: "Suas anotações", empty: "Nenhuma anotação ainda. A primeira aparecerá aqui.",
    reflection: "Reflexão", noReflection: "Não foi possível criar a reflexão agora, mas sua anotação foi salva.",
    saved: "Anotação salva", failed: "Não foi possível salvar", deleted: "Anotação excluída",
    joyful: "Alegre", steady: "Firme", seeking: "Buscando", weary: "Cansado", struggling: "Lutando",
  },
  es: {
    eyebrow: "Diario del viaje", title: "¿Cómo va tu viaje?",
    sub: "Escribe libremente. Tus notas son privadas — Lumena las convierte en una reflexión personal.",
    journey: "Viaje (opcional)", journeyPh: "ej.: Los Salmos de David", state: "¿Cómo te sientes?",
    progress: "Progreso", notes: "Tus notas", notesPh: "¿Qué te llamó la atención hoy? ¿Qué estás cargando?",
    save: "Guardar y reflexionar", saving: "Reflexionando…", history: "Tus notas", empty: "Aún no hay notas. La primera aparecerá aquí.",
    reflection: "Reflexión", noReflection: "No se pudo crear la reflexión esta vez, pero tu nota se guardó.",
    saved: "Nota guardada", failed: "No se pudo guardar", deleted: "Nota eliminada",
    joyful: "Alegre", steady: "Firme", seeking: "Buscando", weary: "Cansado", struggling: "Luchando",
  },
};

function Journal() {
  const { locale } = useI18n();
  const loc: Loc = locale === "pt" || locale === "es" ? locale : "en";
  const c = COPY[loc];
  const qc = useQueryClient();
  const list = useServerFn(listJournalEntries);
  const create = useServerFn(createJournalEntry);
  const remove = useServerFn(deleteJournalEntry);

  const [journeyTitle, setJourneyTitle] = useState("");
  const [state, setState] = useState<State>("steady");
  const [progress, setProgress] = useState(50);
  const [notes, setNotes] = useState("");

  const entries = useQuery({ queryKey: ["journal"], queryFn: () => list() });

  const save = useMutation({
    mutationFn: () => create({ data: { journeyTitle, state, progress, notes, locale: loc } }),
    onSuccess: (res) => {
      toast.success(c.saved);
      if (res.aiError) toast.message(c.noReflection);
      setNotes("");
      qc.invalidateQueries({ queryKey: ["journal"] });
    },
    onError: () => toast.error(c.failed),
  });

  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success(c.deleted);
      qc.invalidateQueries({ queryKey: ["journal"] });
    },
  });

  const dateFmt = new Intl.DateTimeFormat(loc === "pt" ? "pt-BR" : loc, { dateStyle: "medium", timeStyle: "short" });

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--walnut)" }}>{c.eyebrow}</p>
          <h1 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">{c.title}</h1>
          <p className="mt-2 max-w-xl text-[14px] text-muted-foreground">{c.sub}</p>
        </div>

        <form
          className="space-y-6 rounded-2xl border border-border bg-card p-5 md:p-7"
          onSubmit={(e) => {
            e.preventDefault();
            if (notes.trim().length >= 3) save.mutate();
          }}
        >
          <label className="block space-y-2">
            <span className="text-sm font-medium">{c.journey}</span>
            <Input value={journeyTitle} maxLength={120} placeholder={c.journeyPh} onChange={(e) => setJourneyTitle(e.target.value)} />
          </label>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">{c.state}</legend>
            <div className="flex flex-wrap gap-2">
              {JOURNAL_STATES.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={state === s}
                  onClick={() => setState(s)}
                  className={`min-h-10 rounded-full border px-4 text-sm transition ${
                    state === s ? "border-foreground bg-foreground/5 font-medium" : "border-border text-muted-foreground hover:border-foreground/40"
                  }`}
                >
                  {c[s]}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block space-y-2">
            <span className="flex justify-between text-sm font-medium">
              <span>{c.progress}</span>
              <span className="tabular-nums text-muted-foreground">{progress}%</span>
            </span>
            <input type="range" min={0} max={100} step={5} value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="w-full accent-[var(--walnut)]" />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">{c.notes}</span>
            <Textarea value={notes} rows={6} maxLength={4000} placeholder={c.notesPh} onChange={(e) => setNotes(e.target.value)} className="font-serif text-[15px] leading-relaxed" />
          </label>

          <Button type="submit" size="lg" className="w-full md:w-auto" disabled={save.isPending || notes.trim().length < 3}>
            {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Feather className="mr-2 h-4 w-4" />}
            {save.isPending ? c.saving : c.save}
          </Button>
        </form>

        <section className="space-y-4">
          <h2 className="font-serif text-2xl">{c.history}</h2>
          {entries.isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : !entries.data?.length ? (
            <p className="text-sm text-muted-foreground">{c.empty}</p>
          ) : (
            entries.data.map((e) => (
              <article key={e.id} className="space-y-4 rounded-2xl border border-border bg-card p-5">
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{dateFmt.format(new Date(e.created_at))}</p>
                    <p className="mt-1 font-medium">
                      {e.journey_title || "—"} · {c[e.state] ?? e.state} · {e.progress}%
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => del.mutate(e.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </header>
                <p className="whitespace-pre-wrap text-[14px] text-muted-foreground">{e.notes}</p>
                {e.reflection ? (
                  <div className="rounded-xl border-l-2 bg-muted/40 p-4" style={{ borderColor: "var(--walnut)" }}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>{c.reflection}</p>
                    <p className="mt-2 whitespace-pre-wrap font-serif text-[15px] leading-relaxed">{e.reflection}</p>
                  </div>
                ) : null}
              </article>
            ))
          )}
        </section>
      </div>
    </AppShell>
  );
}
