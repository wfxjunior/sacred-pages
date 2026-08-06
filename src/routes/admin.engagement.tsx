import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Clock, Users } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminGate } from "@/components/admin/AdminGate";
import { useAdminSession } from "@/lib/auth/useAdminSession";
import { getEngagementReport } from "@/lib/admin/engagement.functions";
import { formatDuration } from "@/lib/puzzle/best-times";

// Time in the Word: how long each reader actually spends, and the platform's
// typical visit. Reads completed journey sessions — the same rows the
// completion flow writes — aggregated server-side behind a staff check.

export const Route = createFileRoute("/admin/engagement")({
  head: () => ({ meta: [{ title: "Engagement — Content Studio" }] }),
  component: EngagementPage,
});

function EngagementPage() {
  const session = useAdminSession();
  const fetchReport = useServerFn(getEngagementReport);
  const report = useQuery({
    queryKey: ["admin", "engagement"],
    enabled: session.status === "ready",
    staleTime: 60_000,
    queryFn: () => fetchReport({}),
  });

  const data = report.data;

  return (
    <AdminShell
      title="Engagement"
      description="Average time each reader spends in the Word, from completed journeys."
    >
      <AdminGate session={session}>
        {report.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : report.isError ? (
          <p className="text-sm text-destructive">
            Could not load engagement data. Content Studio access is required.
          </p>
        ) : !data || data.readers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No completed journeys yet — averages appear once readers finish their first.
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Tile
                icon={<Clock className="h-4 w-4" style={{ color: "var(--gold)" }} aria-hidden />}
                label="Average visit"
                value={data.averageMs > 0 ? formatDuration(data.averageMs) : "—"}
                hint="mean of per-reader averages"
              />
              <Tile
                icon={<Users className="h-4 w-4" style={{ color: "var(--gold)" }} aria-hidden />}
                label="Readers with sessions"
                value={`${data.totalReaders}`}
              />
              <Tile
                label="Journeys completed"
                value={`${data.readers.reduce((sum, r) => sum + r.completedSessions, 0)}`}
              />
            </div>

            <div className="mt-8 overflow-x-auto rounded-xl border border-border/60 bg-card">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border/60 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Reader
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Average time
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Total time
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Completed
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Active days
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Last seen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.readers.map((reader) => (
                    <tr key={reader.userId}>
                      <td className="px-5 py-3">
                        <span className="font-medium">{reader.displayName ?? "—"}</span>
                        <span className="ml-2 text-[11px] text-muted-foreground">
                          {reader.userId.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-5 py-3 tabular-nums">
                        {reader.averageMs > 0 ? formatDuration(reader.averageMs) : "—"}
                      </td>
                      <td className="px-5 py-3 tabular-nums">
                        {reader.totalMs > 0 ? formatDuration(reader.totalMs) : "—"}
                      </td>
                      <td className="px-5 py-3 tabular-nums">{reader.completedSessions}</td>
                      <td className="px-5 py-3 tabular-nums">{reader.activeDays}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {reader.lastActiveAt ? reader.lastActiveAt.slice(0, 10) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </AdminGate>
    </AdminShell>
  );
}

function Tile({
  icon,
  label,
  value,
  hint,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-2 font-serif text-3xl tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
