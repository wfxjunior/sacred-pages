// TODO: Backend delivery for notifications (in-app, email, push). Mock display only.

import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { NOTIFICATIONS } from "@/lib/mock/notifications";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { isCategoryVisible, useNotifPrefs } from "@/lib/notification-preferences";
import { Settings2, BellOff } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const FILTER_KEYS = ["all", "unread", "daily", "companion", "milestone", "collection"] as const;

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
  const { t } = useI18n();
  const [filter, setFilter] = useState<(typeof FILTER_KEYS)[number]>("all");
  const { prefs } = useNotifPrefs();
  const allowed = useMemo(
    () => NOTIFICATIONS.filter((n) => isCategoryVisible(prefs, n.kind)),
    [prefs]
  );
  const items = useMemo(() => {
    if (filter === "all") return allowed;
    if (filter === "unread") return allowed.filter((n) => !n.read);
    return allowed.filter((n) => n.kind === filter);
  }, [filter, allowed]);
  const hiddenCount = NOTIFICATIONS.length - allowed.length;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--walnut)" }}>{t("notif.center")}</p>
            <h1 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">{t("notif.title")}</h1>
            <p className="mt-2 max-w-lg text-[14px] text-muted-foreground">{t("notif.sub")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/notifications/preferences"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Settings2 className="h-3.5 w-3.5" /> {t("ui.preferences")}
            </Link>
            <Button variant="outline" className="rounded-full">{t("ui.markAllRead")}</Button>
          </div>
        </div>
        {(prefs.pauseAll || hiddenCount > 0) && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-border/60 bg-background/40 px-4 py-2.5 text-[12px] text-muted-foreground">
            <BellOff className="h-3.5 w-3.5" style={{ color: "var(--walnut)" }} />
            {prefs.pauseAll ? (
              <span>{t("notif.paused")}</span>
            ) : (
              <span>{hiddenCount} {t("notif.hiddenSuffix")}</span>
            )}
            <Link to="/notifications/preferences" className="ml-auto underline decoration-dotted" style={{ color: "var(--gold)" }}>
              {t("notif.adjust")}
            </Link>
          </div>
        )}
        <div className="mt-8 flex flex-wrap gap-2">
          {FILTER_KEYS.map((key) => {
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-full border px-3 py-1.5 text-[12px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active ? "border-primary bg-primary/10 text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(`notif.filter.${key}`)}
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
            <li className="p-10 text-center text-[13px] text-muted-foreground">{t("notif.empty")}</li>
          )}
        </ul>
      </div>
    </AppShell>
  );
}