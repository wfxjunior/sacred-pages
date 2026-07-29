import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge, TranslationStatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { adminCollections } from "@/lib/content/admin-repository";
import { useAdminSession } from "@/lib/auth/useAdminSession";
import { LOCALES } from "@/lib/i18n";
import type { TranslationStatus } from "@/lib/content/types";

export const Route = createFileRoute("/admin/collections/")({
  head: () => ({
    meta: [
      { title: "Collections — Content Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminCollectionsList,
});

function AdminCollectionsList() {
  const session = useAdminSession();
  const [search, setSearch] = useState("");

  const collections = useQuery({
    queryKey: ["admin", "collections", { search }],
    queryFn: () => adminCollections.list({ search: search || undefined }),
    enabled: session.status === "ready",
  });

  return (
    <AdminShell
      title="Collections"
      description="Curated groupings of journeys. A journey always belongs to one primary collection."
      actions={
        <Button asChild size="sm">
          <Link to="/admin/collections/new">New collection</Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="max-w-sm">
          <label htmlFor="collection-search" className="sr-only">
            Search collections
          </label>
          <Input
            id="collection-search"
            type="search"
            placeholder="Search by name or slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {collections.isPending ? (
          <div className="space-y-3" aria-busy="true">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : collections.isError ? (
          <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Could not load collections. Confirm the content migrations have been applied to your
            Supabase project.
          </p>
        ) : collections.data.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
            <p className="font-serif text-lg">No collections yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Create the first collection to start building the library.
            </p>
            <Button asChild size="sm" className="mt-5">
              <Link to="/admin/collections/new">New collection</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Collections, showing status and translation coverage
              </caption>
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="px-5 py-3 font-medium">
                    Name
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Status
                  </th>
                  <th scope="col" className="hidden px-5 py-3 font-medium md:table-cell">
                    Translations
                  </th>
                  <th scope="col" className="hidden px-5 py-3 font-medium sm:table-cell">
                    Access
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {collections.data.items.map((collection) => {
                  const byLocale = new Map<string, TranslationStatus>(
                    collection.collection_translations.map((t) => [t.language_code, t.status]),
                  );
                  return (
                    <tr key={collection.id} className="transition hover:bg-secondary/40">
                      <td className="px-5 py-4">
                        <Link
                          to="/admin/collections/$collectionId"
                          params={{ collectionId: collection.id }}
                          className="font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                        >
                          {collection.internal_name}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted-foreground">/{collection.slug}</p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={collection.status} />
                      </td>
                      <td className="hidden px-5 py-4 md:table-cell">
                        <div className="flex flex-wrap gap-1.5">
                          {LOCALES.map((locale) => (
                            <TranslationStatusBadge
                              key={locale.code}
                              languageCode={locale.code}
                              status={byLocale.get(locale.code) ?? "missing"}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="hidden px-5 py-4 capitalize text-muted-foreground sm:table-cell">
                        {collection.access_level}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
