// TODO: Backend delivery for notifications (in-app, email, push). Mock display only.

import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { NOTIFICATIONS } from "@/lib/mock/notifications";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "daily", label: "Daily" },
  { key: "companion", label: "Companions" },
  { key: "milestone", label: "Milestones" },
  { key: "collection", label: "Collections" },
] as const;

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Jornadas da Palavra" },
      { name: "description", content: "A quiet place to catch up — daily journeys, companions, and milestones." },
      { property: "og:title", content: "Notifications — Jornadas da Palavra" },
      { property: "og:description", content: "A quiet notification center." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const items = useMemo(() => {
    if (filter === "all") return NOTIFICATIONS;
    if (filter === "unread") return NOTIFICATIONS.filter((n) => !n.read);
    return NOTIFICATIONS.filter((n) => n.kind === filter);
  }, [filter]);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--walnut)" }}>Notification center</p>
            <h1 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">Quiet updates</h1>
            <p className="mt-2 max-w-lg text-[14px] text-muted-foreground">
              We keep things few and meaningful. You can turn each type on or off in Settings.
            </p>
          </div>
          <Button variant="outline" className="rounded-full">Mark all read</Button>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full border px-3 py-1.5 text-[12px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active ? "border-primary bg-primary/10 text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <ul className="mt-6 divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
          {items.map((n) => {
            const Icon = n.icon;
            return (
              <li key={n.id} className={`flex gap-4 p-5 ${n.read ? "opacity-80" : ""}`}>
                <span
                  className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `color-mix(in oklab, ${n.accent} 14%, transparent)`, color: n.accent }}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.6} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[14px] font-medium">{n.title}</p>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--gold)" }} aria-hidden />}
                  </div>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{n.time}</p>
                </div>
              </li>
            );
          })}
          {items.length === 0 && (
            <li className="p-10 text-center text-[13px] text-muted-foreground">Nothing here — a quiet inbox.</li>
          )}
        </ul>
      </div>
    </AppShell>
  );
}