import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { adminWorkflow } from "@/lib/content/admin-repository";
import { useAdminSession } from "@/lib/auth/useAdminSession";

export const Route = createFileRoute("/admin/review")({
  head: () => ({
    meta: [
      { title: "Review queue — Content Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ReviewQueue,
});

function ReviewQueue() {
  const session = useAdminSession();
  const queue = useQuery({
    queryKey: ["admin", "review-queue"],
    queryFn: () => adminWorkflow.listReviewQueue(),
    enabled: session.status === "ready",
  });

  const canReview =
    session.capabilities.includes("review") || session.capabilities.includes("super");

  return (
    <AdminShell
      title="Review queue"
      description="Content waiting on an editorial decision, oldest first."
    >
      {!canReview && (
        <p className="mb-6 rounded-xl border border-border/60 bg-secondary/30 p-4 text-sm text-muted-foreground">
          You can see the queue, but only reviewers may approve or request changes.
        </p>
      )}

      {queue.isPending ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : queue.isError ? (
        <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Could not load the review queue.
        </p>
      ) : (queue.data?.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
          <p className="font-serif text-lg">Nothing waiting for review</p>
          <p className="mt-2 text-sm text-muted-foreground">The queue is clear.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {queue.data?.map((item) => (
            <li key={item.id}>
              <Link
                to="/admin/journeys/$journeyId"
                params={{ journeyId: item.id }}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm transition hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{item.internal_title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Updated {new Date(item.updated_at).toLocaleDateString()}
                  </span>
                </span>
                <StatusBadge status={item.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
