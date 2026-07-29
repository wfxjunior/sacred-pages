import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge, TranslationStatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminJourneys } from "@/lib/content/admin-repository";
import { useAdminSession } from "@/lib/auth/useAdminSession";
import { LOCALES } from "@/lib/i18n";
import { CONTENT_STATUSES, type ContentStatus, type TranslationStatus } from "@/lib/content/types";

type JourneySearch = { status?: ContentStatus };

export const Route = createFileRoute("/admin/journeys/")({
  validateSearch: (search: Record<string, unknown>): JourneySearch => ({
    status: CONTENT_STATUSES.includes(search.status as ContentStatus)
      ? (search.status as ContentStatus)
      : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Journeys — Content Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminJourneysList,
});

const PAGE_SIZE = 25;

function AdminJourneysList() {
  const session = useAdminSession();
  const { status } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const journeys = useQuery({
    queryKey: ["admin", "journeys", { status, search, page }],
    queryFn: () =>
      adminJourneys.list({
        status,
        search: search || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    enabled: session.status === "ready",
  });

  const totalPages = journeys.data ? Math.ceil(journeys.data.total / PAGE_SIZE) : 0;

  return (
    <AdminShell
      title="Journeys"
      description="Each journey is one daily unit: Scripture, devotional, word search, reflection and prayer."
      actions={
        <Button asChild size="sm">
          <Link to="/admin/journeys/new">New journey</Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <div className="min-w-[16rem] flex-1">
            <label htmlFor="journey-search" className="sr-only">
              Search journeys
            </label>
            <Input
              id="journey-search"
              type="search"
              placeholder="Search by title or slug…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <div className="w-48">
            <label htmlFor="journey-status" className="sr-only">
              Filter by status
            </label>
            <Select
              value={status ?? "all"}
              onValueChange={(value) => {
                setPage(0);
                void navigate({
                  search: value === "all" ? {} : { status: value as ContentStatus },
                });
              }}
            >
              <SelectTrigger id="journey-status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {CONTENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {journeys.isPending ? (
          <div className="space-y-3" aria-busy="true">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : journeys.isError ? (
          <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Could not load journeys. Confirm the content migrations have been applied.
          </p>
        ) : journeys.data.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
            <p className="font-serif text-lg">No journeys found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {status || search
                ? "Try a different filter."
                : "Create the first journey to get started."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <table className="w-full text-sm">
                <caption className="sr-only">Journeys with status and translation coverage</caption>
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th scope="col" className="px-5 py-3 font-medium">
                      Title
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Status
                    </th>
                    <th scope="col" className="hidden px-5 py-3 font-medium md:table-cell">
                      Translations
                    </th>
                    <th scope="col" className="hidden px-5 py-3 font-medium sm:table-cell">
                      Difficulty
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {journeys.data.items.map((journey) => {
                    const byLocale = new Map<string, TranslationStatus>(
                      journey.journey_translations.map((t) => [t.language_code, t.status]),
                    );
                    return (
                      <tr key={journey.id} className="transition hover:bg-secondary/40">
                        <td className="px-5 py-4">
                          <Link
                            to="/admin/journeys/$journeyId"
                            params={{ journeyId: journey.id }}
                            className="font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                          >
                            {journey.internal_title}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            /{journey.slug} · v{journey.current_version}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={journey.status} />
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
                          {journey.difficulty}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <nav className="flex items-center justify-between" aria-label="Pagination">
                <p className="text-xs text-muted-foreground">
                  Page {page + 1} of {totalPages} · {journeys.data.total} journeys
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </nav>
            )}
          </>
        )}
      </div>
    </AdminShell>
  );
}
