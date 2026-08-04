import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { listMyCompanions } from "@/lib/together/companions.service";
import type { CompanionshipWithProfiles } from "@/lib/together/types";

// Who can see this reader's journey — and who could, once. Presence here is a
// consequence of an accepted invitation, never something set on this screen.

type AccessPerson = {
  id: string;
  name: string;
  email: string | null;
  relationship: string;
  avatarUrl: string | null;
  state: "active" | "pending" | "past";
};

const TINTS = ["var(--gold)", "var(--sage, #78866B)", "#5E7FA3", "#B76E79", "#6E5847"];

function toPerson(row: CompanionshipWithProfiles, userId: string): AccessPerson {
  const iAmInviter = row.inviter_id === userId;
  const other = iAmInviter ? row.invitee : row.inviter;
  const email = (iAmInviter ? row.invitee_email : other?.email) ?? null;
  const name = other?.display_name ?? email?.split("@")[0] ?? "—";
  const state: AccessPerson["state"] =
    row.status === "active" ? "active" : row.status === "pending" ? "pending" : "past";
  return {
    id: row.id,
    name,
    email,
    relationship: row.relationship,
    avatarUrl: other?.avatar_url ?? null,
    state,
  };
}

export function AccessCircle({ userId, email }: { userId: string | null; email: string | null }) {
  const { t } = useI18n();
  const [people, setPeople] = useState<AccessPerson[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!userId || !isSupabaseConfigured()) {
        if (!cancelled) setPeople([]);
        return;
      }
      try {
        const rows = await listMyCompanions(getSupabaseClient(), userId, email ?? "");
        if (cancelled) return;
        setPeople(rows.map((row) => toPerson(row, userId)));
      } catch {
        if (!cancelled) setPeople([]);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [userId, email]);

  const current = (people ?? []).filter((p) => p.state !== "past");
  const past = (people ?? []).filter((p) => p.state === "past");

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--walnut)" }}>
            {t("profile.access.eyebrow")}
          </p>
          <h2 className="mt-1 font-serif text-2xl md:text-3xl">{t("profile.access.title")}</h2>
          <p className="mt-1 max-w-xl text-[13px] text-muted-foreground">{t("profile.access.hint")}</p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/together">
            <Users className="mr-1.5 h-4 w-4" /> {t("profile.access.manage")}
          </Link>
        </Button>
      </div>

      {people === null ? (
        <p className="mt-6 text-sm text-muted-foreground">{t("ui.loading")}</p>
      ) : people.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-card/60 p-6 text-center">
          <p className="text-[13px] text-muted-foreground">{t("profile.access.empty")}</p>
          <Button asChild className="mt-4 h-12 w-full rounded-full sm:h-10 sm:w-auto">
            <Link to="/together">{t("profile.access.invite")}</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          <PeopleRow people={current} emptyLabel={t("profile.access.noneCurrent")} />
          {past.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {t("profile.access.past")}
              </p>
              <div className="mt-3">
                <PeopleRow people={past} emptyLabel="" muted />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function PeopleRow({
  people,
  emptyLabel,
  muted,
}: {
  people: AccessPerson[];
  emptyLabel: string;
  muted?: boolean;
}) {
  const { t } = useI18n();
  if (people.length === 0) {
    return emptyLabel ? <p className="text-sm text-muted-foreground">{emptyLabel}</p> : null;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {people.map((p, i) => (
        <li
          key={p.id}
          className={`flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 ${muted ? "opacity-70" : ""}`}
        >
          <span
            className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full text-[14px] font-medium text-white"
            style={{ background: TINTS[i % TINTS.length] }}
          >
            {p.avatarUrl ? (
              <img src={p.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              p.name.charAt(0).toUpperCase()
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-medium">{p.name}</p>
            <p className="truncate text-[12px] text-muted-foreground">
              {p.relationship}
              {p.email ? ` · ${p.email}` : ""}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {t(`profile.access.state.${p.state}`)}
          </span>
        </li>
      ))}
    </ul>
  );
}
