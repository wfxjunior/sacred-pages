import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { CollectionCard } from "@/components/site/CollectionCard";
import { COLLECTIONS } from "@/lib/mock-data";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Favorites — Lumen Verse" },
      { name: "description", content: "Journeys and passages you've saved to return to." },
      { property: "og:title", content: "Favorites — Lumen Verse" },
      { property: "og:description", content: "Your saved Scripture journeys and collections." },
    ],
  }),
  component: Favorites,
});

function Favorites() {
  const saved = COLLECTIONS.slice(0, 3);
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>Favorites</p>
          <h1 className="mt-2 font-serif text-4xl">Return to what moved you.</h1>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((c) => <CollectionCard key={c.slug} c={c} />)}
        </div>
      </div>
    </AppShell>
  );
}