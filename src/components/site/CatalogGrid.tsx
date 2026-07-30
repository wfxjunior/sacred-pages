import { CollectionCard } from "@/components/site/CollectionCard";
import { useCatalogCollections } from "@/lib/content/catalog";

/** Published collections from the library, rendered with the existing card. */
export function CatalogGrid({
  limit,
  offset = 0,
  className = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
}: {
  limit?: number;
  offset?: number;
  className?: string;
}) {
  const { data, isLoading } = useCatalogCollections();
  const items = (data ?? []).slice(offset, limit ? offset + limit : undefined);

  if (isLoading) {
    return (
      <div className={className} aria-busy="true">
        {Array.from({ length: limit ?? 3 }).map((_, i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-xl border border-border bg-[color:color-mix(in_oklab,var(--parchment)_45%,var(--card))]"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className={className}>
      {items.map((c) => (
        <CollectionCard key={c.slug} c={c} />
      ))}
    </div>
  );
}