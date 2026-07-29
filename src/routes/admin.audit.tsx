import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminAudit } from "@/lib/content/admin-repository";
import { useAdminSession } from "@/lib/auth/useAdminSession";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({
    meta: [
      { title: "Audit log — Content Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuditLog,
});

const PAGE_SIZE = 50;

function AuditLog() {
  const session = useAdminSession();
  const [page, setPage] = useState(0);

  const logs = useQuery({
    queryKey: ["admin", "audit", page],
    queryFn: () => adminAudit.list({ limit: PAGE_SIZE, offset: page * PAGE_SIZE }),
    enabled: session.status === "ready",
  });

  const totalPages = logs.data ? Math.ceil(logs.data.total / PAGE_SIZE) : 0;

  return (
    <AdminShell
      title="Audit log"
      description="Every administrative action, written by database triggers and never editable."
    >
      {logs.isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : logs.isError ? (
        <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Could not load the audit log. Only publication and support admins may read it.
        </p>
      ) : logs.data.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No administrative actions recorded yet.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <caption className="sr-only">Administrative action history</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="px-5 py-3 font-medium">
                    When
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Action
                  </th>
                  <th scope="col" className="hidden px-5 py-3 font-medium sm:table-cell">
                    Entity
                  </th>
                  <th scope="col" className="hidden px-5 py-3 font-medium md:table-cell">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.data.items.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap px-5 py-3 text-xs text-muted-foreground">
                      <time dateTime={log.created_at}>
                        {new Date(log.created_at).toLocaleString()}
                      </time>
                    </td>
                    <td className="px-5 py-3 capitalize">{log.action.replace(/_/g, " ")}</td>
                    <td className="hidden px-5 py-3 capitalize text-muted-foreground sm:table-cell">
                      {log.entity_type.replace(/_/g, " ")}
                    </td>
                    <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">
                      {log.previous_status && log.new_status
                        ? `${log.previous_status} to ${log.new_status}`
                        : (log.summary ?? "-")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav className="flex items-center justify-between" aria-label="Pagination">
              <p className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
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
        </div>
      )}
    </AdminShell>
  );
}
