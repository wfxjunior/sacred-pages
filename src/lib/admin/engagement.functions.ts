import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Engagement metrics for Content Studio: how long readers actually spend in
// the app, per person and overall.
//
// journey_sessions is owner-only by RLS — as it should be — so the aggregate
// runs on the server with the service-role client, behind an explicit staff
// check. The privileged client is imported inside the handler (never at module
// top level) so it can never reach the browser bundle. No schema changes: this
// reads the columns the completion flow already writes.

export type ReaderEngagement = {
  userId: string;
  displayName: string | null;
  sessions: number;
  completedSessions: number;
  /** Mean elapsed time across that reader's completed sessions. */
  averageMs: number;
  totalMs: number;
  activeDays: number;
  lastActiveAt: string | null;
};

export type EngagementReport = {
  readers: ReaderEngagement[];
  /** Mean of the per-reader averages — the platform's typical visit. */
  averageMs: number;
  totalReaders: number;
};

type SessionRow = {
  user_id: string;
  status: string;
  elapsed_ms: number | null;
  last_active_at: string | null;
  started_at: string | null;
};

export const getEngagementReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<EngagementReport> => {
    // Authorization first: the caller's own client answers whether they are
    // editorial staff, so the service-role client is only ever reached after.
    const { data: isStaff, error: roleError } = await context.supabase.rpc("is_content_staff", {
      uid: context.userId,
    });
    if (roleError || !isStaff) {
      throw new Error("Forbidden: Content Studio access required");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: sessionRows, error } = await supabaseAdmin
      .from("journey_sessions")
      .select("user_id, status, elapsed_ms, last_active_at, started_at")
      .order("last_active_at", { ascending: false })
      .limit(5000);
    if (error) throw new Error(error.message);

    const rows = (sessionRows ?? []) as SessionRow[];
    const byUser = new Map<string, ReaderEngagement & { days: Set<string> }>();

    for (const row of rows) {
      let entry = byUser.get(row.user_id);
      if (!entry) {
        entry = {
          userId: row.user_id,
          displayName: null,
          sessions: 0,
          completedSessions: 0,
          averageMs: 0,
          totalMs: 0,
          activeDays: 0,
          lastActiveAt: null,
          days: new Set<string>(),
        };
        byUser.set(row.user_id, entry);
      }
      entry.sessions += 1;
      if (row.status === "completed" && row.elapsed_ms != null && row.elapsed_ms > 0) {
        entry.completedSessions += 1;
        entry.totalMs += row.elapsed_ms;
      }
      const stamp = row.last_active_at ?? row.started_at;
      if (stamp) {
        entry.days.add(stamp.slice(0, 10));
        if (!entry.lastActiveAt || stamp > entry.lastActiveAt) entry.lastActiveAt = stamp;
      }
    }

    const ids = [...byUser.keys()];
    if (ids.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, display_name")
        .in("id", ids);
      for (const profile of (profiles ?? []) as { id: string; display_name: string | null }[]) {
        const entry = byUser.get(profile.id);
        if (entry) entry.displayName = profile.display_name;
      }
    }

    const readers: ReaderEngagement[] = [...byUser.values()]
      .map(({ days, ...entry }) => ({
        ...entry,
        activeDays: days.size,
        averageMs:
          entry.completedSessions > 0 ? Math.round(entry.totalMs / entry.completedSessions) : 0,
      }))
      .sort((a, b) => b.averageMs - a.averageMs);

    const timed = readers.filter((reader) => reader.averageMs > 0);
    return {
      readers,
      averageMs:
        timed.length > 0
          ? Math.round(timed.reduce((sum, reader) => sum + reader.averageMs, 0) / timed.length)
          : 0,
      totalReaders: readers.length,
    };
  });
