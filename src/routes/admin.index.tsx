import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminDashboard } from "@/lib/content/admin-repository";
import { useAdminSession } from "@/lib/auth/useAdminSession";
import { LOCALES } from "@/lib/i18n";
import type { ContentStatus } from "@/lib/content/types";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Content Studio" },
      // Administrative surfaces must never be indexed.
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

const STAT_CARDS: {
  key: keyof Awaited<ReturnType<typeof adminDashboard.getCounts>>;
  label: string;
  status: ContentStatus;
}[] = [
  { key: "draft", label: "Drafts", status: "draft" },
  { key: "inReview", label: "Awaiting review", status: "in_review" },
  { key: "changesRequested", label: "Changes requested", status: "changes_requested" },
  { key: "approved", label: "Approved, unpublished", status: "approved" },
  { key: "scheduled", label: "Scheduled", status: "scheduled" },
  { key: "published", label: "Published", status: "published" },
];

function AdminDashboard() {
  const session = useAdminSession();
  const enabled = session.status === "ready";

  const counts = useQuery({
    queryKey: ["admin", "dashboard", "counts"],
    queryFn: () => adminDashboard.getCounts(),
    enabled,
  });

  const recent = useQuery({
    queryKey: ["admin", "dashboard", "recent"],
    queryFn: () => adminDashboard.getRecentlyEdited(),
    enabled,
  });

  const upcoming = useQuery({
    queryKey: ["admin", "dashboard", "upcoming-daily"],
    queryFn: () => adminDashboard.getUpcomingDailyJourneys(),
    enabled,
  });

  const gaps = useQuery({
    queryKey: ["admin", "dashboard", "translation-gaps"],
    queryFn: () => adminDashboard.getTranslationGaps(LOCALES.map((l) => l.code)),
    enabled,
  });

  return (
    <AdminShell
      title="Content Studio"
      description="Everything waiting on you, drawn live from the content database."
      actions={
        <>
          <Button asChild size="sm" variant="outline">
            <Link to="/admin/collections/new">New collection</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/admin/journeys/new">New journey</Link>
          </Button>
        </>
      }
    >
      <div className="space-y-10">
        <section aria-labelledby="pipeline-heading">
          <h2 id="pipeline-heading" className="font-serif text-lg">
            Editorial pipeline
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STAT_CARDS.map((card) => (
              <Link
                key={card.key}
                to="/admin/journeys"
                search={{ status: card.status }}
                className="rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-30px_rgba(43,43,43,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
              >
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {card.label}
                </p>
                {counts.isPending ? (
                  <Skeleton className="mt-3 h-9 w-14" />
                ) : counts.isError ? (
                  <p className="mt-3 text-sm text-muted-foreground">Unavailable</p>
                ) : (
                  <p className="mt-2 font-serif text-4xl tabular-nums">{counts.data[card.key]}</p>
                )}
              </Link>
            ))}
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <Panel
            title="Recently edited"
            emptyMessage="No journeys have been edited yet."
            isPending={recent.isPending}
            isError={recent.isError}
            items={recent.data ?? []}
            renderItem={(item) => (
              <Link
                key={item.id}
                to="/admin/journeys/$journeyId"
                params={{ journeyId: item.id }}
                className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm transition hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
              >
                <span className="min-w-0 truncate">{item.internal_title}</span>
                <StatusBadge status={item.status} />
              </Link>
            )}
          />

          <Panel
            title="Upcoming Daily Journeys"
            emptyMessage="Nothing scheduled. Assign journeys in the Daily Journey calendar."
            isPending={upcoming.isPending}
            isError={upcoming.isError}
            items={upcoming.data ?? []}
            renderItem={(item) => (
              <div
                key={`${item.journey_date}-${item.language_code}`}
                className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm"
              >
                <span className="min-w-0 truncate">
                  <span className="tabular-nums text-muted-foreground">{item.journey_date}</span>{" "}
                  <span className="uppercase text-muted-foreground">{item.language_code}</span>{" "}
                  {item.journeys?.internal_title ?? "—"}
                </span>
                {item.journeys && <StatusBadge status={item.journeys.status} />}
              </div>
            )}
          />
        </div>

        <Panel
          title="Translation gaps"
          emptyMessage="Every live journey is fully translated."
          isPending={gaps.isPending}
          isError={gaps.isError}
          items={gaps.data ?? []}
          renderItem={(item) => (
            <Link
              key={item.id}
              to="/admin/journeys/$journeyId"
              params={{ journeyId: item.id }}
              className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm transition hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
            >
              <span className="min-w-0 truncate">{item.internal_title}</span>
              <span className="shrink-0 text-xs" style={{ color: "#B4542F" }}>
                Missing: {item.missingLocales.map((l) => l.toUpperCase()).join(", ")}
              </span>
            </Link>
          )}
        />
      </div>
    </AdminShell>
  );
}

function Panel<T>({
  title,
  items,
  isPending,
  isError,
  emptyMessage,
  renderItem,
}: {
  title: string;
  items: readonly T[];
  isPending: boolean;
  isError: boolean;
  emptyMessage: string;
  renderItem: (item: T) => React.ReactNode;
}) {
  return (
    <section aria-label={title}>
      <h2 className="font-serif text-lg">{title}</h2>
      <div className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {isPending ? (
          <div className="space-y-3 p-5" aria-busy="true">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        ) : isError ? (
          <p className="p-5 text-sm text-muted-foreground">
            Could not load this list. Check that the content migrations have been applied.
          </p>
        ) : items.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          items.map(renderItem)
        )}
      </div>
    </section>
  );
}
