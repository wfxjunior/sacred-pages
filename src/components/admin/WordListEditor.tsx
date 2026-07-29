import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { normalizeWord } from "@/lib/content/normalize";
import {
  hasBlockingIssues,
  parseBulkWords,
  validateWordList,
  type WordIssue,
  type WordListEntry,
} from "@/lib/content/word-list";

// Word-list editor.
//
// Reordering offers explicit Move up / Move down buttons rather than only
// drag-and-drop, so the list is fully operable from a keyboard (rule 32).
// Every row shows the display form beside the matching form, making the
// accent-folding rules visible to editors instead of a hidden surprise.

export function WordListEditor({
  entries,
  minGridSize,
  targetWordCount,
  requiredLocales,
  existingTranslations,
  onChange,
}: {
  entries: WordListEntry[];
  minGridSize: number;
  targetWordCount: number;
  requiredLocales?: readonly string[];
  existingTranslations?: Readonly<Record<string, readonly string[]>>;
  onChange: (entries: WordListEntry[]) => void;
}) {
  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  const issues = useMemo(
    () =>
      validateWordList({
        entries,
        minGridSize,
        targetWordCount,
        requiredLocales,
        existingTranslations,
      }),
    [entries, minGridSize, targetWordCount, requiredLocales, existingTranslations],
  );

  const issuesByIndex = useMemo(() => {
    const map = new Map<number, WordIssue[]>();
    for (const issue of issues) {
      if (issue.index === null) continue;
      const list = map.get(issue.index) ?? [];
      list.push(issue);
      map.set(issue.index, list);
    }
    return map;
  }, [issues]);

  const listIssues = issues.filter((i) => i.index === null);

  function update(index: number, patch: Partial<WordListEntry>) {
    onChange(entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  }

  function remove(index: number) {
    onChange(entries.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= entries.length) return;
    const next = [...entries];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function addBlank() {
    onChange([...entries, { displayValue: "" }]);
  }

  function applyBulk() {
    const parsed = parseBulkWords(bulkText);
    if (parsed.length === 0) return;
    onChange([...entries, ...parsed]);
    setBulkText("");
    setShowBulk(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg">Word list</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {entries.length} of {targetWordCount} target words · smallest grid {minGridSize}×
            {minGridSize}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setShowBulk((v) => !v)}>
            {showBulk ? "Close bulk paste" : "Bulk paste"}
          </Button>
          <Button type="button" size="sm" onClick={addBlank}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden /> Add word
          </Button>
        </div>
      </div>

      {showBulk && (
        <div className="rounded-xl border border-border bg-card p-4">
          <label htmlFor="bulk-words" className="text-sm font-medium">
            Paste words
          </label>
          <p id="bulk-hint" className="mt-1 text-xs text-muted-foreground">
            Separate with new lines, commas or semicolons. Accents are preserved.
          </p>
          <Textarea
            id="bulk-words"
            aria-describedby="bulk-hint"
            rows={4}
            className="mt-2"
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={"GRAÇA\nFÉ\nPAZ"}
          />
          <Button type="button" size="sm" className="mt-3" onClick={applyBulk}>
            Add {parseBulkWords(bulkText).length || ""} words
          </Button>
        </div>
      )}

      {listIssues.length > 0 && (
        <ul className="space-y-1.5" aria-label="Word list warnings">
          {listIssues.map((issue, i) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-lg border px-3 py-2 text-xs"
              style={{
                borderColor:
                  issue.severity === "error"
                    ? "color-mix(in oklab, #B4542F 40%, transparent)"
                    : "var(--border)",
                color: issue.severity === "error" ? "#B4542F" : "var(--muted-foreground)",
              }}
            >
              {issue.severity === "error" ? (
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              ) : (
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              )}
              <span>
                <span className="sr-only">
                  {issue.severity === "error" ? "Error: " : "Warning: "}
                </span>
                {issue.message}
              </span>
            </li>
          ))}
        </ul>
      )}

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No words yet. Add at least three for a puzzle.
        </div>
      ) : (
        <ol className="space-y-3">
          {entries.map((entry, index) => {
            const rowIssues = issuesByIndex.get(index) ?? [];
            const hasError = rowIssues.some((i) => i.severity === "error");
            const normalized = normalizeWord(entry.displayValue);
            const inputId = `word-${index}`;

            return (
              <li
                key={index}
                className="rounded-xl border bg-card p-4"
                style={{
                  borderColor: hasError
                    ? "color-mix(in oklab, #B4542F 45%, transparent)"
                    : "var(--border)",
                }}
              >
                <div className="flex flex-wrap items-start gap-3">
                  <span
                    className="mt-2 w-6 shrink-0 text-center text-xs tabular-nums text-muted-foreground"
                    aria-hidden
                  >
                    {index + 1}
                  </span>

                  <div className="min-w-[12rem] flex-1">
                    <label htmlFor={inputId} className="sr-only">
                      Word {index + 1}
                    </label>
                    <Input
                      id={inputId}
                      value={entry.displayValue}
                      aria-invalid={hasError || undefined}
                      aria-describedby={rowIssues.length ? `${inputId}-issues` : undefined}
                      onChange={(e) => update(index, { displayValue: e.target.value })}
                      placeholder="Display spelling, e.g. ORAÇÃO"
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Matches as{" "}
                      <span className="font-medium tabular-nums text-foreground">
                        {normalized || "—"}
                      </span>
                      {normalized && ` · ${normalized.length} cells`}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${entry.displayValue || `word ${index + 1}`} up`}
                    >
                      <ArrowUp className="h-4 w-4" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => move(index, 1)}
                      disabled={index === entries.length - 1}
                      aria-label={`Move ${entry.displayValue || `word ${index + 1}`} down`}
                    >
                      <ArrowDown className="h-4 w-4" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => remove(index)}
                      aria-label={`Remove ${entry.displayValue || `word ${index + 1}`}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                </div>

                <div className="mt-3 pl-9">
                  <label htmlFor={`${inputId}-explanation`} className="sr-only">
                    Explanation for word {index + 1}
                  </label>
                  <Input
                    id={`${inputId}-explanation`}
                    value={entry.explanation ?? ""}
                    onChange={(e) => update(index, { explanation: e.target.value })}
                    placeholder="Optional explanation or Scripture connection"
                    className="text-sm"
                  />
                </div>

                {rowIssues.length > 0 && (
                  <ul id={`${inputId}-issues`} className="mt-2 space-y-1 pl-9">
                    {rowIssues.map((issue, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-1.5 text-xs"
                        style={{
                          color: issue.severity === "error" ? "#B4542F" : "var(--muted-foreground)",
                        }}
                      >
                        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                        {issue.message}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
        {hasBlockingIssues(issues)
          ? "This word list has errors that must be fixed before the journey can be submitted for review."
          : "Word list is valid."}
      </p>
    </div>
  );
}
