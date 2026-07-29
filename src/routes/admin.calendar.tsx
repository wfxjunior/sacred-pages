import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminDailyJourney, adminJourneys } from "@/lib/content/admin-repository";
import { useAdminSession } from "@/lib/auth/useAdminSession";
import { LOCALES, type Locale } from "@/lib/i18n";
import { isAppError } from "@/lib/errors";

export const Route = createFileRoute("/admin/calendar")({
  head: () => ({
    meta: [
      { title: "Daily Journey — Content Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DailyJourneyCalendar,
});

const DAYS_AHEAD = 21;

function DailyJourneyCalendar() {
  const session = useAdminSession();
  const queryClient = useQueryClient();
  const [locale, setLocale] = useState<Locale>("en");
  const [error, setError] = useState<string | null>(null);

  const range = useMemo(() => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + DAYS_AHEAD);
    return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
  }, []);

  const assignments = useQuery({
    queryKey: ["admin", "daily-journeys", range.from, range.to],
    queryFn: () => adminDailyJourney.listRange(range.from, range.to),
    enabled: session.status === "ready",
  });

  const eligible = useQuery({
    queryKey: ["admin", "journeys", "daily-eligible"],
    queryFn: () => adminJourneys.list({ status: "published", limit: 200 }),
    enabled: session.status === "ready",
  });

  const assign = useMutation({
    mutationFn: (input: { journeyDate: string; journeyId: string }) =>
      adminDailyJourney.assign({
        journeyDate: input.journeyDate,
        languageCode: locale,
        journeyId: input.journeyId,
        isFallback: false,
      }),
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "daily-journeys"] });
    },
    onError: (err) =>
      setError(isAppError(err) ? err.message : "Could not assign this Daily Journey"),
  });

  const days = useMemo(() => {
    const result: string[] = [];
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      result.push(date.toISOString().slice(0, 10));
    }
    return result;
  }, []);

  const byDate = useMemo(() => {
    const map = new Map<string, NonNullable<typeof assignments.data>[number]>();
    for (const row of assignments.data ?? []) {
      if (row.language_code === locale) map.set(row.journey_date, row);
    }
    return map;
  }, [assignments.data, locale]);

  const canPublish =
    session.capabilities.includes("publish") || session.capabilities.includes("super");

  return (
    <AdminShell
      title="Daily Journey"
      description="One journey per date per language. Assignments are stored in UTC and are invisible to readers until their date arrives."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="calendar-locale" className="text-sm font-medium">
            Language
          </label>
          <div className="w-44">
            <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
              <SelectTrigger id="calendar-locale">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!canPublish && (
          <p className="rounded-xl border border-border/60 bg-secondary/30 p-4 text-sm text-muted-foreground">
            Only publication admins can change Daily Journey assignments.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-xl border p-4 text-sm"
            style={{
              borderColor: "color-mix(in oklab, #B4542F 40%, transparent)",
              color: "#B4542F",
            }}
          >
            {error}
          </p>
        )}

        {assignments.isPending ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {days.map((date) => {
              const assignment = byDate.get(date);
              const isToday = date === new Date().toISOString().slice(0, 10);
              return (
                <li key={date} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className="w-28 shrink-0">
                    <p className="text-sm font-medium tabular-nums">{date}</p>
                    {isToday && (
                      <p
                        className="text-[11px] uppercase tracking-wider"
                        style={{ color: "var(--gold)" }}
                      >
                        Today
                      </p>
                    )}
                  </div>

                  <div className="min-w-[14rem] flex-1">
                    {assignment ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm">
                          {assignment.journeys?.internal_title ?? "—"}
                        </span>
                        {assignment.journeys && <StatusBadge status={assignment.journeys.status} />}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not assigned</span>
                    )}
                  </div>

                  {canPublish && (
                    <div className="w-64 shrink-0">
                      <label htmlFor={`assign-${date}`} className="sr-only">
                        Assign a journey to {date}
                      </label>
                      <Select
                        value={assignment?.journey_id ?? ""}
                        onValueChange={(journeyId) =>
                          assign.mutate({ journeyDate: date, journeyId })
                        }
                      >
                        <SelectTrigger id={`assign-${date}`}>
                          <SelectValue placeholder="Assign journey…" />
                        </SelectTrigger>
                        <SelectContent>
                          {(eligible.data?.items ?? []).map((journey) => (
                            <SelectItem key={journey.id} value={journey.id}>
                              {journey.internal_title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
