// TODO: Wire real notifications delivery (in-app, email, push). Mock only.

import { Link } from "@tanstack/react-router";
import { Bell, BellOff, Settings2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NOTIFICATIONS } from "@/lib/mock/notifications";
import { isCategoryVisible, useNotifPrefs } from "@/lib/notification-preferences";

export function NotificationsMenu({
  variant = "default",
}: {
  variant?: "default" | "light";
}) {
  const { prefs } = useNotifPrefs();
  const visible = NOTIFICATIONS.filter((n) => isCategoryVisible(prefs, n.kind));
  const unread = visible.filter((n) => !n.read).length;
  const paused = prefs.pauseAll;
  const isLight = variant === "light";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={paused ? "Notifications paused" : `Notifications${unread ? `, ${unread} unread` : ""}`}
          className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 ${
            isLight
              ? "border-white/20 bg-white/10 text-white/80 hover:text-white focus-visible:ring-white/60"
              : "border-border/60 bg-card/60 text-muted-foreground hover:text-foreground focus-visible:ring-primary"
          }`}
        >
          {paused ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          {!paused && unread > 0 && (
            <span
              className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ${
                isLight ? "ring-zinc-950/60" : "ring-background"
              }`}
              style={{ background: "var(--gold)" }}
              aria-hidden
            />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold">Notifications</p>
            {paused && (
              <p className="text-[10.5px]" style={{ color: "var(--walnut)" }}>All paused · resume in preferences</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Link
              to="/notifications/preferences"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Notification preferences"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </Link>
            <button className="rounded-full px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground">
              Mark all read
            </button>
          </div>
        </div>
        {visible.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <BellOff className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-2 text-[13px] font-medium">A quiet inbox</p>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              {paused ? "You paused all notifications." : "No categories are turned on right now."}
            </p>
            <Link
              to="/notifications/preferences"
              className="mt-3 inline-block text-[11.5px] font-medium underline decoration-dotted"
              style={{ color: "var(--gold)" }}
            >
              Adjust preferences
            </Link>
          </div>
        ) : (
        <ul className="max-h-[380px] divide-y divide-border/60 overflow-y-auto">
          {visible.slice(0, 5).map((n) => {
            const Icon = n.icon;
            return (
              <li key={n.id} className={`flex gap-3 px-4 py-3 ${n.read ? "opacity-70" : ""}`}>
                <span
                  className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `color-mix(in oklab, ${n.accent} 14%, transparent)`, color: n.accent }}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.6} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{n.title}</p>
                  <p className="line-clamp-2 text-[12px] text-muted-foreground">{n.body}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">{n.time}</p>
                </div>
                {!n.read && (
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--gold)" }} aria-hidden />
                )}
              </li>
            );
          })}
        </ul>
        )}
        <div className="border-t border-border/60 p-2">
          <Link
            to="/notifications"
            className="block rounded-lg px-3 py-2 text-center text-[13px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            Open notification center
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}