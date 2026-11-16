import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminJourneys } from "@/lib/content/admin-repository";
import type { ScriptureReferenceRow } from "@/lib/content/rows";

type Draft = {
  sourceId: string;
  bookCode: string;
  chapter: string;
  verseStart: string;
  verseEnd: string;
  displayReference: string;
  storedText: string;
};

function toDraft(r: ScriptureReferenceRow): Draft {
  return {
    sourceId: r.source_id,
    bookCode: r.book_code,
    chapter: String(r.chapter),
    verseStart: String(r.verse_start),
    verseEnd: r.verse_end ? String(r.verse_end) : "",
    displayReference: r.display_reference,
    storedText: r.stored_text ?? "",
  };
}

function toInput(journeyId: string, d: Draft, position: number) {
  return {
    journeyId,
    sourceId: d.sourceId,
    bookCode: d.bookCode.trim().toUpperCase(),
    chapter: Number(d.chapter),
    verseStart: Number(d.verseStart),
    verseEnd: d.verseEnd ? Number(d.verseEnd) : undefined,
    displayReference: d.displayReference.trim(),
    storedText: d.storedText.trim() || undefined,
    position,
  };
}

export function ScriptureTab({
  journeyId,
  references,
}: {
  journeyId: string;
  references: ScriptureReferenceRow[];
}) {
  const sources = useQuery({
    queryKey: ["admin", "scripture-sources"],
    queryFn: () => adminJourneys.listScriptureSources(),
  });
  const sorted = [...references].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        One verse per Bible translation. The app shows the verse matching the reader's language,
        falling back to English.
      </p>
      {sorted.map((r) => (
        <VerseCard
          key={r.id}
          journeyId={journeyId}
          row={r}
          sources={sources.data ?? []}
        />
      ))}
      <VerseCard journeyId={journeyId} sources={sources.data ?? []} nextPosition={sorted.length} />
    </div>
  );
}

function VerseCard({
  journeyId,
  row,
  sources,
  nextPosition = 0,
}: {
  journeyId: string;
  row?: ScriptureReferenceRow;
  sources: { id: string; translation_code: string; translation_name: string; language_code: string }[];
  nextPosition?: number;
}) {
  const qc = useQueryClient();
  const empty: Draft = {
    sourceId: "", bookCode: "", chapter: "", verseStart: "", verseEnd: "",
    displayReference: "", storedText: "",
  };
  const [d, setD] = useState<Draft>(row ? toDraft(row) : empty);
  const set = (k: keyof Draft, v: string) => setD((p) => ({ ...p, [k]: v }));
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "journey", journeyId] });

  const save = useMutation({
    mutationFn: () => {
      const input = toInput(journeyId, d, row?.position ?? nextPosition);
      return row
        ? adminJourneys.updateScriptureReference(row.id, input)
        : adminJourneys.upsertScriptureReference(input);
    },
    onSuccess: () => {
      toast.success(row ? "Verse saved" : "Verse added");
      if (!row) setD(empty);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message || "Could not save verse"),
  });

  const remove = useMutation({
    mutationFn: () => adminJourneys.deleteScriptureReference(row!.id),
    onSuccess: () => { toast.success("Verse removed"); refresh(); },
    onError: (e: Error) => toast.error(e.message || "Could not remove verse"),
  });

  const field = "space-y-1.5 text-sm";
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{row ? row.display_reference : "Add a verse"}</h3>
        {row && (
          <Button
            variant="ghost"
            size="sm"
            aria-label="Remove verse"
            onClick={() => confirm("Remove this verse?") && remove.mutate()}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className={field}>
          <span>Bible translation</span>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3"
            value={d.sourceId}
            onChange={(e) => set("sourceId", e.target.value)}
          >
            <option value="">Choose…</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.language_code.toUpperCase()} — {s.translation_name}
              </option>
            ))}
          </select>
        </label>
        <label className={field}>
          <span>Reference shown to readers</span>
          <Input value={d.displayReference} placeholder="Salmo 23:1-3"
            onChange={(e) => set("displayReference", e.target.value)} />
        </label>
        <label className={field}>
          <span>Book code (3 letters)</span>
          <Input value={d.bookCode} placeholder="PSA" maxLength={3}
            onChange={(e) => set("bookCode", e.target.value)} />
        </label>
        <label className={field}>
          <span>Chapter</span>
          <Input type="number" min={1} value={d.chapter} onChange={(e) => set("chapter", e.target.value)} />
        </label>
        <label className={field}>
          <span>First verse</span>
          <Input type="number" min={1} value={d.verseStart} onChange={(e) => set("verseStart", e.target.value)} />
        </label>
        <label className={field}>
          <span>Last verse (optional)</span>
          <Input type="number" min={1} value={d.verseEnd} onChange={(e) => set("verseEnd", e.target.value)} />
        </label>
      </div>
      <label className={field + " block"}>
        <span>Verse text</span>
        <Textarea rows={4} value={d.storedText} onChange={(e) => set("storedText", e.target.value)} />
      </label>
      <Button onClick={() => save.mutate()} disabled={save.isPending}>
        {save.isPending ? "Saving…" : row ? "Save verse" : "Add verse"}
      </Button>
    </section>
  );
}
