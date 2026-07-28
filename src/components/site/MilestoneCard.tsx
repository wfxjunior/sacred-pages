import type { Milestone } from "@/lib/mock/milestones";
import { Lock, Check } from "lucide-react";

export function MilestoneCard({ m }: { m: Milestone }) {
  const Icon = m.icon;
  const achieved = m.achieved;
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-5 transition ${
        achieved ? "border-border/60 bg-card" : "border-dashed border-border/60 bg-card/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background: achieved
              ? `color-mix(in oklab, ${m.accent} 14%, transparent)`
              : "color-mix(in oklab, var(--muted-foreground) 8%, transparent)",
            color: achieved ? m.accent : "var(--muted-foreground)",
          }}
        >
          <Icon className="h-5 w-5" strokeWidth={1.6} />
        </span>
        {achieved ? (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{
              background: `color-mix(in oklab, ${m.accent} 14%, transparent)`,
              color: m.accent,
            }}
          >
            <Check className="h-3 w-3" strokeWidth={2.5} /> Reached
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Lock className="h-3 w-3" /> Ahead
          </span>
        )}
      </div>
      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>
        {m.category}
      </p>
      <p className="mt-1 font-serif text-lg leading-snug">{m.title}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{m.description}</p>
      {achieved && m.date && (
        <p className="mt-4 text-[11px] text-muted-foreground">{m.date}</p>
      )}
    </div>
  );
}