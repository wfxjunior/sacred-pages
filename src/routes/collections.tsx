import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CollectionCard } from "@/components/site/CollectionCard";
import { COLLECTIONS } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/collections")({
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

const FILTERS = ["All", "Jesus", "Psalms", "Proverbs", "Faith", "Prayer", "Family", "Women", "Men", "Purpose"];
const DIFFS = ["Any", "Gentle", "Balanced", "Challenging"];
const ACCESS = ["Any", "Free", "Premium"];

function CollectionsPage() {
  const [q, setQ] = useState("");
  const filtered = COLLECTIONS.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));
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
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search collections…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f, i) => (
              <button
                key={f}
                className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-wider transition ${
                  i === 0 ? "border-transparent bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <FilterGroup label="Difficulty" options={DIFFS} />
            <FilterGroup label="Access" options={ACCESS} />
            <FilterGroup label="Language" options={["Any", "English", "Português", "Español"]} />
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CollectionCard key={c.slug} c={c} />
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}

function FilterGroup({ label, options }: { label: string; options: string[] }) {
  return (
    <div className="flex items-center gap-2">
      <span className="uppercase tracking-wider" style={{ color: "var(--walnut)" }}>{label}:</span>
      <select className="rounded-md border border-border bg-background px-2 py-1 text-xs">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}