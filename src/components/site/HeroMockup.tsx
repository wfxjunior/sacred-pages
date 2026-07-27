import { useMemo } from "react";
import { BookOpen, Search, MessageCircle, Sparkles, Check } from "lucide-react";
import { buildGrid } from "@/lib/word-search";
import { TODAY } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

export function HeroMockup() {
  const { t } = useI18n();
  const size = 10;
  const { grid, placements } = useMemo(
    () => buildGrid(TODAY.words.slice(0, 5), size),
    [],
  );

  const foundWords = new Set(["GRACE", "FAITH", "PEACE"]);
  const highlighted = new Set<string>();
  placements
    .filter((p) => foundWords.has(p.word))
    .forEach((p) => {
      for (let i = 0; i < p.word.length; i++) {
        highlighted.add(`${p.row + p.dr * i},${p.col + p.dc * i}`);
      }
    });

  const tabs = [
    { key: "read", icon: BookOpen, label: t("mock.tab.read") },
    { key: "search", icon: Search, label: t("mock.tab.search"), active: true },
    { key: "reflect", icon: MessageCircle, label: t("mock.tab.reflect") },
    { key: "pray", icon: Sparkles, label: t("mock.tab.pray") },
  ];

  return (
    <div className="relative">
      {/* Soft ambient glow */}
      <div
        aria-hidden
        className="absolute -inset-10 -z-10 rounded-[3rem] opacity-60 blur-2xl"
        style={{
          background:
            "radial-gradient(55% 55% at 30% 20%, color-mix(in oklab, var(--gold) 22%, transparent), transparent 65%), radial-gradient(45% 45% at 80% 85%, color-mix(in oklab, var(--sage) 18%, transparent), transparent 65%)",
        }}
      />

      <div
        className="overflow-hidden rounded-[28px] border border-border/60 bg-card/95 backdrop-blur"
        style={{
          boxShadow:
            "0 40px 80px -40px rgba(43,43,43,0.28), 0 12px 32px -20px rgba(43,43,43,0.12)",
        }}
      >
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "color-mix(in oklab, var(--walnut) 30%, transparent)" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "color-mix(in oklab, var(--gold) 40%, transparent)" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "color-mix(in oklab, var(--sage) 40%, transparent)" }} />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>
            {t("hero.label")}
          </p>
          <div className="w-10" />
        </div>

        {/* Header */}
        <div className="px-7 pt-7">
          <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: "var(--gold)" }}>
            {TODAY.reference}
          </p>
          <h3 className="mt-2 font-serif text-2xl leading-tight md:text-[26px]">
            {TODAY.title}
          </h3>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex items-center gap-1 border-b border-border/50 px-5">
          {tabs.map((tab) => (
            <div
              key={tab.key}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs transition ${
                tab.active
                  ? "border-current font-medium"
                  : "border-transparent text-muted-foreground"
              }`}
              style={tab.active ? { color: "var(--gold)" } : undefined}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="grid gap-5 p-6 md:grid-cols-[1.15fr_1fr] md:p-7">
          {/* Word search grid */}
          <div
            className="grid gap-1 rounded-2xl border border-border/60 p-3"
            style={{
              gridTemplateColumns: `repeat(${size}, minmax(0,1fr))`,
              background: "color-mix(in oklab, var(--ivory) 60%, transparent)",
            }}
          >
            {grid.map((row, r) =>
              row.map((letter, c) => {
                const hit = highlighted.has(`${r},${c}`);
                return (
                  <div
                    key={`${r}-${c}`}
                    className="flex aspect-square items-center justify-center rounded-md text-[11px] font-medium uppercase transition"
                    style={{
                      background: hit
                        ? "color-mix(in oklab, var(--gold) 26%, transparent)"
                        : "transparent",
                      color: hit ? "var(--ink)" : "color-mix(in oklab, var(--ink) 70%, transparent)",
                    }}
                  >
                    {letter}
                  </div>
                );
              }),
            )}
          </div>

          {/* Side panel */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-1.5">
              {TODAY.words.slice(0, 5).map((w) => {
                const done = foundWords.has(w);
                return (
                  <span
                    key={w}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider transition ${
                      done ? "border-transparent" : "border-border text-muted-foreground"
                    }`}
                    style={
                      done
                        ? {
                            color: "var(--sage)",
                            background: "color-mix(in oklab, var(--sage) 14%, transparent)",
                          }
                        : undefined
                    }
                  >
                    {done && <Check className="h-2.5 w-2.5" />}
                    {w}
                  </span>
                );
              })}
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>{t("mock.progress")}</span>
                <span>3 / 5 {t("mock.wordsFound")}</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "color-mix(in oklab, var(--walnut) 12%, transparent)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: "60%",
                    background: "linear-gradient(90deg, var(--gold), color-mix(in oklab, var(--gold) 70%, var(--sage)))",
                  }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border/50 p-4" style={{ background: "color-mix(in oklab, var(--ivory) 55%, transparent)" }}>
              <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>
                {t("mock.tab.reflect")}
              </p>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                {TODAY.reflection}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating streak badge */}
      <div
        className="absolute -bottom-5 -left-5 hidden items-center gap-2.5 rounded-2xl border border-border/60 bg-card px-4 py-3 md:flex"
        style={{ boxShadow: "0 20px 40px -20px rgba(43,43,43,0.25)" }}
      >
        <div
          className="grid h-9 w-9 place-items-center rounded-full"
          style={{ background: "color-mix(in oklab, var(--gold) 18%, transparent)", color: "var(--gold)" }}
        >
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <p className="font-serif text-lg">12</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">day streak</p>
        </div>
      </div>
    </div>
  );
}