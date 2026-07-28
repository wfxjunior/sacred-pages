// TODO: Wire real notifications delivery (in-app, email, push). Mock only.

import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NOTIFICATIONS } from "@/lib/mock/notifications";

export function NotificationsMenu() {
  const unread = NOTIFICATIONS.filter((n) => !n.read).length;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/60 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background"
              style={{ background: "var(--gold)" }}
              aria-hidden
            />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <p className="text-[13px] font-semibold">Notifications</p>
          <button className="text-[11px] font-medium text-muted-foreground hover:text-foreground">
            Mark all read
          </button>
        </div>
        <ul className="max-h-[380px] divide-y divide-border/60 overflow-y-auto">
          {NOTIFICATIONS.slice(0, 5).map((n) => {
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