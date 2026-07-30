import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CollectionCard } from "@/components/site/CollectionCard";
import { useCatalogCollections } from "@/lib/content/catalog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, SlidersHorizontal, BookOpen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

const DIFFS = ["Any", "Gentle", "Balanced", "Challenging"] as const;
const ACCESS = ["Any", "Free", "Premium"] as const;
const LANGUAGES = ["Any", "English", "Português", "Español"] as const;

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  difficulty: z.enum(DIFFS).optional().catch(undefined),
  access: z.enum(ACCESS).optional().catch(undefined),
  language: z.enum(LANGUAGES).optional().catch(undefined),
});

type CollectionsSearch = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/collections")({
  validateSearch: (input: Record<string, unknown>): CollectionsSearch =>
    searchSchema.parse(input),
  head: () => ({
    meta: [
      { title: "Collections — Lumen Verse" },
      { name: "description", content: "A curated library of Bible journeys organized by people, books, and themes." },
      { property: "og:title", content: "Collections — Lumen Verse" },
      { property: "og:description", content: "Curated Bible journeys organized by people, books, and themes." },
    ],
  }),
  component: CollectionsPage,
});

const CATEGORY_FILTERS: { label: string; slug: string | null }[] = [
  { label: "All", slug: null },
  { label: "Jesus", slug: "life-of-jesus" },
  { label: "Psalms", slug: "psalms" },
  { label: "Proverbs", slug: "proverbs" },
  { label: "Faith", slug: "faith" },
  { label: "Prayer", slug: "prayer" },
  { label: "Family", slug: "family" },
  { label: "Women", slug: "women" },
  { label: "Men", slug: "men" },
  { label: "Purpose", slug: "purpose" },
];

function CollectionsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const q = search.q ?? "";
  const category = search.category ?? null;
  const difficulty = search.difficulty ?? "Any";
  const access = search.access ?? "Any";
  const language = search.language ?? "Any";

  const { data: collections, isLoading, isError } = useCatalogCollections();
  const loading = isLoading;
  // Local text state for a snappy input; debounced into the URL.
  const [qInput, setQInput] = useState(q);

  const updateSearch = (patch: Partial<CollectionsSearch>) => {
    navigate({
      search: (prev: CollectionsSearch) => {
        const next: CollectionsSearch = { ...prev, ...patch };
        // Drop empty/default values so URLs stay clean and shareable.
        if (!next.q) delete next.q;
        if (!next.category) delete next.category;
        if (!next.difficulty || next.difficulty === "Any") delete next.difficulty;
        if (!next.access || next.access === "Any") delete next.access;
        if (!next.language || next.language === "Any") delete next.language;
        return next;
      },
      replace: true,
    });
  };

  // Debounce text input into the URL.
  useEffect(() => {
    if (qInput === q) return;
    const t = setTimeout(() => updateSearch({ q: qInput || undefined }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput]);

  // Keep local input in sync when URL changes externally (back/forward, shared link).
  useEffect(() => {
    setQInput(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (collections ?? []).filter((c) => {
      if (query && !(`${c.title} ${c.description}`.toLowerCase().includes(query))) return false;
      if (category && c.slug !== category) return false;
      if (difficulty !== "Any" && c.difficulty !== difficulty) return false;
      if (access !== "Any" && c.access !== access) return false;
      if (language !== "Any" && !(c.languages ?? []).includes(language)) return false;
      return true;
    });
  }, [collections, q, category, difficulty, access, language]);

  // Category chips follow the published library instead of a hardcoded list.
  const categories = useMemo(
    () => [
      { label: "All", slug: null as string | null },
      ...(collections ?? []).map((c) => ({ label: c.title, slug: c.slug })),
    ],
    [collections],
  );

  const activeFilterCount =
    (category ? 1 : 0) +
    (difficulty !== "Any" ? 1 : 0) +
    (access !== "Any" ? 1 : 0) +
    (language !== "Any" ? 1 : 0);

  const clearAll = () => {
    setQInput("");
    navigate({ search: {} as CollectionsSearch, replace: true });
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>
          Library
        </p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">A living Scripture library</h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          Choose a theme, a book, or a person. Each collection is a slow walk through Scripture.
        </p>

        <div className="mt-10 flex flex-col gap-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Search collections…"
              className="pl-9 pr-9"
              aria-label="Search collections"
            />
            {q && (
              <button
                type="button"
                onClick={() => {
                  setQInput("");
                  updateSearch({ q: undefined });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]/50"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((f) => {
              const active = f.slug === category;
              return (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => updateSearch({ category: f.slug ?? undefined })}
                  aria-pressed={active}
                  className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-wider transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]/50 ${
                    active
                      ? "border-transparent bg-foreground text-background"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <FilterGroup label="Difficulty" value={difficulty} options={DIFFS} onChange={(v) => updateSearch({ difficulty: v as (typeof DIFFS)[number] })} />
            <FilterGroup label="Access" value={access} options={ACCESS} onChange={(v) => updateSearch({ access: v as (typeof ACCESS)[number] })} />
            <FilterGroup label="Language" value={language} options={LANGUAGES} onChange={(v) => updateSearch({ language: v as (typeof LANGUAGES)[number] })} />
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            {loading ? (
              <span className="inline-block h-4 w-40 animate-pulse rounded bg-[color:color-mix(in_oklab,var(--parchment)_55%,var(--card))]" />
            ) : (
              <>
                <span className="font-medium text-foreground">{filtered.length}</span>{" "}
                {filtered.length === 1 ? "collection" : "collections"}
                {(q || activeFilterCount > 0) && (
                  <>
                    {" "}· <span className="uppercase tracking-[0.16em] text-[color:var(--walnut)]">Filtered</span>
                  </>
                )}
              </>
            )}
          </p>
          {(q || activeFilterCount > 0) && !loading && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]/50"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-live="polite">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 || isError ? (
          <EmptyState hasQuery={!!q || activeFilterCount > 0} onClear={clearAll} />
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <CollectionCard key={c.slug} c={c} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function FilterGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="uppercase tracking-wider" style={{ color: "var(--walnut)" }}>{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]/50"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div
        className="aspect-[4/3] w-full animate-pulse"
        style={{
          background:
            "linear-gradient(110deg, color-mix(in oklab, var(--parchment) 55%, #FCFBF8) 0%, color-mix(in oklab, var(--parchment) 30%, #FCFBF8) 50%, color-mix(in oklab, var(--parchment) 55%, #FCFBF8) 100%)",
        }}
      />
      <div className="space-y-3 p-5">
        <div className="h-3 w-3/4 animate-pulse rounded bg-[color:color-mix(in_oklab,var(--parchment)_55%,var(--card))]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[color:color-mix(in_oklab,var(--parchment)_55%,var(--card))]" />
        <div className="h-1 w-full animate-pulse rounded-full bg-[color:color-mix(in_oklab,var(--parchment)_45%,var(--card))]" />
      </div>
    </div>
  );
}

function EmptyState({ hasQuery, onClear }: { hasQuery: boolean; onClear: () => void }) {
  return (
    <div
      className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-20 text-center"
      style={{
        background:
          "linear-gradient(160deg, color-mix(in oklab, var(--parchment) 40%, var(--card)) 0%, var(--card) 100%)",
      }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: "color-mix(in oklab, var(--parchment) 60%, var(--card))" }}
      >
        <BookOpen className="h-6 w-6" style={{ color: "var(--walnut)" }} aria-hidden />
      </div>
      <h2 className="mt-5 font-serif text-2xl">No collections match</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {hasQuery
          ? "Try loosening a filter or clearing your search. The library keeps growing — your next journey is close."
          : "Nothing here yet. Check back soon — new collections are added regularly."}
      </p>
      {hasQuery && (
        <Button variant="outline" className="mt-6" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  );
}