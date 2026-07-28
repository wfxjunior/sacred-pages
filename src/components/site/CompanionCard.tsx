import type { Companion } from "@/lib/mock/companions";
import { Lock } from "lucide-react";

export function CompanionCard({ c }: { c: Companion }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[14px] font-medium text-white"
          style={{ background: c.color }}
        >
          {c.name[0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium">{c.name}</p>
          <p className="text-[12px] text-muted-foreground">{c.relationship}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          <Lock className="h-3 w-3" /> Private
        </span>
      </div>
      {c.journey && (
        <div className="mt-5 rounded-xl border border-border/60 bg-background/60 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Active journey</p>
          <p className="mt-1 font-serif text-[15px] leading-snug">{c.journey}</p>
          {c.reference && <p className="mt-0.5 text-[12px] text-muted-foreground">{c.reference}</p>}
          <div className="mt-4 space-y-3">
            <Row label="You" pct={c.yourProgress} color="var(--gold)" />
            <Row label={c.name.split(" ")[0]} pct={c.theirProgress} color={c.color} />
          </div>
          {c.lastActivity && <p className="mt-4 text-[11px] text-muted-foreground">{c.lastActivity}</p>}
        </div>
      )}
    </div>
  );
}

function Row({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[12px]">
        <span>{label}</span>
        <span className="tabular-nums text-muted-foreground">{pct}%</span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[color:var(--surface-2)]">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}