import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge, TranslationStatusBadge } from "@/components/admin/StatusBadge";
import { SaveState, useUnsavedChangesWarning, type SaveStatus } from "@/components/admin/SaveState";
import { FormField } from "@/components/admin/FormField";
import { WordListEditor } from "@/components/admin/WordListEditor";
import { WorkflowActions } from "@/components/admin/WorkflowActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminJourneys, adminWords, adminWorkflow } from "@/lib/content/admin-repository";
import { useAdminSession } from "@/lib/auth/useAdminSession";
import { LOCALES, type Locale } from "@/lib/i18n";
import { isAppError } from "@/lib/errors";
import type { WordListEntry } from "@/lib/content/word-list";
import { REQUIRED_JOURNEY_TRANSLATION_FIELDS, summarizeCoverage } from "@/lib/content/translation";
import {
  DIFFICULTY_LEVELS,
  type DifficultyLevel,
  type TranslationStatus,
} from "@/lib/content/types";
import { DIRECTIONS, type Direction } from "@/lib/puzzle/grid";
import { puzzleTemplateService } from "@/lib/puzzle/services";
import type { PuzzleTemplateRow } from "@/lib/puzzle/rows";

export const Route = createFileRoute("/admin/journeys/$journeyId")({
  head: () => ({
    meta: [
      { title: "Edit journey — Content Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: JourneyEditor,
});

function JourneyEditor() {
  const { journeyId } = Route.useParams();
  const session = useAdminSession();
  const queryClient = useQueryClient();
  const [locale, setLocale] = useState<Locale>("en");

  const journey = useQuery({
    queryKey: ["admin", "journey", journeyId],
    queryFn: () => adminJourneys.getById(journeyId),
    enabled: session.status === "ready",
  });

  const words = useQuery({
    queryKey: ["admin", "journey", journeyId, "words"],
    queryFn: () => adminWords.listForJourney(journeyId),
    enabled: session.status === "ready",
  });

  const coverage = useMemo(() => {
    if (!journey.data) return [];
    return summarizeCoverage(
      journey.data.journey_translations.map((t) => ({
        ...t,
        languageCode: t.language_code,
        publicTitle: t.public_title,
        devotionalBody: t.devotional_body,
        reflectionPrompt: t.reflection_prompt,
        prayerBody: t.prayer_body,
      })),
      LOCALES.map((l) => l.code),
      REQUIRED_JOURNEY_TRANSLATION_FIELDS,
    );
  }, [journey.data]);

  if (journey.isPending) {
    return (
      <AdminShell title="Journey">
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminShell>
    );
  }

  if (journey.isError || !journey.data) {
    return (
      <AdminShell title="Journey">
        <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Could not load this journey. It may have been deleted, or you may not have access.
        </p>
      </AdminShell>
    );
  }

  const data = journey.data;

  return (
    <AdminShell
      title={data.internal_title}
      description={`/${data.slug} · version ${data.current_version}`}
      actions={
        <>
          <StatusBadge status={data.status} />
          <WorkflowActions
            entityType="journey"
            entityId={data.id}
            status={data.status}
            createdBy={data.created_by}
            onChanged={() =>
              queryClient.invalidateQueries({ queryKey: ["admin", "journey", journeyId] })
            }
          />
        </>
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Translations</span>
        {coverage.map((c) => (
          <TranslationStatusBadge
            key={c.languageCode}
            languageCode={c.languageCode}
            status={c.status}
            percentComplete={c.percentComplete}
          />
        ))}
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="words">Words</TabsTrigger>
          <TabsTrigger value="puzzle">Puzzle</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <label htmlFor="locale-picker" className="text-sm font-medium">
              Editing language
            </label>
            <div className="w-44">
              <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
                <SelectTrigger id="locale-picker">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCALES.map((l) => (
                    <SelectItem key={l.code} value={l.code}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <TranslationEditor journeyId={journeyId} locale={locale} />
        </TabsContent>

        <TabsContent value="words">
          <WordsTab
            journeyId={journeyId}
            locale={locale}
            words={words.data ?? []}
            isPending={words.isPending}
            minGridSize={data.puzzle_template?.min_grid_size ?? 10}
            targetWordCount={data.puzzle_template?.target_word_count ?? 8}
          />
        </TabsContent>

        <TabsContent value="puzzle">
          <PuzzleTab
            journeyId={journeyId}
            languageCode={data.primary_language_code}
            difficulty={data.difficulty}
            template={data.puzzle_template}
          />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab journeyId={journeyId} journey={data} />
        </TabsContent>

        <TabsContent value="history">
          <HistoryTab entityId={journeyId} />
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}

// ---------------------------------------------------------------------------

function TranslationEditor({ journeyId, locale }: { journeyId: string; locale: Locale }) {
  const queryClient = useQueryClient();
  const journey = useQuery({
    queryKey: ["admin", "journey", journeyId],
    queryFn: () => adminJourneys.getById(journeyId),
  });

  const existing = journey.data?.journey_translations.find((t) => t.language_code === locale);

  const [form, setForm] = useState({
    publicTitle: "",
    subtitle: "",
    devotionalBody: "",
    reflectionPrompt: "",
    prayerBody: "",
    completionMessage: "",
    status: "draft" as TranslationStatus,
  });
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  // Reload the form whenever the selected locale's row changes.
  useEffect(() => {
    setForm({
      publicTitle: existing?.public_title ?? "",
      subtitle: existing?.subtitle ?? "",
      devotionalBody: existing?.devotional_body ?? "",
      reflectionPrompt: existing?.reflection_prompt ?? "",
      prayerBody: existing?.prayer_body ?? "",
      completionMessage: existing?.completion_message ?? "",
      status: existing?.status ?? "draft",
    });
    setDirty(false);
    setSaveStatus("idle");
  }, [existing?.id, locale, existing?.public_title, existing?.status]);

  useUnsavedChangesWarning(dirty);

  const save = useMutation({
    mutationFn: () =>
      adminJourneys.upsertTranslation({
        journeyId,
        languageCode: locale,
        status: form.status,
        publicTitle: form.publicTitle,
        subtitle: form.subtitle || undefined,
        devotionalBody: form.devotionalBody || undefined,
        reflectionPrompt: form.reflectionPrompt || undefined,
        prayerBody: form.prayerBody || undefined,
        completionMessage: form.completionMessage || undefined,
      }),
    onMutate: () => {
      setSaveStatus("saving");
      setSaveError(null);
    },
    onSuccess: async () => {
      setSaveStatus("saved");
      setDirty(false);
      await queryClient.invalidateQueries({ queryKey: ["admin", "journey", journeyId] });
    },
    onError: (error) => {
      setSaveStatus("error");
      setSaveError(isAppError(error) ? error.message : "Could not save");
    },
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  return (
    <form
      className="max-w-3xl space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      {!existing && (
        <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
          No {locale.toUpperCase()} translation yet. Filling this in creates one.
        </p>
      )}

      <section className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <FormField id="publicTitle" label="Public title" required>
          {(props) => (
            <Input
              {...props}
              value={form.publicTitle}
              onChange={(e) => set("publicTitle", e.target.value)}
            />
          )}
        </FormField>

        <FormField id="subtitle" label="Subtitle">
          {(props) => (
            <Input
              {...props}
              value={form.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
            />
          )}
        </FormField>

        <FormField
          id="devotionalBody"
          label="Devotional"
          hint="The short reading that opens the journey."
        >
          {(props) => (
            <Textarea
              {...props}
              rows={8}
              value={form.devotionalBody}
              onChange={(e) => set("devotionalBody", e.target.value)}
            />
          )}
        </FormField>

        <FormField id="reflectionPrompt" label="Reflection prompt">
          {(props) => (
            <Textarea
              {...props}
              rows={3}
              value={form.reflectionPrompt}
              onChange={(e) => set("reflectionPrompt", e.target.value)}
            />
          )}
        </FormField>

        <FormField id="prayerBody" label="Prayer">
          {(props) => (
            <Textarea
              {...props}
              rows={4}
              value={form.prayerBody}
              onChange={(e) => set("prayerBody", e.target.value)}
            />
          )}
        </FormField>

        <FormField id="completionMessage" label="Completion message">
          {(props) => (
            <Input
              {...props}
              value={form.completionMessage}
              onChange={(e) => set("completionMessage", e.target.value)}
            />
          )}
        </FormField>

        <FormField
          id="translationStatus"
          label="Translation status"
          hint="Only published translations are served to readers."
        >
          {(props) => (
            <Select
              value={form.status}
              onValueChange={(v) => set("status", v as TranslationStatus)}
            >
              <SelectTrigger id={props.id} aria-describedby={props["aria-describedby"]}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["draft", "in_review", "approved", "published"] as TranslationStatus[]).map(
                  (s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          )}
        </FormField>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={save.isPending} aria-busy={save.isPending}>
          Save {locale.toUpperCase()} content
        </Button>
        <SaveState status={dirty ? "unsaved" : saveStatus} error={saveError} />
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------

function WordsTab({
  journeyId,
  locale,
  words,
  isPending,
  minGridSize,
  targetWordCount,
}: {
  journeyId: string;
  locale: Locale;
  words: Awaited<ReturnType<typeof adminWords.listForJourney>>;
  isPending: boolean;
  minGridSize: number;
  targetWordCount: number;
}) {
  const queryClient = useQueryClient();
  const [entries, setEntries] = useState<WordListEntry[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setEntries(
      words.map((word) => {
        const translation = word.journey_word_translations.find((t) => t.language_code === locale);
        return {
          id: word.id,
          displayValue: translation?.display_value ?? "",
          explanation: translation?.explanation ?? "",
          isRequired: word.is_required,
        };
      }),
    );
    setDirty(false);
  }, [words, locale]);

  const existingTranslations = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const word of words) {
      map[word.id] = word.journey_word_translations.map((t) => t.language_code);
    }
    return map;
  }, [words]);

  useUnsavedChangesWarning(dirty);

  const save = useMutation({
    mutationFn: async () => {
      // Create rows for new entries, persist ordering, then upsert the
      // locale translation for each. The normalized form is derived server-side
      // in the repository so display and matching can never drift apart.
      for (const [index, entry] of entries.entries()) {
        let wordId = entry.id;
        if (!wordId) {
          const created = await adminWords.createWord(journeyId, index);
          wordId = created.id;
        }
        if (entry.displayValue.trim()) {
          await adminWords.upsertTranslation({
            journeyWordId: wordId,
            languageCode: locale,
            status: "draft",
            displayValue: entry.displayValue.trim(),
            explanation: entry.explanation || undefined,
          });
        }
      }

      const removed = words.filter((w) => !entries.some((e) => e.id === w.id));
      for (const word of removed) await adminWords.deleteWord(word.id);

      await adminWords.reorder(
        entries
          .filter((e): e is WordListEntry & { id: string } => Boolean(e.id))
          .map((e, index) => ({ id: e.id, position: index })),
      );
    },
    onMutate: () => {
      setSaveStatus("saving");
      setSaveError(null);
    },
    onSuccess: async () => {
      setSaveStatus("saved");
      setDirty(false);
      await queryClient.invalidateQueries({ queryKey: ["admin", "journey", journeyId, "words"] });
    },
    onError: (error) => {
      setSaveStatus("error");
      setSaveError(isAppError(error) ? error.message : "Could not save the word list");
    },
  });

  if (isPending) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="max-w-3xl space-y-6">
      <p className="text-sm text-muted-foreground">
        Editing the <span className="font-medium uppercase">{locale}</span> word list. Switch
        language on the Content tab.
      </p>

      <WordListEditor
        entries={entries}
        minGridSize={minGridSize}
        targetWordCount={targetWordCount}
        requiredLocales={LOCALES.map((l) => l.code)}
        existingTranslations={existingTranslations}
        onChange={(next) => {
          setEntries(next);
          setDirty(true);
        }}
      />

      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={() => save.mutate()} disabled={save.isPending} aria-busy={save.isPending}>
          Save word list
        </Button>
        <SaveState status={dirty ? "unsaved" : saveStatus} error={saveError} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function PuzzleTab({
  journeyId,
  languageCode,
  difficulty,
  template,
}: {
  journeyId: string;
  languageCode: string;
  difficulty: DifficultyLevel;
  template: PuzzleTemplateRow | null;
}) {
  const queryClient = useQueryClient();
  const [minGrid, setMinGrid] = useState(String(template?.min_grid_size ?? 10));
  const [maxGrid, setMaxGrid] = useState(String(template?.max_grid_size ?? 16));
  const [wordCount, setWordCount] = useState(String(template?.target_word_count ?? 8));
  const [allowReversed, setAllowReversed] = useState(template?.allow_reversed ?? false);
  const [allowDiagonal, setAllowDiagonal] = useState(template?.allow_diagonal ?? true);
  const [hints, setHints] = useState((template?.hint_policy ?? "limited") !== "none");
  const [solution, setSolution] = useState(template?.full_solution_enabled ?? true);
  const [directions, setDirections] = useState<string[]>(
    template?.allowed_directions ?? ["E", "S", "SE", "NE"],
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const save = useMutation({
    // Editing a template that has already generated puzzles creates a NEW
    // VERSION rather than mutating it, so existing puzzles keep reproducing.
    mutationFn: () => {
      const values = {
        journeyId,
        languageCode: languageCode as "en" | "pt" | "es",
        difficulty,
        minGridSize: Number(minGrid),
        maxGridSize: Number(maxGrid),
        targetWordCount: Number(wordCount),
        allowReversed,
        allowDiagonal,
        hintPolicy: hints ? ("limited" as const) : ("none" as const),
        fullSolutionEnabled: solution,
        allowedDirections: directions as Direction[],
      };
      return template
        ? puzzleTemplateService.update(template.id, values)
        : puzzleTemplateService.create(values);
    },
    onMutate: () => {
      setSaveStatus("saving");
      setSaveError(null);
    },
    onSuccess: async () => {
      setSaveStatus("saved");
      await queryClient.invalidateQueries({ queryKey: ["admin", "journey", journeyId] });
    },
    onError: (error) => {
      setSaveStatus("error");
      setSaveError(isAppError(error) ? error.message : "Could not save puzzle settings");
    },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <p className="rounded-xl border border-border/60 bg-secondary/30 p-4 text-sm text-muted-foreground">
        These settings configure the word-search engine that arrives in Phase 3. Saving them now
        means content is ready the day the engine ships.
      </p>

      <section className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-5 sm:grid-cols-3">
          <FormField id="minGrid" label="Min grid size">
            {(props) => (
              <Input
                {...props}
                type="number"
                min={6}
                max={20}
                value={minGrid}
                onChange={(e) => setMinGrid(e.target.value)}
              />
            )}
          </FormField>
          <FormField id="maxGrid" label="Max grid size">
            {(props) => (
              <Input
                {...props}
                type="number"
                min={6}
                max={20}
                value={maxGrid}
                onChange={(e) => setMaxGrid(e.target.value)}
              />
            )}
          </FormField>
          <FormField id="wordCount" label="Target words">
            {(props) => (
              <Input
                {...props}
                type="number"
                min={3}
                max={24}
                value={wordCount}
                onChange={(e) => setWordCount(e.target.value)}
              />
            )}
          </FormField>
        </div>

        <fieldset>
          <legend className="text-sm font-medium">Allowed directions</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {DIRECTIONS.map((direction) => {
              const checked = directions.includes(direction);
              return (
                <label
                  key={direction}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs"
                  style={{
                    borderColor: checked
                      ? "color-mix(in oklab, var(--gold) 55%, transparent)"
                      : "var(--border)",
                    background: checked
                      ? "color-mix(in oklab, var(--gold) 12%, transparent)"
                      : undefined,
                  }}
                >
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5"
                    checked={checked}
                    onChange={(e) =>
                      setDirections((prev) =>
                        e.target.checked
                          ? [...prev, direction]
                          : prev.filter((d) => d !== direction),
                      )
                    }
                  />
                  {direction}
                </label>
              );
            })}
          </div>
        </fieldset>

        <ToggleRow
          id="allowReversed"
          label="Allow reversed words"
          hint="Words may be written backwards along a direction."
          checked={allowReversed}
          onChange={setAllowReversed}
        />
        <ToggleRow
          id="allowDiagonal"
          label="Allow diagonals"
          checked={allowDiagonal}
          onChange={setAllowDiagonal}
        />
        <ToggleRow id="hints" label="Hints available" checked={hints} onChange={setHints} />
        <ToggleRow
          id="solution"
          label="Full solution available"
          checked={solution}
          onChange={setSolution}
        />
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          Save puzzle settings
        </Button>
        <SaveState status={saveStatus} error={saveError} />
      </div>
    </div>
  );
}

function ToggleRow({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 p-4">
      <label htmlFor={id} className="text-sm">
        {label}
        {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// ---------------------------------------------------------------------------

function SettingsTab({
  journeyId,
  journey,
}: {
  journeyId: string;
  journey: Awaited<ReturnType<typeof adminJourneys.getById>>;
}) {
  const queryClient = useQueryClient();
  const [difficulty, setDifficulty] = useState(journey.difficulty);
  const [estimatedMinutes, setEstimatedMinutes] = useState(String(journey.estimated_minutes));
  const [dailyEligible, setDailyEligible] = useState(journey.daily_eligible);
  const [isFeatured, setIsFeatured] = useState(journey.is_featured);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () =>
      adminJourneys.update(journeyId, {
        difficulty,
        estimatedMinutes: Number(estimatedMinutes),
        dailyEligible,
        isFeatured,
      }),
    onMutate: () => setSaveStatus("saving"),
    onSuccess: async () => {
      setSaveStatus("saved");
      await queryClient.invalidateQueries({ queryKey: ["admin", "journey", journeyId] });
    },
    onError: (error) => {
      setSaveStatus("error");
      setSaveError(isAppError(error) ? error.message : "Could not save");
    },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <section className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="difficulty" label="Difficulty">
            {(props) => (
              <Select
                value={difficulty}
                onValueChange={(v) => setDifficulty(v as typeof difficulty)}
              >
                <SelectTrigger id={props.id}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map((d) => (
                    <SelectItem key={d} value={d} className="capitalize">
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>

          <FormField id="estimatedMinutes" label="Estimated minutes">
            {(props) => (
              <Input
                {...props}
                type="number"
                min={1}
                max={120}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
              />
            )}
          </FormField>
        </div>

        <ToggleRow
          id="dailyEligible"
          label="Eligible for Daily Journey"
          hint="Only eligible journeys can be assigned to a date."
          checked={dailyEligible}
          onChange={setDailyEligible}
        />
        <ToggleRow id="featured" label="Featured" checked={isFeatured} onChange={setIsFeatured} />
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          Save settings
        </Button>
        <SaveState status={saveStatus} error={saveError} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function HistoryTab({ entityId }: { entityId: string }) {
  const versions = useQuery({
    queryKey: ["admin", "journey", entityId, "versions"],
    queryFn: () => adminWorkflow.getVersions("journey", entityId),
  });

  const reviews = useQuery({
    queryKey: ["admin", "journey", entityId, "reviews"],
    queryFn: () => adminWorkflow.getReviewHistory("journey", entityId),
  });

  return (
    <div className="max-w-3xl space-y-8">
      <section>
        <h3 className="font-serif text-lg">Review history</h3>
        <div className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {reviews.isPending ? (
            <Skeleton className="m-5 h-12" />
          ) : (reviews.data?.length ?? 0) === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">No reviews recorded yet.</p>
          ) : (
            reviews.data?.map((log) => (
              <div key={log.id} className="px-5 py-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium capitalize">{log.decision.replace(/_/g, " ")}</span>
                  <time className="text-xs text-muted-foreground" dateTime={log.created_at}>
                    {new Date(log.created_at).toLocaleString()}
                  </time>
                </div>
                {log.notes && <p className="mt-1.5 text-muted-foreground">{log.notes}</p>}
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h3 className="font-serif text-lg">Versions</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Every significant edit snapshots the previous state, so published content is never
          silently overwritten.
        </p>
        <div className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {versions.isPending ? (
            <Skeleton className="m-5 h-12" />
          ) : (versions.data?.length ?? 0) === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">No previous versions yet.</p>
          ) : (
            versions.data?.map((version) => (
              <div
                key={version.id}
                className="flex items-center justify-between gap-4 px-5 py-4 text-sm"
              >
                <span>
                  <span className="font-medium tabular-nums">v{version.version}</span>
                  {version.change_summary && (
                    <span className="ml-2 text-muted-foreground">{version.change_summary}</span>
                  )}
                </span>
                <time
                  className="shrink-0 text-xs text-muted-foreground"
                  dateTime={version.created_at}
                >
                  {new Date(version.created_at).toLocaleDateString()}
                </time>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
