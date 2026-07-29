import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { TranslationStatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminJourneys } from "@/lib/content/admin-repository";
import { useAdminSession } from "@/lib/auth/useAdminSession";
import { LOCALES, type Locale } from "@/lib/i18n";
import type { TranslationStatus } from "@/lib/content/types";

export const Route = createFileRoute("/admin/translations")({
  head: () => ({
    meta: [
      { title: "Translations — Content Studio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: TranslationsOverview,
});

function TranslationsOverview() {
  const session = useAdminSession();
  const [target, setTarget] = useState<Locale>("pt");

  const journeys = useQuery({
    queryKey: ["admin", "journeys", "translations"],
    queryFn: () => adminJourneys.list({ limit: 200 }),
    enabled: session.status === "ready",
  });

  const rows = useMemo(() => {
    return (journeys.data?.items ?? []).map((journey) => {
      const byLocale = new Map<string, TranslationStatus>(
        journey.journey_translations.map((t) => [t.language_code, t.status]),
      );
      const sourceStatus = byLocale.get("en") ?? "missing";
      const targetStatus = byLocale.get(target) ?? "missing";
      return { journey, sourceStatus, targetStatus };
    });
  }, [journeys.data, target]);

  const completion = useMemo(() => {
    if (rows.length === 0) return 0;
    const done = rows.filter((r) => r.targetStatus === "published").length;
    return Math.round((done / rows.length) * 100);
  }, [rows]);

  return (
    <AdminShell
      title="Translations"
      description="English is the source of truth. Nothing is auto-translated — every locale needs human review."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <label htmlFor="target-locale" className="text-sm font-medium">
              Target language
            </label>
            <div className="mt-1.5 w-48">
              <Select value={target} onValueChange={(v) => setTarget(v as Locale)}>
                <SelectTrigger id="target-locale">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCALES.filter((l) => l.code !== "en").map((l) => (
                    <SelectItem key={l.code} value={l.code}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="min-w-[14rem] flex-1">
            <p className="text-sm font-medium">
              {target.toUpperCase()} coverage: <span className="tabular-nums">{completion}%</span>
            </p>
            <Progress
              value={completion}
              className="mt-2"
              aria-label={`${target} translation coverage`}
            />
          </div>
        </div>

        {journeys.isPending ? (
          <Skeleton className="h-64 w-full" />
        ) : rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No journeys yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Translation status per journey, English source beside {target.toUpperCase()}
              </caption>
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="px-5 py-3 font-medium">
                    Journey
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    English source
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    {target.toUpperCase()}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map(({ journey, sourceStatus, targetStatus }) => (
                  <tr key={journey.id} className="transition hover:bg-secondary/40">
                    <td className="px-5 py-4">
                      <Link
                        to="/admin/journeys/$journeyId"
                        params={{ journeyId: journey.id }}
                        className="font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                      >
                        {journey.internal_title}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <TranslationStatusBadge languageCode="en" status={sourceStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <TranslationStatusBadge languageCode={target} status={targetStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
